# Automatic Versioning & Changelog

This project uses [standard-version](https://github.com/conventional-changelog/standard-version) for automatic version management and changelog generation.

> **Note:** You may see npm deprecation warnings from `standard-version` dependencies (`stringify-package`, `q`). These are transitive dependencies and don't affect functionality. The warnings are safe to ignore. `standard-version` itself is deprecated but still works perfectly for this project.

## How It Works

The system automatically:
- Bumps version numbers based on your commits
- Generates CHANGELOG.md entries
- Creates git tags
- Pushes releases to GitHub

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>: <description>

[optional body]

[optional footer]
```

### Types

- `feat:` - New feature (bumps **minor** version: 2.0.0 → 2.1.0)
- `fix:` - Bug fix (bumps **patch** version: 2.0.0 → 2.0.1)
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `chore:` - Maintenance tasks (hidden from changelog)

### Breaking Changes

Add `BREAKING CHANGE:` in the footer to bump **major** version (2.0.0 → 3.0.0):

```
feat: redesign authentication system

BREAKING CHANGE: Users must re-authenticate after this update
```

## Usage

### Automatic Release (Recommended)

When you push to the `main` branch, GitHub Actions will automatically:
1. Analyze your commits since the last release
2. Determine the version bump (major/minor/patch)
3. Update CHANGELOG.md
4. Create a git tag
5. Create a GitHub release

### Manual Release

Run these commands locally:

```bash
# Automatic version bump based on commits
npm run release

# Force specific version bumps
npm run release:patch  # 2.0.0 → 2.0.1
npm run release:minor  # 2.0.0 → 2.1.0
npm run release:major  # 2.0.0 → 3.0.0

# Then push the changes
git push --follow-tags origin main
```

## Examples

### Adding a Feature
```bash
git commit -m "feat: add user profile page"
# Next release: 2.0.0 → 2.1.0
```

### Fixing a Bug
```bash
git commit -m "fix: resolve login redirect issue"
# Next release: 2.0.0 → 2.0.1
```

### Multiple Changes
```bash
git commit -m "feat: add dark mode toggle"
git commit -m "fix: navbar responsive layout"
git commit -m "docs: update README"
# Next release: 2.0.0 → 2.1.0 (minor takes precedence)
```

### Breaking Change
```bash
git commit -m "feat: migrate to new database schema

BREAKING CHANGE: Database migration required. Run 'npm run migrate' before deploying."
# Next release: 2.0.0 → 3.0.0
```

## First-Time Setup

If you want to start fresh:

1. Ensure you have committed all changes
2. Run: `npm run release -- --first-release`
3. This creates the initial changelog without bumping version

## Configuration

Configuration is in [.versionrc.json](.versionrc.json):
- Defines which commit types appear in changelog
- Specifies files to bump (package.json)
- Controls changelog formatting

## Tips

✅ **Do:**
- Write clear, descriptive commit messages
- Use conventional commit format
- Commit related changes together
- Review CHANGELOG.md before pushing

❌ **Don't:**
- Mix multiple types in one commit
- Make commits without proper type prefix
- Manually edit version in package.json
- Edit CHANGELOG.md manually (standard-version handles it)

## Viewing Releases

- **Changelog**: Check [CHANGELOG.md](CHANGELOG.md)
- **GitHub**: View releases at `https://github.com/your-username/EVU-WEB/releases`
- **Git Tags**: Run `git tag` to see all version tags

## About Deprecation Warnings

### What You're Seeing

When running `npm install`, you may see warnings like:
```
npm warn deprecated stringify-package@1.0.1
npm warn deprecated q@1.5.1
```

### Why This Happens

These are **transitive dependencies** (dependencies of `standard-version`), not packages you installed directly. `standard-version` itself is deprecated, but it still works perfectly and is widely used.

### Should You Worry?

**No.** These warnings:
- Don't affect functionality
- Don't introduce security issues
- Don't break your build or deployment
- Are purely informational

### Future Alternative

If you want to migrate in the future, consider:
- **[release-please](https://github.com/googleapis/release-please)** - Google's automated release tool
- **[semantic-release](https://github.com/semantic-release/semantic-release)** - Fully automated versioning

For now, `standard-version` works great for this project! 🚀
