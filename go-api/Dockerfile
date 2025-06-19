# syntax=docker/dockerfile:1

FROM golang:1.24-alpine

WORKDIR /app

COPY go.mod ./

RUN go mod download

COPY . .

RUN go build -o story-chan-api .

EXPOSE 8080

CMD ["./story-chan-api"]

COPY ../rust-core/target/release/rust-core /app/rust-core
