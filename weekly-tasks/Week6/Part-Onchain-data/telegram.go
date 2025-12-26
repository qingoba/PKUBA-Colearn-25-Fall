package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

const BaseURL = "https://api.telegram.org/bot"

type TelegramBot struct {
	token  string
	chatID string
	apiURL string
	client *http.Client
}

type TelegramResponse struct {
	OK    bool   `json:"ok"`
	Error string `json:"error,omitempty"`
}

func NewTelegramBot(token, chatID string, baseURL ...string) *TelegramBot {
	url := BaseURL
	if len(baseURL) > 0 && baseURL[0] != "" {
		url = baseURL[0]
	}

	return &TelegramBot{
		token:  token,
		chatID: chatID,
		apiURL: fmt.Sprintf("%s%s", url, token),
		client: &http.Client{Timeout: 10 * time.Second},
	}
}

func (bot *TelegramBot) Close() {
	bot.client.CloseIdleConnections()
}

func (bot *TelegramBot) SendText(content string, parseMode ...string) map[string]interface{} {
	mode := "HTML"
	if len(parseMode) > 0 {
		mode = parseMode[0]
	}

	payload := map[string]interface{}{
		"chat_id":    bot.chatID,
		"text":       content,
		"parse_mode": mode,
	}

	return bot.sendMessage("sendMessage", payload)
}

func (bot *TelegramBot) sendMessage(method string, payload map[string]interface{}) map[string]interface{} {
	url := fmt.Sprintf("%s/%s", bot.apiURL, method)

	jsonData, err := json.Marshal(payload)
	if err != nil {
		fmt.Printf("Telegram send message failed: %v\n", err)
		return map[string]interface{}{"ok": false, "error": err.Error()}
	}

	resp, err := bot.client.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("Telegram send message failed: %v\n", err)
		return map[string]interface{}{"ok": false, "error": err.Error()}
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		fmt.Printf("Telegram send message failed: %v\n", err)
		return map[string]interface{}{"ok": false, "error": err.Error()}
	}

	if !result["ok"].(bool) {
		fmt.Printf("Telegram send message failed: %v\n", result)
	}

	return result
}

func main() {
	token := os.Getenv("TELEGRAM_TOKEN")
	chatID := os.Getenv("TELEGRAM_CHAT_ID")

	if token == "" || chatID == "" {
		fmt.Println("Please set TELEGRAM_TOKEN and TELEGRAM_CHAT_ID environment variables")
		return
	}

	bot := NewTelegramBot(token, chatID)
	defer bot.Close()

	result := bot.SendText("Hello from Go Telegram Bot!")
	fmt.Printf("Message sent: %v\n", result["ok"])
}
