# ---------- Final stage: Node.js base with Go manually installed ----------
# Use a Node.js Debian base image so we can install Go tools and MuPDF dependencies (for go-fitz).
FROM node:20-bullseye AS final

# Install essential system tools and Go build dependencies
RUN apt-get update && apt-get install -y \
    bash git curl tar gcc g++ pkg-config \
    libmupdf-dev mupdf-tools libcairo2-dev libfreetype6-dev libharfbuzz-dev libjpeg-dev

# Define environment variables for Go installation
ENV GO_VERSION=1.24.2
ENV GOROOT=/usr/local/go
ENV GOPATH=/go
ENV GOBIN=/usr/local/bin
ENV PATH=$GOBIN:$GOROOT/bin:$GOPATH/bin:$PATH
ENV CGO_ENABLED=1

# Download and install Go manually
RUN curl -LO https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz && \
    rm go${GO_VERSION}.linux-amd64.tar.gz

# Install redoc-cli globally using npm (for generating HTML API docs)
RUN npm install -g redoc-cli

# Install Goose and Swag CLI tools
RUN go install github.com/pressly/goose/v3/cmd/goose@latest && \
    go install github.com/swaggo/swag/cmd/swag@latest

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
