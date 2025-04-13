#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status

echo "Starting manual migration..."

# Check for required environment variables
if [[ -z "$POSTGRES_USER" || -z "$POSTGRES_PASSWORD" || -z "$POSTGRES_DB" ]]; then
    echo "Missing required environment variables (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB)."
    exit 1
fi

# Directory containing SQL migration files
MIGRATION_DIR="/docker-entrypoint-initdb.d"

# Iterate over all SQL files in the migration directory
for file in $MIGRATION_DIR/*.sql; do
    if [[ -f "$file" ]]; then
        echo "Executing migration: $file"
        psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$file"
        echo "Successfully executed: $file"
    else
        echo "No migration files found in $MIGRATION_DIR"
    fi
done

echo "Manual migration completed successfully!"
