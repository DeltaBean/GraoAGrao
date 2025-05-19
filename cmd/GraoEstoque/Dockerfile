# Use Golang 1.24.2 based on Alpine
FROM golang:1.24.2-alpine

RUN apk update && apk add --no-cache bash

WORKDIR /app

COPY go.work ./
COPY cmd/GraoEstoque/go.mod cmd/GraoEstoque/go.sum ./
COPY . .

COPY resource/scripts/wait-for-it.sh /wait-for-it.sh
COPY resource/scripts/entrypoint.sh /entrypoint.sh

RUN chmod +x /wait-for-it.sh /entrypoint.sh

RUN go mod download
RUN go build -o GraoEstoque ./cmd/GraoEstoque

EXPOSE 8081

ENTRYPOINT ["/entrypoint.sh"]
