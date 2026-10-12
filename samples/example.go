// Package example is a Go sample for the Benom theme.
//
// It exercises comments, strings, escapes, numbers, keywords,
// types, functions, properties, decorators and operators.
package example

import (
	"errors"
	"fmt"
	"strings"
)

// MaxRetries is the maximum number of fetch attempts.
const MaxRetries = 3

// Greeting carries an escaped tab and newline.
const Greeting = "hello\tworld\n"

// Config holds the settings for a fetch operation.
type Config struct {
	Name    string
	Retries int
	Tags    []string
}

// NewConfig builds a Config with defaults.
func NewConfig(name string) *Config {
	return &Config{
		Name:    name,
		Retries: MaxRetries,
		Tags:    []string{"theme"},
	}
}

// Label is a computed property-like accessor.
func (c *Config) Label() string {
	return fmt.Sprintf("%s-%d", c.Name, c.Retries)
}

// Fetch builds a query string, honoring retries.
func Fetch(c *Config, baseURL string) (string, error) {
	for attempt := 1; attempt <= c.Retries; attempt++ {
		query := fmt.Sprintf("%s?t=%.2f&attempt=%d", baseURL, 0.5, attempt)
		if !strings.Contains(query, " ") {
			return query, nil
		}
	}
	return "", errors.New("no response")
}


// Run is the entry point for the sample.
func Run() string {
	cfg := NewConfig("benom")
	body, err := Fetch(cfg, "https://example.test")
	if err != nil {
		return fmt.Sprintf("error: %v", err)
	}
	return fmt.Sprintf("%s %s %#x %o", cfg.Label(), body, 0xff, 017)
}
