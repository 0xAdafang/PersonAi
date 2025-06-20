FROM rust:1.78

WORKDIR /app

COPY . .

RUN cargo build --release

CMD ["./target/release/rust-core"]