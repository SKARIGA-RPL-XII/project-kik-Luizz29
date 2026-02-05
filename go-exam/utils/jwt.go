package utils

import (
	"time"

	"github.com/Luizz29/go-gin-project/config"
	"github.com/golang-jwt/jwt/v5"
)

func GenerateToken(userID uint, email string, roleID uint) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"role_id": roleID, // 🔥 INI YANG DIPAKAI RBAC
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(config.JWTSecret)
}

