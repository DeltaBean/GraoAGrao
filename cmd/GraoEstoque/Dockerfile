# Use Golang 1.24.2 based on Alpine
FROM golang:1.24.2-alpine

RUN apk update && apk add --no-cache bash

WORKDIR /app

COPY resource/scripts/wait-for-it.sh /wait-for-it.sh
COPY resource/scripts/entrypoint.sh /entrypoint.sh

WORKDIR /app

COPY resource/scripts/wait-for-it.sh /wait-for-it.sh
COPY resource/scripts/entrypoint.sh /entrypoint.sh

COPY . .

# Execute permissions
RUN chmod +x /wait-for-it.sh /entrypoint.sh

# Download ALL modules using go.work
RUN go work sync
RUN go mod download all

RUN go build -o GraoEstoque ./cmd/GraoEstoque

# Build per-tenant migration CLI
RUN go build -o migrate_per_tenant ./cmd/migrate_per_tenant

# Install goose CLI
RUN go install github.com/pressly/goose/v3/cmd/goose@latest

# Add goose to path
ENV PATH="/go/bin:${PATH}"

EXPOSE 8081

ENTRYPOINT ["/entrypoint.sh"]
