# Branching Strategy & Workflow

This document outlines the Git branching strategy for the EVU Gaming Network website.

## Branch Structure

### `main` (Production)
- **Purpose**: Production-ready code deployed to live site
- **Protection**: Should be protected from direct pushes
- **Updates**: Only via pull requests from `staging`
- **Auto-deploy**: Triggers production deployment

### `staging` (Pre-Production)
- **Purpose**: Final testing before production release
- **Protection**: Recommended protection from direct pushes
- **Updates**: Via pull requests from `dev`
- **Testing**: Full QA and user acceptance testing

### `dev` (Development)
- **Purpose**: Active development and integration
- **Updates**: Via pull requests from feature branches
- **Testing**: Basic functionality testing

### `feature/*` (Feature Branches)
- **Purpose**: Individual features or bug fixes
- **Naming**: `feature/feature-name`, `fix/bug-name`, `docs/documentation-update`
- **Lifetime**: Temporary - delete after merge to `dev`

## Workflow

### 1. Starting New Work

```bash
# Start from dev
git checkout dev
git pull origin dev

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit with conventional commits
git add .
git commit -m "feat: add new feature"
git push -u origin feature/your-feature-name
```

### 2. Merging to Dev

```bash
# Create pull request on GitHub: feature/your-feature-name → dev
# After review and approval, merge on GitHub
# Then locally:
git checkout dev
git pull origin dev
git branch -d feature/your-feature-name  # Delete local feature branch
```

### 3. Promoting to Staging

```bash
# After sufficient testing on dev
git checkout staging
git pull origin staging
git merge dev
git push origin staging

# Or create PR on GitHub: dev → staging
```

### 4. Releasing to Production

```bash
# After staging approval
git checkout main
git pull origin main
git merge staging
git push origin main

# Or create PR on GitHub: staging → main
```

## Conventional Commits

Use conventional commit messages for automatic changelog generation:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Test updates
- `chore:` - Build/tooling changes
- `style:` - Code style changes

**Examples:**
```bash
git commit -m "feat: add dual-server support to admin panel"
git commit -m "fix: resolve 401 error in profile page"
git commit -m "docs: update branching strategy documentation"
```

## Branch Protection Rules (Recommended)

### For `main` branch:
1. Go to GitHub → Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1+)
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings

### For `staging` branch:
1. Branch name pattern: `staging`
2. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging

## Versioning

This project uses [semantic versioning](https://semver.org/) with automated changelog generation via `standard-version`.

### Creating a Release

```bash
# On main branch after merging from staging
npm run release

# This will:
# 1. Bump version in package.json
# 2. Update CHANGELOG.md
# 3. Create git tag
# 4. Commit changes

# Then push
git push --follow-tags origin main
```

## Quick Reference

| Action | Command |
|--------|---------|
| Create feature branch | `git checkout dev && git checkout -b feature/name` |
| Push feature branch | `git push -u origin feature/name` |
| Switch branches | `git checkout branch-name` |
| Delete local branch | `git branch -d branch-name` |
| Delete remote branch | `git push origin --delete branch-name` |
| View all branches | `git branch -a` |
| Update current branch | `git pull origin branch-name` |

## Emergency Hotfixes

For critical production bugs:

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-name

# Fix the bug and commit
git add .
git commit -m "fix: resolve critical production bug"

# Push and create PR to main
git push -u origin hotfix/critical-bug-name

# After merge to main, also merge to dev and staging
git checkout dev
git merge main
git push origin dev

git checkout staging
git merge main
git push origin staging
```

## Tips

1. **Always pull before creating new branches** - Ensures you start with latest code
2. **Keep feature branches small** - Easier to review and merge
3. **Delete merged branches** - Keeps repository clean
4. **Use descriptive branch names** - Makes it clear what the branch does
5. **Test before merging up** - dev → staging → main
6. **Commit often, push daily** - Prevents loss of work

## Current Status

- ✅ `main` - Production branch (live site)
- ✅ `staging` - Pre-production testing
- ✅ `dev` - Active development
- ℹ️ All branches currently synced with dual-server admin panel changes

## Questions?

Refer to [VERSIONING.md](./VERSIONING.md) for version management details.
