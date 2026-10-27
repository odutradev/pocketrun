package main

import (
	"pocketrun-api/internal/database"
	"pocketrun-api/internal/domain/setup"
	"pocketrun-api/internal/router"
)

func main() {
	mongoDatabase := database.ConnectMongoDB()
	defer mongoDatabase.Close()

	setup.CheckInitialStatus(mongoDatabase)

	router.StartServers(mongoDatabase)
}
