// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// ─────────────────────────────────────────────
//  Minimal interfaces
// ─────────────────────────────────────────────

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IUniswapV3Pool {
    function swap(
        address recipient,
        bool zeroForOne,
        int256 amountSpecified,
        uint160 sqrtPriceLimitX96,
        bytes calldata data
    ) external returns (int256 amount0, int256 amount1);

    function token0() external view returns (address);
    function token1() external view returns (address);
}

interface IUniswapV2Pair {
    function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data) external;
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function token0() external view returns (address);
}

interface IPeapodsPod {
    function bond(address token, uint256 amount) external;
    function debond(uint256 amount, address[] memory tokens, uint8[] memory percentages) external;
}

// ─────────────────────────────────────────────
//  Path struct
// ─────────────────────────────────────────────

/// @dev Protocol types supported by ArbBot
enum ProtocolType {
    UniswapV3,   // 0  – swap via pool.swap() with callback
    UniswapV2,   // 1  – push tokenIn then call pair.swap()
    PeapodsB,    // 2  – Peapods bond(): deposit base token, receive pod token
    PeapodsD     // 3  – Peapods debond(): redeem pod token, receive base token
}

/// @dev One hop of the arbitrage route
struct Path {
    address edge;           // Pool contract (V2/V3) or Pod contract (Peapods)
    address tokenIn;        // Token sold in this hop
    address tokenOut;       // Token received in this hop
    ProtocolType protocolType;
}

// ─────────────────────────────────────────────
//  ArbBot
// ─────────────────────────────────────────────

/**
 * @title  ArbBot
 * @notice Executes a multi-hop atomic arbitrage path.
 *
 * Arbitrage path re-simulated:
 *   WETH → EMP   (Uniswap V3 pool 0xe092…)
 *   EMP  → pEMP  (Peapods bond  0x4343…)
 *   pEMP → pfWETH (Uniswap V2 pair 0x9ff3…)
 *   pfWETH → WETH (Peapods debond 0x395d…)
 *
 * Original tx: 0x9edea0b66aece76f0bc7e185f9ce5cac81ce41bdd1ec4d3cf1907274bc8aa730
 * Block: 23042800
 */
