# Contributing to NexusHR

First off, thank you for considering contributing to NexusHR! It's people like you that make open source amazing. 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Issue Workflow](#issue-workflow)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Getting Help](#getting-help)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainer.

## 🤝 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include:

- A clear and descriptive title
- Steps to reproduce the bug
- Expected behavior vs. actual behavior
- Screenshots if applicable
- Environment details (OS, browser, Node version)

### 💡 Suggesting Enhancements

Feature suggestions are welcome! Please provide:

- A clear title
- Detailed description of the proposed feature
- Any relevant examples or mockups
- Why this feature would be useful

### 🔧 Your First Contribution

Looking for your first issue? Check out issues labeled:

- **`good first issue`** - Perfect for newcomers
- **`help wanted`** - Issues that need attention

### 📝 Improving Documentation

Documentation improvements are always appreciated! This includes:

- README improvements
- Adding comments to complex code
- Creating better setup guides
- Fixing typos

---

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm
- Git
- A Supabase account (free tier works)

### Step-by-Step Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/NexusHR.git
   cd NexusHR
   ```

2. **Set up the backend**
   ```bash
   cd Backend
   npm install
   # Copy and configure environment variables
   # Start the backend
   npm run dev
   ```

3. **Set up the frontend**
   ```bash
   cd Frontend
   npm install
   cp .env.example .env
   # Update .env with your configuration
   npm run dev
   ```

4. **Configure Supabase**
   - Create a Supabase project
   - Run the schema from `Backend/supabase-schema.sql` in the SQL Editor
   - Add your credentials to environment variables

5. **Test the setup**
   - Frontend: `http://localhost:5173` (or as shown in terminal)
   - Backend: `http://localhost:5000` (or as configured)

---

## 🔄 Issue Workflow

1. Find an issue you'd like to work on
2. Comment on the issue saying you're working on it
3. Wait for assignment (or go ahead if it's been a few days)
4. Create a branch with a descriptive name:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```
5. Make your changes with clear, descriptive commits
6. Push to your fork and create a Pull Request

---

## 📤 Pull Request Process

### Before Submitting a PR
- Test your changes locally
- Ensure your code follows the style guidelines
- Update documentation if needed
- Add tests for new features (backend)

### Creating a Pull Request
1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select the branch you worked on
4. Fill in the PR template (if one exists)

### PR Description Checklist
```
□ Clear title describing the change
□ Detailed description of what was done
□ Reference to related issue(s) (e.g., "Fixes #1")
□ Screenshots for UI changes
□ Testing steps (how to verify it works)
```

### PR Review Process
1. Maintainers will review your PR
2. You may need to address feedback
3. Once approved, your PR will be merged
4. Congratulations! 🎉

---

## 🎨 Style Guidelines

### Git Commit Messages

Use the following format:
```
type(scope): brief description

- Detailed explanation if needed
- Bullet points for multiple changes
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code style changes (formatting, missing semi-colons, etc.)
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `test:` Adding missing tests
- `chore:` Maintenance tasks

**Examples:**
```
feat(attendance): add check-in functionality

- Create attendance table in database
- Add API endpoints for check-in/out
- Implement frontend attendance component
```

```
fix(leave): fix leave balance calculation

- Correctly subtract approved leave days
- Handle edge cases for part-day leaves
```

### Code Style
- **TypeScript/JavaScript:** Use consistent indentation (2 spaces)
- **React:** Use functional components and hooks
- **Backend:** Use async/await for promises
- **Naming:** Use descriptive names (not abbreviations)
- **Comments:** Add comments for complex logic

---

## ❓ Getting Help

### Resources
- **Documentation:** Check the README and docs folder
- **Issues:** Look for similar issues
- **Discussion:** Open a new issue for questions

---

## 🎉 Final Note

Thank you for contributing to NexusHR! Every contribution, no matter how small, makes this project better. Happy coding! 💻
