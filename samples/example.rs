// Example Rust module for the Benom theme.
//
// Exercises comments, strings, escapes, numbers, keywords, types,
// functions, properties, decorators and operators.

/// Maximum number of retries.
const MAX_RETRIES: u32 = 3;

/// A small struct with derived traits.
#[derive(Debug, Clone, PartialEq)]
pub struct Config {
    pub name: String,
    pub retries: u32,
    pub tags: Vec<String>,
}

impl Config {
    /// Build a config with defaults.
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            retries: MAX_RETRIES,
            tags: vec!["theme".to_string()],
        }
    }

    /// A computed property-like accessor.
    pub fn label(&self) -> String {
        format!("{}-{}", self.name, self.retries)
    }
}

/// Build a query string, honoring retries.
pub fn fetch(config: &Config, base_url: &str) -> Result<String, String> {
    let mut attempts = 0u32;
    while attempts < config.retries {
        attempts += 1;
        let query = format!("{}?t={:.2}&attempt={}", base_url, 0.5, attempts);
        if !query.is_empty() {
            return Ok(query);
        }
    }
    Err(format!("failed after {} attempt(s)", attempts))
}

/// Entry point.
pub fn main() {
    let config = Config::new("benom");
    match fetch(&config, "https://example.test") {
        Ok(body) => println!("{} {} {:x} {:o} {}", config, body, 0xff, 0o17, 1_000),
        Err(err) => eprintln!("error: {}", err),
    }
}
