# Git Commit & Pull Request Guidelines

This document outlines the required formats for committing code and opening Pull Requests (PRs). Adhering to these standards keeps our repository history clean and accelerates the review process.

---

## 1. Commit Message Format

We follow the [Conventional Commits](https://conventionalcommits.org) specification. 

### Structure
```text
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Commit Components
* **Type**: The intent of your change (see list below).
* **Scope** (Optional): The specific package, component, or file affected (e.g., `auth`, `ui`, `api`).
* **Description**: A brief summary in imperative mood ("add" not "added", "fix" not "fixes"). No period at the end.
* **Body** (Optional): Detailed motivation, reasoning, or context.
* **Footer** (Optional): Breaking changes notices or issue tracker references (e.g., `Fixes #123`).

### Allowed Types
* `feat`: A new feature for the user.
* `fix`: A bug fix for the user.
* `docs`: Documentation-only changes.
* `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
* `refactor`: A code change that neither fixes a bug nor adds a feature.
* `perf`: A code change that improves performance.
* `test`: Adding missing tests or correcting existing tests.
* `chore`: Changes to the build process, auxiliary tools, or libraries (e.g., updating dependencies).

### Examples
```text
feat(auth): add google oauth2 login provider
```
```text
fix(ui): resolve overlapping navigation bar items on mobile viewport

Closes #402
```

---

## 2. GitHub Pull Request Template

To apply this format automatically in GitHub, create an empty file named `pull_request_template.md` and place it in the `.github/` folder at the root of the repository.

### Markdown Template Source Code:

```markdown
## 📝 Summary
<!-- Provide a clear, brief overview of the changes introduced by this PR. -->

## 🔍 Linked Issues
<!-- Link the issue(s) this PR resolves using keywords (e.g., Closes #123, Fixes #456). -->
Fixes #

## 🛠️ Type of Change
<!-- Check the relevant option by placing an "x" inside the brackets: [x] -->
- [ ] 🚀 New feature (non-breaking change which adds functionality)
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] 🧹 Refactor (code cleanup, no functional or visual changes)
- [ ] ⚡ Performance improvement
- [ ] 📚 Documentation update
- [ ] ⚠️ Breaking change (fix or feature that would cause existing functionality to not work as expected)

## 🧪 Testing & Verification
<!-- Describe how you verified your changes. Include steps to reproduce, environment details, or unit test descriptions. -->
- **Test environment**: [e.g., Localhost, Staging, Safari, Chrome]
- **Verification steps**:
  1. 
  2. 

## 🖼️ Media & Visuals (If applicable)
<!-- Drag and drop screenshots, screen recordings, or architectural diagrams here to aid code review. -->

## 📋 Pre-Merge Checklist
<!-- Ensure your PR is ready by checking the boxes below: -->
- [ ] My code follows the code style guidelines of this project.
- [ ] My commit messages conform to the Conventional Commits format.
- [ ] I have performed a self-review of my own code.
- [ ] I have commented my code, particularly in hard-to-understand areas.
- [ ] I have made corresponding changes to the documentation.
- [ ] My changes generate no new warnings or console errors.
- [ ] I have added tests that prove my fix is effective or that my feature works.
```
