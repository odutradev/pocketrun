package main

import (
	"pocketrun-api/internal/database"
	setupUtils "pocketrun-api/internal/domain/setup/utils"
	"pocketrun-api/internal/router"
)

func main() {
	mongoDatabase := database.ConnectMongoDB()
	defer mongoDatabase.Close()

	setupUtils.CheckInitialStatus(mongoDatabase)

	router.StartServers(mongoDatabase)
}
