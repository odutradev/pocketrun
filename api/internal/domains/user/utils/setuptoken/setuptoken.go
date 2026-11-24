package setuptoken

import (
	"crypto/rand"
	"crypto/subtle"
	"fmt"
	"math/big"
	"strings"
)

const (
	Alphabet    = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	Length      = 8
	groupLength = 4
	separator   = "-"
)

func Generate() (string, error) {
	limit := big.NewInt(int64(len(Alphabet)))
	var token strings.Builder
	for index := range Length {
		if index > 0 && index%groupLength == 0 {
			token.WriteString(separator)
		}
		position, err := rand.Int(rand.Reader, limit)
		if err != nil {
			return "", fmt.Errorf("generate setup token: %w", err)
		}
		token.WriteByte(Alphabet[position.Int64()])
	}
	return token.String(), nil
}

func Normalize(value string) string {
	return strings.ToUpper(strings.NewReplacer(separator, "", " ", "").Replace(strings.TrimSpace(value)))
}

func Matches(expected, given string) bool {
	if expected == "" {
		return false
	}
	return subtle.ConstantTimeCompare([]byte(Normalize(expected)), []byte(Normalize(given))) == 1
}
