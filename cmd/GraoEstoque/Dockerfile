# ---------- Stage 1: Build Go CLI tools ----------
# Use a lightweight Go base image to install CLI tools needed during the build stage
# such as Goose (for database migrations) and Swag (for Swagger documentation generation).
FROM golang:1.24.2-alpine AS go-tools

# Install Git (required by 'go install' to fetch modules)
RUN apk update && apk add --no-cache git

# Add Go binary directory to PATH
ENV PATH="/go/bin:$PATH"

# Install Goose and Swag CLI tools
RUN go install github.com/pressly/goose/v3/cmd/goose@latest && \
    go install github.com/swaggo/swag/cmd/swag@latest


# ---------- Stage 2: Final image (Node.js base with Go manually installed) ----------
# Use a Node.js Alpine base image and manually install Go 1.24.2.
# This allows the final container to run both Node.js tools (e.g., redoc-cli) and Go binaries.
FROM node:20-alpine AS final

# Install essential system tools required for building and installing software
RUN apk update && apk add --no-cache bash git curl tar

# Define environment variables for Go installation
ENV GO_VERSION=1.24.2
ENV GOROOT=/usr/local/go
ENV GOPATH=/go
ENV PATH=$GOPATH/bin:$GOROOT/bin:$PATH

# Download and install Go manually
RUN curl -LO https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz && \
    rm go${GO_VERSION}.linux-amd64.tar.gz

# Install redoc-cli globally using npm (for generating HTML API docs)
RUN npm install -g redoc-cli

# Copy Goose and Swag CLI tools from the previous build stage
COPY --from=go-tools /go/bin/goose /go/bin/goose
COPY --from=go-tools /go/bin/swag /go/bin/swag

# Set the working directory for the container
WORKDIR /app

# Copy startup scripts and make them executable
COPY resource/scripts/wait-for-it.sh /wait-for-it.sh
COPY resource/scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /wait-for-it.sh /entrypoint.sh

# Pre-copy module definition files for dependency caching
COPY go.work go.work.sum ./
COPY cmd/GraoEstoque/go.mod cmd/GraoEstoque/go.sum ./cmd/GraoEstoque/
COPY cmd/migrate_per_tenant/go.mod cmd/migrate_per_tenant/go.sum ./cmd/migrate_per_tenant/
COPY pkg/go.mod pkg/go.sum ./pkg/

# Sync Go workspaces and download all dependencies
RUN go work sync && go mod download all

# Copy the entire project into the container
COPY . .

# Generate Swagger YAML docs and HTML bundle using swag and redoc
RUN swag init --dir ./cmd/GraoEstoque --output ./docs --parseDependency
RUN redoc-cli bundle ./docs/swagger.yaml -o ./public/docs.html

# Build application binaries
RUN go build -o migrate_per_tenant ./cmd/migrate_per_tenant
RUN go build -o GraoEstoque ./cmd/GraoEstoque

# Expose the application port
EXPOSE 8081

# Set the container entrypoint script
ENTRYPOINT ["/entrypoint.sh"]
