use std::io::{self, Read};
fn main() {
    let mut buffer = String::new();
    io::stdin().read_to_string(&mut buffer).unwrap();

    println!("Prompt construit : [FAKE PROMPT pour '{}']", buffer.trim());
}
