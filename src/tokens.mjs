// Benom: TextMate and semantic token rules.
//
// Pure data module consumed by scripts/build.mjs. Each rule maps a role to the
// TextMate scopes it styles and to a palette key (core or functional_additions).
//
// Design rules (docs/ARCHITECTURE.md, Principles 1 and 2):
// - Faithful to Venom: only palette hues are used here. No new syntax hue may be
//   introduced; the only hues present are the greys, the red (#fc302e, types) and
//   the teal (#5f8787, alt) from the core palette.
// - Token kinds are separated by font style (italic/bold), not by hue. The
//   `fontStyle` field is the primary axis of distinction between roles that share
//   a hue.
// - Functional additions (diagnostics, diff, git) never appear in syntax rules.

export const tokenRules = [
  // Comments: the only italic role. Recessive but readable (contrast target 4.0).
  { role: 'comment', scopes: ['comment'], paletteKey: 'comment', fontStyle: 'italic' },

  // Strings: brightest role. Escapes and regexes ride along with the same hue so
  // they read as string content, not as a new token kind.
  { role: 'string', scopes: ['string', 'string.escape', 'string.regexp', 'punctuation.definition.string'], paletteKey: 'string', fontStyle: '' },

  // Numbers and constants share the Venom grey and are told apart from keywords by
  // being plain (keywords are also plain, but they carry a different grey).
  { role: 'constant', scopes: ['constant', 'constant.numeric', 'constant.language', 'constant.character.escape'], paletteKey: 'constant', fontStyle: '' },
  { role: 'number', scopes: ['constant.numeric'], paletteKey: 'number', fontStyle: '' },

  // Keywords and storage are plain, matching Venom's keyword grey.
  { role: 'keyword', scopes: ['keyword', 'keyword.control', 'keyword.operator'], paletteKey: 'keyword', fontStyle: '' },
  { role: 'storage', scopes: ['storage', 'storage.type', 'storage.modifier'], paletteKey: 'keyword', fontStyle: '' },

  // Operators and punctuation use the Venom operator grey.
  { role: 'operator', scopes: ['keyword.operator', 'punctuation'], paletteKey: 'operator', fontStyle: '' },

  // Functions and methods: Venom func grey, plain.
  { role: 'function', scopes: ['entity.name.function', 'support.function', 'meta.function-call'], paletteKey: 'func', fontStyle: '' },
  { role: 'method', scopes: ['entity.name.function.member', 'meta.method-call'], paletteKey: 'func', fontStyle: '' },
  // Parameters and variables are named references, like
  // properties: the constant grey (distinct from the
  // default foreground, see the property rule above). A
  // variable reference inside a string is tokenized with
  // the string scope on its stack, so it counts as a
  // string token for gate 4 and must not fall through to
  // the default foreground.
  { role: 'parameter', scopes: ['variable.parameter'], paletteKey: 'constant', fontStyle: '' },

  // Properties and variables: named references use the
  // constant grey.
  // Property names, attribute names, CSS property names,
  // JSON keys, variables and parameters are recolorable
  // tokens (gate 4), but the Venom `property` grey is
  // identical to the default editor foreground (#c1c1c1),
  // so they would fall through to the default. They use
  // the existing `constant` grey instead, keeping them
  // inside the palette (no new hue) and distinct from
  // the default foreground.
  { role: 'property', scopes: ['variable.other.property', 'entity.other.attribute-name', 'meta.object-literal.key', 'support.type.property-name'], paletteKey: 'constant', fontStyle: '' },
  { role: 'variable', scopes: ['variable', 'variable.other'], paletteKey: 'constant', fontStyle: '' },

  // Types, classes and interfaces: the single red hue of Venom. Bold is applied
  // only where it helps tell a type from a keyword in the samples; the base rule
  // is plain red and the bold variant is opt-in per scope below.
  { role: 'type', scopes: ['entity.name.type', 'support.type', 'entity.name.class', 'entity.name.interface'], paletteKey: 'type', fontStyle: '' },
  { role: 'class', scopes: ['entity.name.class', 'entity.name.type.class'], paletteKey: 'type', fontStyle: '' },
  { role: 'interface', scopes: ['entity.name.type.interface', 'entity.name.interface'], paletteKey: 'type', fontStyle: '' },
  { role: 'enum', scopes: ['entity.name.type.enum'], paletteKey: 'type', fontStyle: '' },
  { role: 'namespace', scopes: ['entity.name.namespace', 'entity.name.module'], paletteKey: 'type', fontStyle: '' },

  // Decorators and macros: teal (the alt hue), italic to separate them from types.
  { role: 'decorator', scopes: ['entity.name.function.decorator', 'meta.decorator', 'punctuation.definition.decorator'], paletteKey: 'alt', fontStyle: 'italic' },
  { role: 'macro', scopes: ['entity.name.function.macro', 'meta.macro'], paletteKey: 'alt', fontStyle: 'italic' },

  // Tags and attributes (html, jsx): tags red, attributes the
  // constant grey (distinct from the default foreground, see
  // the property rule above).
  { role: 'tag', scopes: ['entity.name.tag', 'meta.tag'], paletteKey: 'type', fontStyle: '' },
  { role: 'attribute', scopes: ['entity.other.attribute-name', 'meta.tag.attribute'], paletteKey: 'constant', fontStyle: '' },

  // CSS: properties and values use the constant grey (distinct
  // from the default foreground), selectors the keyword grey.
  { role: 'cssProperty', scopes: ['support.type.property-name.css', 'meta.property-name.css'], paletteKey: 'constant', fontStyle: '' },
  { role: 'cssValue', scopes: ['support.constant.property-value.css', 'keyword.other.unit'], paletteKey: 'constant', fontStyle: '' },

  // JSON keys and Markdown: keys the constant grey; headings
  // and links use fg/string.
  { role: 'jsonKey', scopes: ['support.type.property-name.json', 'entity.name.tag.json'], paletteKey: 'constant', fontStyle: '' },
  { role: 'markdownHeading', scopes: ['markup.heading', 'entity.name.section'], paletteKey: 'string', fontStyle: 'bold' },
  { role: 'markdownLink', scopes: ['markup.underline.link', 'constant.other.reference.link'], paletteKey: 'string', fontStyle: '' },
  { role: 'markdownCode', scopes: ['markup.raw', 'markup.fenced_code', 'markup.inline.raw'], paletteKey: 'constant', fontStyle: '' },
  { role: 'markdownBold', scopes: ['markup.bold'], paletteKey: 'string', fontStyle: 'bold' },
  { role: 'markdownItalic', scopes: ['markup.italic'], paletteKey: 'string', fontStyle: 'italic' },

  // Diff and invalid: these are the only places a functional hue may appear in
  // tokenColors, because a diff IS the functional surface (docs/ARCHITECTURE.md).
  { role: 'diffAdded', scopes: ['markup.inserted', 'diff.added'], paletteKey: 'added', fontStyle: '' },
  { role: 'diffRemoved', scopes: ['markup.deleted', 'diff.deleted'], paletteKey: 'removed', fontStyle: '' },
  { role: 'diffModified', scopes: ['markup.changed', 'diff.changed'], paletteKey: 'modified', fontStyle: '' },
  { role: 'invalid', scopes: ['invalid', 'invalid.illegal'], paletteKey: 'error', fontStyle: '' },
];

