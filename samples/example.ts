/**
 * Example TypeScript module for the Benom theme.
 *
 * Exercises comments, strings, escapes, numbers, keywords, types,
 * functions, properties, decorators and operators.
 */

export interface Book {
  readonly id: number;
  title: string;
  author?: string;
  tags: Array<string>;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export const MAX_ITEMS = 42;
const GREETING = "hello\tworld\n";
const ESCAPED = "quote: \" and backslash: \\";

/** A simple decorator that logs construction. */
function Logged<T extends new (...args: never[]) => unknown>(ctor: T): T {
  return class extends ctor {
    constructor(...args: never[]) {
      super(...args);
      console.debug(`new ${ctor.name}`);
    }
  };
}

@Logged
export class Library implements Iterable<Book> {
  private books: Book[] = [];

  constructor(private readonly name: string) {}

  add(book: Book): Result<Book> {
    if (this.books.length >= MAX_ITEMS) {
      return { ok: false, error: "full" };
    }
    this.books.push(book);
    return { ok: true, value: book };
  }

  *[Symbol.iterator](): Iterator<Book> {
    for (const book of this.books) {
      yield book;
    }
  }

}

export function summarize(library: Library): string {
  return `${library.name}: ${library.books.length} book(s)`;
}

const lib = new Library("benom");
lib.add({ id: 1, title: "Welcome to Hell", tags: ["black-metal"] });
console.info(summarize(lib), 0xff, 2 ** 10, 10 % 3);
