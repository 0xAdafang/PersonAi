FROM rust:1.77 AS rust-builder
WORKDIR /build
COPY rust-core ./rust-core
WORKDIR /build/rust-core
RUN cargo build --release


FROM golang:1.24-alpine AS go-builder
WORKDIR /app


RUN apk add --no-cache git


COPY go-api/ .


COPY --from=rust-builder /build/rust-core/target/release/rust-core /app/rust-core


RUN go build -o personai-api .

EXPOSE 8080
CMD ["./personai-api"]
