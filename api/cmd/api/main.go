package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"pocketrun-api/internal/app"
	"pocketrun-api/internal/services/logger"
)

func main() {
	log := logger.New(os.Stdout)
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	if err := app.Run(ctx, log); err != nil {
		log.Error("run api", "error", err)
		stop()
		os.Exit(1)
	}
}
