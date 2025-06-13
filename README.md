# JSON Validator TypeScript

A comprehensive JSON validation and analysis utility written in TypeScript with advanced features for validation, formatting, schema generation, and analysis.

## Features

- **JSON Validation** with detailed error reporting
- **JSON Formatting** with customizable indentation
- **JSON Minification** for space optimization
- **Comprehensive Analysis** with structure insights
- **Schema Generation** from JSON data
- **Path-based Value Extraction** with dot notation
- **Structural Issue Detection** (large arrays, long strings, etc.)
- **Command-line Interface** for easy usage
- **Depth and Size Analysis** for performance insights

## Installation

```bash
npm install
```

## Usage

### Command Line Interface

```bash
# Validate JSON
npm run dev validate '{"name": "test", "age": 30}'

# Format JSON with custom indentation
npm run dev format '{"name":"test","age":30}' 4

# Minify JSON
npm run dev minify '{"name": "test", "age": 30}'

# Analyze JSON structure
npm run dev analyze '{"name": "test", "nested": {"key": "value"}}'

# Run demo
npm run dev
```

### Programmatic Usage

```typescript
import { JsonValidator } from "./src/index";

const validator = new JsonValidator();

// Validate JSON
const result = validator.validate('{"name": "test"}');
console.log(`Valid: ${result.isValid}`);
if (!result.isValid) {
  console.log("Errors:", result.errors);
}

// Format JSON
const formatted = validator.format('{"name":"test"}', 2);
console.log(formatted);

// Analyze JSON
const analysis = validator.analyze('{"name": "test", "age": 30}');
console.log(`Keys: ${analysis.keys.length}`);
console.log(`Depth: ${analysis.depth}`);
```

## API Reference

### JsonValidator Class

#### Methods

**Validation**
- `validate(jsonString: string): ValidationResult` - Validate JSON with detailed error reporting

**Formatting**
- `format(jsonString: string, indent?: number): string` - Format JSON with indentation
- `minify(jsonString: string): string` - Minify JSON removing whitespace

**Analysis**
- `analyze(jsonString: string): JsonAnalysis` - Analyze JSON structure and properties
- `generateSchema(jsonString: string): any` - Generate JSON schema from data
- `findByPath(jsonString: string, path: string): any` - Extract value by path

### Interfaces

#### ValidationResult

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  formatted?: string;
  size: number;
  depth: number;
}
```

#### JsonAnalysis

```typescript
interface JsonAnalysis {
  keys: string[];
  types: Record<string, string>;
  arrayLengths: Record<string, number>;
  depth: number;
  size: number;
}
```

## Validation Features

### Syntax Validation
- Proper JSON syntax checking
- Detailed error messages with context
- Support for nested structures

### Structural Analysis
- Array size warnings (>10,000 elements)
- Object key count warnings (>1,000 keys)
- String length warnings (>100,000 characters)
- Key name validation (trimming, length)

### Path Navigation
- Dot notation for object properties: `user.name`
- Array index notation: `users[0].name`
- Nested path support: `data.items[2].details.title`

## Examples

### Basic Validation

```typescript
const validator = new JsonValidator();

// Valid JSON
const valid = validator.validate('{
  "name": "John",
  "age": 30,
  "active": true
}');
console.log(valid.isValid); // true

// Invalid JSON
const invalid = validator.validate('{
  "name": "John",
  "age": 30,
}'); // trailing comma
console.log(invalid.isValid); // false
console.log(invalid.errors); // ["JSON構文エラー: ..."]
```

### Advanced Analysis

```typescript
const complexJson = `{
  "users": [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"}
  ],
  "settings": {
    "theme": "dark",
    "notifications": true
  }
}`;

const analysis = validator.analyze(complexJson);
console.log(`Total keys: ${analysis.keys.length}`);
console.log(`Data types:`, analysis.types);
console.log(`Array lengths:`, analysis.arrayLengths);
console.log(`Structure depth: ${analysis.depth}`);
```

### Schema Generation

```typescript
const schema = validator.generateSchema('{
  "name": "John",
  "age": 30,
  "hobbies": ["reading", "coding"]
}');

console.log(JSON.stringify(schema, null, 2));
// Output:
// {
//   "type": "object",
//   "properties": {
//     "name": { "type": "string" },
//     "age": { "type": "number" },
//     "hobbies": {
//       "type": "array",
//       "items": { "type": "string" }
//     }
//   },
//   "required": ["name", "age", "hobbies"]
// }
```

### Path-based Access

```typescript
const data = '{
  "user": {
    "profile": {
      "name": "Alice",
      "contacts": ["email@example.com", "phone"]
    }
  }
}';

const name = validator.findByPath(data, "user.profile.name");
console.log(name); // "Alice"

const email = validator.findByPath(data, "user.profile.contacts[0]");
console.log(email); // "email@example.com"
```

## Error Handling

The validator provides detailed error information:

- **Syntax errors**: Invalid JSON format with specific error messages
- **Structural warnings**: Large data structures that might impact performance
- **Path errors**: Invalid paths in `findByPath` operations
- **Format errors**: Issues during formatting or minification

## Development

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Performance Considerations

- Large JSON files (>1MB) may require additional memory
- Deep nesting (>50 levels) may impact parsing performance
- Array processing is optimized for common use cases
- Schema generation scales with data complexity

## Use Cases

- **API Response Validation**: Validate JSON responses from APIs
- **Configuration File Validation**: Ensure config files are properly formatted
- **Data Migration**: Validate data before processing
- **Development Tools**: Integrate into build processes for JSON validation
- **Content Management**: Validate user-generated JSON content

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request