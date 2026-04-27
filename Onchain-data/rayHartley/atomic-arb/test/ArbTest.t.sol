// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {ArbBot, Path, ProtocolType} from "../src/ArbBot.sol";

/**
 * @title  ArbTest
 * @notice Re-simulates the atomic arb tx on a mainnet fork.
 *
 * Original tx:
 *   https://etherscan.io/tx/0x9edea0b66aece76f0bc7e185f9ce5cac81ce41bdd1ec4d3cf1907274bc8aa730
 *
 * Block: 23042800
 * Fork at: the state immediately before the above tx executes.
 *
 * Arb path:
 *   WETH → EMP   (Uniswap V3)
 *   EMP  → pEMP  (Peapods bond)
 *   pEMP → pfWETH (Uniswap V2)
 *   pfWETH → WETH (Peapods debond)
 *
 * Ground truth (from original tx):
 *   amountIn  = 562 611 020 353 505 727  wei WETH
 *   amountOut = 569 640 303 749 166 946  wei WETH
 *   profit    =   7 029 283 395 661 219  wei WETH  (~0.007 ETH)
 */
contract ArbTest is Test {
    // ── Token addresses ────────────────────────────────────────────────────
    address constant WETH   = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    // pEMP – Peapods pod token (pod contract IS the token)
    address constant PEMP_POD  = 0x4343A06B930Cf7Ca0459153C62CC5a47582099E1;

    // pfWETH – Peapods pod token (pod contract IS the token)
    address constant PFWETH_POD = 0x395dA89bDb9431621A75DF4e2E3B993Acc2CaB3D;

    // ── Protocol addresses ─────────────────────────────────────────────────
    address constant V3_WETH_EMP_POOL  = 0xe092769bc1fa5262D4f48353f90890Dcc339BF80;
    address constant V2_PEMP_PFWETH    = 0x9FF3226906eB460E11d88f4780C84457A2f96C3e;

    // ── Ground truth ───────────────────────────────────────────────────────
    uint256 constant AMOUNT_IN  = 562_611_020_353_505_727;
    uint256 constant AMOUNT_OUT = 569_640_303_749_166_946;

    // ── State ──────────────────────────────────────────────────────────────
    uint256 forkId;
    ArbBot  bot;

    // EMP token address resolved at runtime from the V3 pool
    address empToken;

    // ─────────────────────────────────────────────────────────────────────
    //  Setup
    // ─────────────────────────────────────────────────────────────────────

    function setUp() public {
        // Fork at the state immediately before the target tx executes.
        // Foundry resolves tx hash → block and positions state before that tx.
        forkId = vm.createFork(
            vm.envString("RPC_URL"),
            bytes32(0x9edea0b66aece76f0bc7e185f9ce5cac81ce41bdd1ec4d3cf1907274bc8aa730)
        );

        // Deploy bot and make it persistent across fork switches
        bot = new ArbBot();
        vm.makePersistent(address(bot));
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Helper: resolve EMP address from V3 pool
    // ─────────────────────────────────────────────────────────────────────

    function _resolveEmp() internal view returns (address) {
        // V3 pool stores token0 < token1 (address ordering).
        // WETH = 0xC02a…, so whichever token is not WETH is EMP.
        (bool ok0, bytes memory d0) = V3_WETH_EMP_POOL.staticcall(abi.encodeWithSignature("token0()"));
        require(ok0, "token0 call failed");
        address t0 = abi.decode(d0, (address));
        return t0 == WETH ? _token1(V3_WETH_EMP_POOL) : t0;
    }

    function _token1(address pool) internal view returns (address) {
        (, bytes memory d) = pool.staticcall(abi.encodeWithSignature("token1()"));
        return abi.decode(d, (address));
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Main test
    // ─────────────────────────────────────────────────────────────────────

    function test_arb() public {
        vm.selectFork(forkId);
        vm.warp(block.timestamp + 12); // simulate next block

        // Resolve EMP token address from on-chain pool state
        empToken = _resolveEmp();
        console.log("EMP token address:", empToken);

        // Give bot the initial WETH (simulates flash swap capital)
        deal(WETH, address(bot), AMOUNT_IN);

        // ── Build the arb path ─────────────────────────────────────────────
        //
        //  Hop 0: WETH → EMP   via Uniswap V3 pool
        //  Hop 1: EMP  → pEMP  via Peapods bond
        //  Hop 2: pEMP → pfWETH via Uniswap V2 pair
        //  Hop 3: pfWETH → WETH via Peapods debond

        Path[] memory paths = new Path[](4);

        paths[0] = Path({
            edge:         V3_WETH_EMP_POOL,
            tokenIn:      WETH,
            tokenOut:     empToken,
            protocolType: ProtocolType.UniswapV3
        });

        paths[1] = Path({
            edge:         PEMP_POD,    // pod contract = pEMP token
            tokenIn:      empToken,
            tokenOut:     PEMP_POD,   // tokenOut == edge (pod IS the ERC-20)
            protocolType: ProtocolType.PeapodsB
        });

        paths[2] = Path({
            edge:         V2_PEMP_PFWETH,
            tokenIn:      PEMP_POD,
            tokenOut:     PFWETH_POD,
            protocolType: ProtocolType.UniswapV2
        });

        paths[3] = Path({
            edge:         PFWETH_POD,  // pod contract = pfWETH token
            tokenIn:      PFWETH_POD, // tokenIn == edge (pod IS the ERC-20)
            tokenOut:     WETH,
            protocolType: ProtocolType.PeapodsD
        });

        // ── Execute ────────────────────────────────────────────────────────
        uint256 amountOut = bot.executeExactInput(paths, AMOUNT_IN);

        console.log("amountIn  (wei):", AMOUNT_IN);
        console.log("amountOut (wei):", amountOut);
        console.log("profit    (wei):", amountOut - AMOUNT_IN);

        // ── Verify matches ground truth ────────────────────────────────────
        assertEq(amountOut, AMOUNT_OUT, "amountOut does not match ground truth");
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Step-by-step hop tests (useful for debugging each leg individually)
    // ─────────────────────────────────────────────────────────────────────

    function test_hop0_weth_to_emp() public {
        vm.selectFork(forkId);
        vm.warp(block.timestamp + 12);

        empToken = _resolveEmp();
        deal(WETH, address(bot), AMOUNT_IN);

        Path[] memory paths = new Path[](1);
        paths[0] = Path({
            edge:         V3_WETH_EMP_POOL,
            tokenIn:      WETH,
            tokenOut:     empToken,
            protocolType: ProtocolType.UniswapV3
        });

        uint256 out = bot.executeExactInput(paths, AMOUNT_IN);
        console.log("Hop 0 out (EMP wei):", out);
        assertGt(out, 0, "No EMP received");
    }

    function test_hop0_1_weth_to_pemp() public {
        vm.selectFork(forkId);
        vm.warp(block.timestamp + 12);

        empToken = _resolveEmp();
        deal(WETH, address(bot), AMOUNT_IN);

        Path[] memory paths = new Path[](2);
        paths[0] = Path({
            edge:         V3_WETH_EMP_POOL,
            tokenIn:      WETH,
            tokenOut:     empToken,
            protocolType: ProtocolType.UniswapV3
        });
        paths[1] = Path({
            edge:         PEMP_POD,
            tokenIn:      empToken,
            tokenOut:     PEMP_POD,
            protocolType: ProtocolType.PeapodsB
        });

        uint256 out = bot.executeExactInput(paths, AMOUNT_IN);
        console.log("Hop 0-1 out (pEMP wei):", out);
        assertGt(out, 0, "No pEMP received");
    }

    function test_hop0_1_2_weth_to_pfweth() public {
        vm.selectFork(forkId);
        vm.warp(block.timestamp + 12);

        empToken = _resolveEmp();
        deal(WETH, address(bot), AMOUNT_IN);

        Path[] memory paths = new Path[](3);
        paths[0] = Path({
            edge:         V3_WETH_EMP_POOL,
            tokenIn:      WETH,
            tokenOut:     empToken,
            protocolType: ProtocolType.UniswapV3
        });
        paths[1] = Path({
            edge:         PEMP_POD,
            tokenIn:      empToken,
            tokenOut:     PEMP_POD,
            protocolType: ProtocolType.PeapodsB
        });
        paths[2] = Path({
            edge:         V2_PEMP_PFWETH,
            tokenIn:      PEMP_POD,
            tokenOut:     PFWETH_POD,
            protocolType: ProtocolType.UniswapV2
        });

        uint256 out = bot.executeExactInput(paths, AMOUNT_IN);
        console.log("Hop 0-2 out (pfWETH wei):", out);
        assertGt(out, 0, "No pfWETH received");
    }
}
