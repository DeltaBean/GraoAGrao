# Use Golang 1.24.2 based on Alpine
FROM golang:1.24.2-alpine

# Install bash, git, nodejs, npm (for swag and redoc)
RUN apk update && apk add --no-cache bash git nodejs npm

# Add go install path to PATH
ENV PATH="/go/bin:$PATH"

WORKDIR /app

COPY resource/scripts/wait-for-it.sh /wait-for-it.sh
COPY resource/scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /wait-for-it.sh /entrypoint.sh

# Copy go mod files early to leverage caching
COPY go.work go.work.sum ./
COPY cmd/GraoEstoque/go.mod cmd/GraoEstoque/go.sum ./cmd/GraoEstoque/
COPY cmd/migrate_per_tenant/go.mod cmd/migrate_per_tenant/go.sum ./cmd/migrate_per_tenant/
COPY pkg/go.mod pkg/go.sum ./pkg/

# Sync and download dependencies
RUN go work sync
RUN go mod download all

# Copy full project (see .dockerignore)
COPY . .

# Install goose, swag, and redoc-cli
RUN go install github.com/pressly/goose/v3/cmd/goose@latest && \
    go install github.com/swaggo/swag/cmd/swag@latest && \
    npm install -g redoc-cli

# Generate swagger docs
RUN swag init --dir ./cmd/GraoEstoque --output ./docs --parseDependency

# Create static docs HTML using redoc
RUN redoc-cli bundle ./docs/swagger.yaml -o ./public/docs.html

# Build executables
RUN go build -o migrate_per_tenant ./cmd/migrate_per_tenant
RUN go build -o GraoEstoque ./cmd/GraoEstoque

# Expose port
EXPOSE 8081

# Entrypoint
ENTRYPOINT ["/entrypoint.sh"]
