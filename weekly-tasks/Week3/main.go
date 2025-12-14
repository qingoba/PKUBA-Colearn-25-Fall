package main

import (
	"context"
	"fmt"
	"log"
	"math/big" 
	// go 标准库

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient" // 如果提示缺少依赖, 按照给出的报错信息安装即可
)

func main() {
	ctx := context.Background()

	client, err := ethclient.Dial("https://ethereum-sepolia-rpc.publicnode.com")
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	header, err := client.HeaderByNumber(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Current block: %s\n", header.Number.String())

	targetBlock := big.NewInt(123456)
	block, err := client.BlockByNumber(ctx, targetBlock)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Block #%s hash: %s\n", block.Number().String(), block.Hash().Hex())
	fmt.Printf("Parent hash: %s\n", block.ParentHash().Hex())
	fmt.Printf("Tx count: %d\n", len(block.Transactions()))
//==========================
	txHash := common.HexToHash("0x903bd6b44ce5cfa9269d456d2e7a10e3d8a485281c1c46631ec8f79e48f7accb") //测试用交易hash, 你可以替换成任何你想查询的交易hash
//=========================
	tx, isPending, err := client.TransactionByHash(ctx, txHash)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Tx pending: %t\n", isPending)
	if to := tx.To(); to != nil {
		fmt.Printf("To: %s\n", to.Hex())
	} else {
		fmt.Println("To: contract creation")
	}
	fmt.Printf("Value (wei): %s\n", tx.Value().String())

	receipt, err := client.TransactionReceipt(ctx, txHash)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Receipt status: %d\n", receipt.Status)
	fmt.Printf("Logs: %d entries\n", len(receipt.Logs))
}

