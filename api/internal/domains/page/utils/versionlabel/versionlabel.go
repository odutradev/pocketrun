package versionlabel

import "fmt"

func Label(number int) string {
	return fmt.Sprintf("1.%d", max(number, 1)-1)
}
