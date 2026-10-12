/**
 * Example TSX component for the Benom theme.
 *
 * Exercises JSX tags, attributes, comments, strings, numbers,
 * keywords, types, functions, properties, decorators and operators.
 */

import { useEffect, useState } from "react";

export interface GreetingProps {
  readonly name: string;
  count?: number;
  tone?: "plain" | "bold";
}

/** A tiny component that renders a styled heading. */
export function Greeting({ name, count = 1, tone = "plain" }: GreetingProps) {
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), count * 1000);
    return () => clearTimeout(timer);
  }, [count]);

  // Escape sequences in JSX attribute values.
  const label = `hello "${name}"\n`;
  const ratio = count > 0 ? (100 / count).toFixed(1) : "0.0";

  return (
    <section className={`greeting greeting--${tone}`} data-count={count}>
      {/* JSX comment: the heading below is the main content. */}
      <h1 id="title" title={label}>
        {visible ? `Hello, ${name}!` : "Goodbye"}
      </h1>
      <p className="greeting__meta">
        Rendered {count} time(s) — {ratio}% of the budget
      </p>
      <ul>
        {Array.from({ length: count }, (_, i) => (
          <li key={i}>
            <span>item {i + 1}</span>
            <button type="button" onClick={() => setVisible((v) => !v)}>
              toggle
            </button>
          </li>
        ))}
      </ul>
      <img src="/icon.png" alt="benom icon" width={128} height={128} />
    </section>
  );
}

export default Greeting;
