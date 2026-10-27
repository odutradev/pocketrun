package main

import (
	"pocketrun-api/internal/database"
	"pocketrun-api/internal/domain/setup"
	"pocketrun-api/internal/router"
)

func main() {
	mongoDB := database.ConnectMongoDB()
	defer mongoDB.Close()

	setup.CheckInitialStatus(mongoDB)

	router.StartServers(mongoDB)
}
