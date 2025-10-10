# Contributing to DomainHive Framework

Thank you for your interest in contributing to DomainHive Framework! This guide will help you get started.

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Eclipse-Softworks/domainhive-framework.git
   cd domainhive-framework
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

## Development Workflow

### Code Quality

We use several tools to maintain code quality:

- **TypeScript** - Strict type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Unit testing

### Available Scripts

```bash
# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type check (no emit)
npm run typecheck
```

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Avoid `any` types when possible (warnings are acceptable for complex cases)
- Export all public interfaces and types
- Use meaningful variable and function names

### Code Style

- We use Prettier for consistent formatting
- Run `npm run format` before committing
- Follow the existing code structure

### Testing

- Write unit tests for new features
- Maintain or improve code coverage
- Place tests in `src/__tests__` directory
- Name test files with `.test.ts` suffix

### Commit Messages

- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, Remove, etc.)
- Keep the first line under 72 characters

Example:
```
Add CacheModule with Redis support

- Implement Redis client connection
- Add memory cache fallback
- Include TTL support
- Add unit tests
```

## Pull Request Process

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following the coding standards
3. **Run tests** and ensure they pass:
   ```bash
   npm test
   npm run lint
   npm run format:check
   npm run build
   ```
4. **Update documentation** if needed
5. **Submit a pull request** with a clear description of changes

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation is updated (if applicable)
- [ ] Commit messages are clear and descriptive

## Project Structure

```
domainhive-framework/
├── src/
│   ├── core/              # Core framework
│   ├── modules/           # Feature modules
│   ├── utils/             # Utility functions
│   ├── interfaces/        # TypeScript interfaces
│   ├── examples/          # Example implementations
│   └── __tests__/         # Unit tests
├── dist/                  # Compiled output (generated)
├── coverage/              # Test coverage reports (generated)
└── node_modules/          # Dependencies (generated)
```

## Adding New Modules

When adding a new module:

1. Create a new directory under `src/modules/YourModule/`
2. Implement the module following existing patterns
3. Export the module from `src/index.ts`
4. Add unit tests in `src/__tests__/modules/`
5. Update documentation
6. Add examples if applicable

## Reporting Issues

- Use GitHub Issues to report bugs or request features
- Provide a clear description and steps to reproduce
- Include version information and environment details

## Code Review

All contributions will be reviewed by maintainers. We look for:

- Code quality and adherence to standards
- Test coverage
- Documentation completeness
- Backward compatibility

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open a GitHub Discussion or reach out to the maintainers.

Thank you for contributing! 🎉
