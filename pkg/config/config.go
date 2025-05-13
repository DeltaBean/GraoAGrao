package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/pressly/goose/v3"
)

func init() {
	initializeEnvironment()

	if os.Getenv("STAGE") == "DEV" {
		goose.SetVerbose(true)
	}
}

func initializeEnvironment() {
	err := godotenv.Load()
	if err != nil {

		log.Println("Error loading .env file")
		log.Println("Environment variables will be loaded from the system")

		return
	}

	log.Println("Environment variables loaded successfully from .env")
}
