package utils

import (
	"math/rand"
	"time"
)

func GenerateExamToken() string {
	const digits = "0123456789"

	rand.Seed(time.Now().UnixNano()) // ⭐ penting biar random

	b := make([]byte, 6)
	for i := range b {
		b[i] = digits[rand.Intn(len(digits))]
	}

	return string(b)
}