// Semantic token rules: the same roles, expressed as semantic token types.
// `fontStyle` here follows the same separation-by-font-style principle.
export const semanticTokenRules = [
  { type: 'namespace', paletteKey: 'type', fontStyle: '' },
  { type: 'type', paletteKey: 'type', fontStyle: '' },
  { type: 'class', paletteKey: 'type', fontStyle: '' },
  { type: 'interface', paletteKey: 'type', fontStyle: '' },
  { type: 'enum', paletteKey: 'type', fontStyle: '' },
  { type: 'typeParameter', paletteKey: 'type', fontStyle: '' },
  { type: 'function', paletteKey: 'func', fontStyle: '' },
  { type: 'method', paletteKey: 'func', fontStyle: '' },
  { type: 'parameter', paletteKey: 'property', fontStyle: '' },
  { type: 'property', paletteKey: 'property', fontStyle: '' },
  { type: 'variable', paletteKey: 'property', fontStyle: '' },
  { type: 'variable.readonly', paletteKey: 'constant', fontStyle: '' },
  { type: 'variable.declaration', paletteKey: 'property', fontStyle: '' },
  { type: 'decorator', paletteKey: 'alt', fontStyle: 'italic' },
  { type: 'macro', paletteKey: 'alt', fontStyle: 'italic' },
  { type: 'keyword', paletteKey: 'keyword', fontStyle: '' },
  { type: 'modifier', paletteKey: 'keyword', fontStyle: '' },
  { type: 'number', paletteKey: 'number', fontStyle: '' },
  { type: 'string', paletteKey: 'string', fontStyle: '' },
  { type: 'comment', paletteKey: 'comment', fontStyle: 'italic' },
  { type: 'operator', paletteKey: 'operator', fontStyle: '' },
];
