package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"pocketrun-api/internal/config"
	"pocketrun-api/internal/database"
	"pocketrun-api/internal/handler"
)

func main() {
	cfg := config.Load()

	mongoDB, err := database.ConnectMongoDB(cfg.MongoURI, cfg.MongoDBName)
	if err != nil {
		log.Printf("[MongoDB] Aviso: Não foi possível conectar ao banco de dados: %v", err)
	} else {
		defer func() {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			if err := mongoDB.Close(ctx); err != nil {
				log.Printf("[MongoDB] Erro ao fechar conexão: %v", err)
			}
		}()
	}

	router := handler.NewRouter(cfg.AllowedOrigins)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Server initializing in %s mode on http://localhost:%s", cfg.Env, cfg.Port)

	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

