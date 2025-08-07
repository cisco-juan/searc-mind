# Contributing to SearchMind

Thank you for your interest in contributing to SearchMind! This document establishes the guidelines and rules for contributing to the project.

[Versión en Español](./CONTRIBUTING.md)

## 🔒 Contribution Rules

### ⚠️ **MANDATORY: Fork + Pull Request**

**Direct contributions to the main repository are NOT accepted.** All contributions must follow this workflow:

1. **Fork** the repository
2. Create **Pull Request** from your fork
3. Code review and approval
4. Merge to main repository

### 🚫 What is NOT allowed:
- ❌ Direct push to `main` or `master`
- ❌ Direct commits to the main repository
- ❌ Bypassing code reviews
- ❌ Force push to protected branches

## 📋 Contribution Process

### 1. Fork the Project
```bash
# Click "Fork" on GitHub or use GitHub CLI
gh repo fork owner/search-mind --clone
```

### 2. Setup Local Repository
```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/search-mind.git
cd search-mind

# Add the original repository as upstream
git remote add upstream https://github.com/OWNER/search-mind.git

# Verify remotes
git remote -v
```

### 3. Create Working Branch
```bash
# Create and switch to new branch
git checkout -b feature/new-functionality

# Or for bug fixes
git checkout -b fix/fix-issue
```

### 4. Make Changes
```bash
# Make your changes
# Run tests
npm test

# Check linting
npm run lint

# Check types
npm run typecheck
```

### 5. Commit and Push
```bash
# Commit with descriptive message
git add .
git commit -m "feat: add new chat functionality"

# Push to your fork
git push origin feature/new-functionality
```

### 6. Create Pull Request
1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill out the PR template
4. Wait for review and approval

## 📝 Code Standards

### Commits
We use [Conventional Commits](https://conventionalcommits.org/):
```
feat: new functionality
fix: bug fix
docs: documentation update
style: formatting changes
refactor: code refactoring
test: add or modify tests
chore: maintenance tasks
```

### Code
- **TypeScript**: All code must be typed
- **ESLint**: Follow configured rules
- **Prettier**: Automatic formatting
- **Tests**: Include tests for new functionality

## 🔍 Code Review

### Requirements for Merge:
- ✅ **At least 1 approved review**
- ✅ **All CI checks pass**
- ✅ **No conflicts**
- ✅ **Tests included**
- ✅ **Documentation updated**

### Review Process:
1. **Automated review**: CI/CD checks
2. **Manual review**: Maintainers review code
3. **Feedback**: Changes requested if necessary
4. **Approval**: Merge to main repository

## 🏷️ Types of Contribution

### 🐛 **Bug Reports**
- Use issue template
- Include steps to reproduce
- Specify environment and version
- Screenshots if applicable

### ✨ **Feature Requests**
- Describe proposed functionality
- Justify the need
- Consider impact on existing users
- Discuss in issue before implementing

### 📚 **Documentation**
- README updates
- Code comments
- API documentation
- Usage examples

### 🧪 **Tests**
- Unit tests
- Integration tests
- E2E tests
- Performance tests

## 🚀 Development Setup

```bash
# Install dependencies
npm install

# Configure environment
cp apps/backend/.env.template apps/backend/.env

# Run in development mode
npx nx serve backend
npx nx dev frontend

# Run tests
npx nx test backend
npx nx e2e backend-e2e

# Linting and formatting
npx nx lint backend frontend
npx nx format
```

## ❓ Help and Support

### 📞 Contact:
- **Issues**: For bugs and feature requests
- **Discussions**: For general questions
- **Discord/Slack**: For real-time chat (if applicable)

### 📖 Resources:
- [README](./README.en.md)
- [Architecture](./docs/architecture.md)
- [API Documentation](./docs/api.md)

## 🎯 Best Practices

### ✅ **DO:**
- Fork the project
- Create descriptive branches
- Write clear commits
- Include tests
- Update documentation
- Follow code standards
- Be respectful in reviews

### ❌ **DON'T:**
- Direct push to main
- Commits without description
- Changes without tests
- Ignore review feedback
- Mix multiple features in one PR
- Modify unrelated files

## 📜 Code of Conduct

This project adheres to the [Contributor Covenant](https://www.contributor-covenant.org/). All participants are expected to follow these behavioral guidelines.

## 🌍 Internationalization

### Language Support
- **Primary**: English documentation
- **Secondary**: Spanish documentation
- **Code**: English comments and variable names
- **Commits**: English commit messages

### Translation Guidelines
- Keep technical terms in English when appropriate
- Maintain consistency across translations
- Update both language versions when making changes

## 🔧 Development Guidelines

### Branch Naming
```
feature/description-of-feature
fix/description-of-fix
docs/description-of-docs-change
refactor/description-of-refactor
```

### Pull Request Size
- Keep PRs focused and small
- One feature/fix per PR
- Break large changes into multiple PRs
- Include related tests and docs in the same PR

### Testing Requirements
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance tests for optimization changes

## 📊 Quality Gates

### Before Submitting PR:
```bash
# Run full test suite
npm run test:all

# Check code quality
npm run lint:fix
npm run format

# Verify build
npm run build:all

# Check for security issues
npm audit
```

### CI/CD Pipeline:
1. **Linting**: ESLint + Prettier
2. **Type Checking**: TypeScript compiler
3. **Testing**: Jest + E2E tests
4. **Building**: Production builds
5. **Security**: Dependency audit

## 🏆 Recognition

### Contributors
- All contributors are recognized in our documentation
- Significant contributions are highlighted in release notes
- Active contributors may be invited as maintainers

### Hall of Fame
We maintain a list of notable contributions:
- First-time contributors
- Major feature implementations
- Critical bug fixes
- Documentation improvements

---

**Thank you for contributing to SearchMind!** 🙏

Your collaboration helps make this project better for the entire community.