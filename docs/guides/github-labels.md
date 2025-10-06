# GitHub Labels Setup Guide

This guide explains how to create labels for the automated release workflow and other project organization.

---

## 📋 Table of Contents

- [Release Workflow Labels](#release-workflow-labels)
- [Recommended Additional Labels](#recommended-additional-labels)
- [Creating Labels](#creating-labels)
- [Automation](#automation)

---

## Release Workflow Labels

The automated release workflow tries to add these labels to Pull Requests:

### 1. **release**
- **Purpose**: Marks automated release PRs
- **Color**: `#0E8A16` (Green)
- **Description**: Automated release PR

### 2. **automated**
- **Purpose**: Indicates PR was created by GitHub Actions
- **Color**: `#EDEDED` (Light Gray)
- **Description**: Created by GitHub Actions

---

## Recommended Additional Labels

Consider creating these labels for better project organization:

### Bug Tracking
- **bug** - `#D73A4A` (Red) - Something isn't working
- **critical** - `#B60205` (Dark Red) - Critical bug requiring immediate attention
- **enhancement** - `#A2EEEF` (Light Blue) - New feature or request

### Priority
- **priority: high** - `#E99695` (Light Red) - High priority
- **priority: medium** - `#FEF2C0` (Yellow) - Medium priority
- **priority: low** - `#C5DEF5` (Light Blue) - Low priority

### Type
- **documentation** - `#0075CA` (Blue) - Improvements or additions to documentation
- **question** - `#D876E3` (Purple) - Further information is requested
- **duplicate** - `#CFD3D7` (Gray) - This issue or PR already exists
- **wontfix** - `#FFFFFF` (White) - This will not be worked on

### Status
- **in progress** - `#FBCA04` (Yellow) - Currently being worked on
- **needs review** - `#FFA500` (Orange) - Needs code review
- **ready to merge** - `#0E8A16` (Green) - Approved and ready

### Server-Specific
- **minecraft** - `#7CFC00` (Light Green) - Related to Minecraft server
- **fivem** - `#FF6347` (Tomato Red) - Related to FiveM server

---

## Creating Labels

### Method 1: GitHub Web Interface (Easiest)

1. **Go to Labels Page:**
   - https://github.com/adrianlarsen102/EVU-WEB/labels

2. **Click "New label"**

3. **Fill in the form:**
   - **Label name**: (e.g., `release`)
   - **Description**: (e.g., `Automated release PR`)
   - **Color**: Click the color box and enter hex code (e.g., `#0E8A16`)

4. **Click "Create label"**

5. **Repeat** for each label

### Method 2: GitHub CLI (Faster for Multiple Labels)

If you have `gh` CLI installed:

```bash
# Required labels for release workflow
gh label create "release" \
  --description "Automated release PR" \
  --color "0E8A16" \
  --repo adrianlarsen102/EVU-WEB

gh label create "automated" \
  --description "Created by GitHub Actions" \
  --color "EDEDED" \
  --repo adrianlarsen102/EVU-WEB

# Bug tracking
gh label create "bug" \
  --description "Something isn't working" \
  --color "D73A4A" \
  --repo adrianlarsen102/EVU-WEB

gh label create "enhancement" \
  --description "New feature or request" \
  --color "A2EEEF" \
  --repo adrianlarsen102/EVU-WEB

gh label create "documentation" \
  --description "Improvements or additions to documentation" \
  --color "0075CA" \
  --repo adrianlarsen102/EVU-WEB

# Server-specific
gh label create "minecraft" \
  --description "Related to Minecraft server" \
  --color "7CFC00" \
  --repo adrianlarsen102/EVU-WEB

gh label create "fivem" \
  --description "Related to FiveM server" \
  --color "FF6347" \
  --repo adrianlarsen102/EVU-WEB
```

### Method 3: Using GitHub API (Advanced)

Create a script to bulk-create labels:

```bash
#!/bin/bash

REPO="adrianlarsen102/EVU-WEB"
TOKEN="your_github_token"

# Array of labels (name, color, description)
labels=(
  "release|0E8A16|Automated release PR"
  "automated|EDEDED|Created by GitHub Actions"
  "bug|D73A4A|Something isn't working"
  "enhancement|A2EEEF|New feature or request"
  "documentation|0075CA|Improvements or additions to documentation"
)

for label in "${labels[@]}"; do
  IFS='|' read -r name color description <<< "$label"

  curl -X POST \
    -H "Authorization: token $TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/repos/$REPO/labels \
    -d "{\"name\":\"$name\",\"color\":\"$color\",\"description\":\"$description\"}"

  echo "Created label: $name"
done
```

---

## Automation

### Automatic Label Application

The release workflow automatically applies labels when creating PRs (if the labels exist):

**File:** `.github/workflows/release.yml`

```yaml
# Try to add labels (ignore if they don't exist)
gh pr edit "$PR_NUMBER" --add-label "release" 2>/dev/null
gh pr edit "$PR_NUMBER" --add-label "automated" 2>/dev/null
```

### Label Verification

After creating labels, verify they exist:

```bash
# List all labels
gh label list --repo adrianlarsen102/EVU-WEB

# Or visit the labels page
# https://github.com/adrianlarsen102/EVU-WEB/labels
```

---

## Quick Setup (Copy & Paste)

### Minimum Required Labels

Create these two labels for the release workflow to work properly:

**Via Web:**
1. https://github.com/adrianlarsen102/EVU-WEB/labels/new
   - Name: `release`
   - Color: `#0E8A16`
   - Description: `Automated release PR`

2. https://github.com/adrianlarsen102/EVU-WEB/labels/new
   - Name: `automated`
   - Color: `#EDEDED`
   - Description: `Created by GitHub Actions`

**Via CLI:**
```bash
gh label create "release" --description "Automated release PR" --color "0E8A16" --repo adrianlarsen102/EVU-WEB
gh label create "automated" --description "Created by GitHub Actions" --color "EDEDED" --repo adrianlarsen102/EVU-WEB
```

---

## Troubleshooting

### Labels Not Applied to PRs

**Issue:** Workflow shows "⚠️ Could not add 'release' label"

**Solution:**
1. Verify labels exist: https://github.com/adrianlarsen102/EVU-WEB/labels
2. Check label names match exactly (case-sensitive)
3. Ensure `GH_TOKEN` has `repo` scope

### Creating Labels Fails

**Issue:** "Resource not accessible by integration"

**Solution:**
- Use a Personal Access Token with `repo` scope
- Cannot create labels with default `GITHUB_TOKEN`

---

## Best Practices

1. **Use consistent naming**: Lowercase with hyphens (e.g., `priority-high`)
2. **Add descriptions**: Helps new contributors understand label purpose
3. **Use color coding**: Similar labels should have similar colors
4. **Don't over-label**: Too many labels = confusion
5. **Document usage**: Explain what each label means in CONTRIBUTING.md

---

## References

- [GitHub Labels Documentation](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/managing-labels)
- [GitHub CLI Labels](https://cli.github.com/manual/gh_label)
- [GitHub REST API - Labels](https://docs.github.com/en/rest/issues/labels)

---

**Last Updated**: 2025-10-06
**Maintained By**: EVU Development Team
