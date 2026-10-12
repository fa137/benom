"""Example Python module for the Benom theme.

Exercises comments, strings, escapes, numbers, keywords, types,
functions, properties, decorators and operators.
"""

from dataclasses import dataclass, field
from typing import Optional, Sequence

# A module-level constant (number).
MAX_RETRIES: int = 3
TIMEOUT: float = 0.5

# Escapes and string forms.
GREETING = "hello\tworld\n"
RAW = r"c:\new\path"
FIVEDOLLAR = "$5.00"

@dataclass(frozen=True)
class Config:
    """Immutable configuration with defaults."""

    name: str = "benom"
    retries: int = MAX_RETRIES
    tags: Sequence[str] = field(default_factory=tuple)

    @property
    def label(self) -> str:
        """A computed property."""
        return f"{self.name}-{self.retries:d}"

def fetch(config: Config, base_url: str, /, *, verbose: bool = False) -> Optional[str]:
    """Fetch a resource, honoring retries and timeouts."""
    attempt = 0
    while attempt < config.retries:
        attempt += 1
        try:
            # Build the query string with an f-string.
            query = f"{base_url}?t={TIMEOUT:.2f}&attempt={attempt}"
            if verbose:
                print(f"GET {query}", end="\n")
            return query or None
        except ValueError as exc:
            print(f"failed: {exc!r}", file=None)
    return None

def main() -> None:
    cfg = Config(name="venom", retries=2)
    result = fetch(cfg, "https://example.test", verbose=True)
    assert result is not None and len(result) > 0
    print(cfg.label, result.upper(), 0xFF, 1_000, 3 + 4j)

if __name__ == "__main__":
    main()
