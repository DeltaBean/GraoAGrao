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

RUN go mod download



# Build the binary for the GraoEstoque service; adjust the build path to point to cmd/GraoEstoque
RUN go build -o GraoEstoque ./cmd/GraoEstoque

# Expose the port your GraoEstoque listens on
EXPOSE 8081

# Start the GraoEstoque
CMD ["./GraoEstoque"]
