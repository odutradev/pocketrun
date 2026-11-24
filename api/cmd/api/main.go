package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"pocketrun-api/internal/app"
	"pocketrun-api/internal/config"
	"pocketrun-api/internal/services/healthcheck"
	"pocketrun-api/internal/services/logger"
)

func main() {
	log := logger.New(os.Stdout)
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	if len(os.Args) > 1 && os.Args[1] == healthcheck.Command {
		if err := checkHealth(ctx); err != nil {
			log.Error("healthcheck", "error", err)
			stop()
			os.Exit(1)
		}
		return
	}

	if err := app.Run(ctx, log); err != nil {
		log.Error("run api", "error", err)
		stop()
		os.Exit(1)
	}
}

func checkHealth(ctx context.Context) error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	return healthcheck.Check(ctx, healthcheck.URL(cfg.Host, cfg.Port))
}
