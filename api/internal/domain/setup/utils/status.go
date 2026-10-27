package utils

import (
	"context"
	"log"
	"time"

	"pocketrun-api/internal/database"
	usersRepo "pocketrun-api/internal/domain/user/repositories/users"
)

func CheckInitialStatus(mongoDatabase *database.MongoDB) {
	usersRepository := usersRepo.NewRepository(mongoDatabase)
	if !usersRepository.IsAvailable() {
		log.Println("[Setup] Warning: Database unavailable for initial status check")
		return
	}

	queryContext, cancelQuery := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelQuery()

	usersCount, countError := usersRepository.CountUsers(queryContext)
	if countError != nil {
		log.Printf("[Setup] Warning: Could not verify users count: %v", countError)
		return
	}

	if usersCount == 0 {
		log.Println("==================================================================")
		log.Println("  [PocketRun] INITIAL SETUP REQUIRED (Dokploy-style onboarding)  ")
		log.Println("  No users found in database. Initial setup mode is ACTIVE.       ")
		log.Println("  Access the web console to configure the initial Superadmin.     ")
		log.Println("==================================================================")
		return
	}

	log.Printf("[Setup] Platform operational with %d registered manager(s).", usersCount)
}

