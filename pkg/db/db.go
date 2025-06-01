package db

import (
	"context"
	"fmt"
	"os"
	"time"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	_ "github.com/lib/pq"

	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/jackc/pgx/v5/pgxpool"
)

var dbPool *pgxpool.Pool

// InitDB initializes the database connection pool
func InitDB() {
	user := os.Getenv("POSTGRES_USER")
	password := os.Getenv("POSTGRES_PASSWORD")
	dbname := os.Getenv("POSTGRES_DB")
	port := os.Getenv("POSTGRES_PORT")
	host := os.Getenv("POSTGRES_HOST")

	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s",
		user, password, host, port, dbname)

	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		logger.Log.Fatalf("Unable to parse database URL: %v", err)
	}

	// Set up the connection pool
	config.MaxConns = 20                       // Maximum number of connections in the pool
	config.MinConns = 5                        // Minimum number of idle connections
	config.HealthCheckPeriod = 1 * time.Minute // Check connection health periodically
	config.MaxConnLifetime = 30 * time.Minute  // Maximum lifetime of a connection
	config.MaxConnIdleTime = 10 * time.Minute  // Maximum idle time for a connection

	// Establish the connection pool
	dbPool, err = pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		logger.Log.Fatalf("Unable to create connection pool: %v", err)
	}

	// Test the database connection
	err = dbPool.Ping(context.Background())
	if err != nil {
		logger.Log.Fatalf("Unable to ping database: %v", err)
	}

	logger.Log.Info("Database connection pool initialized successfully")
}

// GetDB provides a thread-safe way to get the database pool
func GetDB() *pgxpool.Pool {
	return dbPool
}

// CloseDB gracefully closes the database connection pool
func CloseDB() {
	if dbPool != nil {
		dbPool.Close()
		logger.Log.Info("Database connection pool closed")
	}
}
