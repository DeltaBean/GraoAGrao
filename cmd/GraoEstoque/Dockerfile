# Use Golang 1.24.2 based on Alpine
FROM golang:1.24.2-alpine

RUN apk update && apk add --no-cache bash

WORKDIR /app

# Copy the go.work file to enable multi-module workspace
COPY go.work ./

# Copy the GraoEstoque module files (go.mod, go.sum) from cmd/GraoEstoque
COPY cmd/GraoEstoque/go.mod cmd/GraoEstoque/go.sum ./

# Copy the rest of the project, so that pkg is available (this copies the entire repository)
COPY . .

# Copy the wait-for-it.sh script to wait for the database to be ready
COPY resource/scripts/wait-for-it.sh /wait-for-it.sh

# Set permissions for the wait-for-it.sh script 
RUN chmod +x /wait-for-it.sh

RUN go mod download

# Build the binary for the GraoEstoque service; adjust the build path to point to cmd/GraoEstoque
RUN go build -o GraoEstoque ./cmd/GraoEstoque

# Expose the port your GraoEstoque listens on
EXPOSE 8081

# Start wait-for-it.sh to wait for the database to be ready, then run the GraoEstoque binary
# The -- flag is used to separate the wait-for-it arguments from the command to run
# The db:5432 is the service name and port of the database in the Docker Compose file
# The GraoEstoque binary will be executed after the database is ready
CMD ["/wait-for-it.sh", "db:5432", "--", "./GraoEstoque"]