package main

import (
	"fmt"
	"log"
	"net/http"

	"pocketrun-api/internal/config"
	"pocketrun-api/internal/handler"
)

func main() {
	cfg := config.Load()

	router := handler.NewRouter(cfg.AllowedOrigins)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Server initializing in %s mode on http://localhost:%s", cfg.Env, cfg.Port)

	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