contract ArbBot {
    // ── Uniswap V3 callback guard ──────────────────────────────────────────
    // Set to pool address right before calling pool.swap(); cleared afterwards.
    // Prevents arbitrary contracts from calling the callback.
    address private _v3Pool;

    // ── Tick-math sentinel values (from Uniswap V3 TickMath) ──────────────
    uint160 private constant MIN_SQRT_RATIO_PLUS_ONE = 4295128740;
    uint160 private constant MAX_SQRT_RATIO_MINUS_ONE =
        1461446703485210103287273052203988822378723970341;

    // ─────────────────────────────────────────────────────────────────────
    //  Entry point
    // ─────────────────────────────────────────────────────────────────────

    /**
     * @param paths     Array of hops describing the full arb path.
     * @param amountIn  Input amount for the first hop (must already be in this contract).
     * @return amountOut Final token balance after all hops.
     */
    function executeExactInput(
        Path[] memory paths,
        uint256 amountIn
    ) external returns (uint256 amountOut) {
        uint256 current = amountIn;

        for (uint256 i = 0; i < paths.length; i++) {
            Path memory p = paths[i];

            if (p.protocolType == ProtocolType.UniswapV3) {
                current = _swapV3(p, current);
            } else if (p.protocolType == ProtocolType.UniswapV2) {
                current = _swapV2(p, current);
            } else if (p.protocolType == ProtocolType.PeapodsB) {
                current = _peapodsBond(p, current);
            } else {
                // ProtocolType.PeapodsD
                current = _peapodsDebond(p, current);
            }
        }

        return current;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Uniswap V3
    // ─────────────────────────────────────────────────────────────────────

    function _swapV3(Path memory p, uint256 amountIn) internal returns (uint256 amountOut) {
        // Determine swap direction from token ordering
        address token0 = IUniswapV3Pool(p.edge).token0();
        bool zeroForOne = (p.tokenIn == token0);

        uint160 sqrtLimit = zeroForOne ? MIN_SQRT_RATIO_PLUS_ONE : MAX_SQRT_RATIO_MINUS_ONE;

        // Arm callback guard
        _v3Pool = p.edge;

        (int256 delta0, int256 delta1) = IUniswapV3Pool(p.edge).swap(
            address(this),
            zeroForOne,
            int256(amountIn),   // positive = exact input
            sqrtLimit,
            abi.encode(p.tokenIn)
        );

        // Disarm callback guard
        _v3Pool = address(0);

        // Output is the negative delta on the "out" side
        amountOut = uint256(zeroForOne ? -delta1 : -delta0);
    }

    /**
     * @notice Uniswap V3 callback – called by the pool after swap to collect tokenIn.
     * @dev    The pool sends tokenOut to us first, then calls this to collect tokenIn.
     *         We pay with the tokens already in this contract (supplied via deal() in tests).
     */
    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external {
        require(msg.sender == _v3Pool, "ArbBot: invalid v3 callback");

        address tokenIn = abi.decode(data, (address));
        // Positive delta = tokens we owe to the pool
        uint256 amountOwed = amount0Delta > 0
            ? uint256(amount0Delta)
            : uint256(amount1Delta);

        IERC20(tokenIn).transfer(msg.sender, amountOwed);
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Uniswap V2
    // ─────────────────────────────────────────────────────────────────────

    function _swapV2(Path memory p, uint256 amountIn) internal returns (uint256 amountOut) {
        IUniswapV2Pair pair = IUniswapV2Pair(p.edge);
        bool isToken0In = (p.tokenIn == pair.token0());

        (uint112 r0, uint112 r1, ) = pair.getReserves();
        uint256 rIn  = isToken0In ? uint256(r0) : uint256(r1);
        uint256 rOut = isToken0In ? uint256(r1) : uint256(r0);

        // Standard V2 formula with 0.3 % fee
        uint256 amountInWithFee = amountIn * 997;
        amountOut = (amountInWithFee * rOut) / (rIn * 1000 + amountInWithFee);

        // Push tokenIn to pair, then collect tokenOut
        IERC20(p.tokenIn).transfer(p.edge, amountIn);

        (uint256 out0, uint256 out1) = isToken0In
            ? (uint256(0), amountOut)
            : (amountOut, uint256(0));

        pair.swap(out0, out1, address(this), "");
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Peapods – bond (base token → pod token)
    // ─────────────────────────────────────────────────────────────────────

    function _peapodsBond(Path memory p, uint256 amountIn) internal returns (uint256 amountOut) {
        // Pod contract needs allowance to pull tokenIn from us
        IERC20(p.tokenIn).approve(p.edge, amountIn);

        // p.tokenOut == p.edge: pod contract IS the pod token (ERC-20)
        uint256 before = IERC20(p.tokenOut).balanceOf(address(this));
        IPeapodsPod(p.edge).bond(p.tokenIn, amountIn);
        amountOut = IERC20(p.tokenOut).balanceOf(address(this)) - before;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Peapods – debond (pod token → base token)
    // ─────────────────────────────────────────────────────────────────────

    function _peapodsDebond(Path memory p, uint256 amountIn) internal returns (uint256 amountOut) {
        // p.tokenIn == p.edge: pod contract IS the pod token.
        // No external approve needed – the pod burns from msg.sender internally.
        uint256 before = IERC20(p.tokenOut).balanceOf(address(this));

        address[] memory tokens = new address[](0);
        uint8[]   memory percs  = new uint8[](0);
        IPeapodsPod(p.edge).debond(amountIn, tokens, percs);

        amountOut = IERC20(p.tokenOut).balanceOf(address(this)) - before;
    }
}
