#!/bin/sh

# Check required vars
if [ -z "$POSTGRES_HOST" ] || [ -z "$POSTGRES_PORT" ]; then
  echo "POSTGRES_HOST and POSTGRES_PORT must be set"
  exit 1
fi

echo "Waiting for DB at $POSTGRES_HOST:$POSTGRES_PORT..."
/wait-for-it.sh "$POSTGRES_HOST:$POSTGRES_PORT" -- ./GraoEstoque
