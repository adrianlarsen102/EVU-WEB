# GitHub Token Setup Guide

This guide explains how to set up the `GH_TOKEN` secret for automatic pull request creation in the release workflow.

---

## Why is GH_TOKEN needed?

The default `GITHUB_TOKEN` provided by GitHub Actions has limited permissions and cannot create pull requests in workflows. To enable automatic PR creation during releases, you need to create a Personal Access Token (PAT) with `repo` scope.

---

## Step-by-Step Setup

### Step 1: Create Personal Access Token

1. **Go to GitHub Settings**
   - Click your profile picture → **Settings**
   - Or visit: https://github.com/settings/tokens

2. **Navigate to Developer Settings**
   - Scroll down to **Developer settings** (bottom left)
   - Click **Personal access tokens** → **Tokens (classic)**

3. **Generate New Token**
   - Click **Generate new token** → **Generate new token (classic)**
   - You may need to confirm your password

4. **Configure Token**
   ```
   Note: EVU-WEB Release Automation
   Expiration: No expiration (or your preference)

   Scopes (select these):
   ✅ repo (Full control of private repositories)
      ✅ repo:status
      ✅ repo_deployment
      ✅ public_repo
      ✅ repo:invite
      ✅ security_events
   ```

5. **Generate Token**
   - Scroll down and click **Generate token**
   - **IMPORTANT**: Copy the token immediately!
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - You won't be able to see it again!

### Step 2: Add Token to Repository Secrets

1. **Go to Repository Settings**
   - Navigate to your repository: https://github.com/adrianlarsen102/EVU-WEB
   - Click **Settings** tab

2. **Navigate to Secrets**
   - In the left sidebar, expand **Secrets and variables**
   - Click **Actions**

3. **Add New Secret**
   - Click **New repository secret**
   - Name: `GH_TOKEN`
   - Value: Paste the token you copied (starts with `ghp_`)
   - Click **Add secret**

---

## Verification

After adding the secret, the next release workflow run will automatically create pull requests!

### Test the Setup

1. **Push a commit to main branch**
   ```bash
   git commit -m "test: verify release workflow"
   git push
   ```

2. **Check Actions Tab**
   - Go to: https://github.com/adrianlarsen102/EVU-WEB/actions
   - Look for the **Release** workflow
   - Check the "Create Pull Request" step

3. **Expected Output**
   ```
   🔑 Using Personal Access Token for PR creation...
   Creating pull request...
   ✅ Pull Request created: https://github.com/...
   ```

---

## Troubleshooting

### Token Not Working

**Error:** `Bad credentials` or `Resource not accessible by integration`

**Solution:**
1. Verify token has `repo` scope
2. Check token hasn't expired
3. Regenerate token if needed

### PR Creation Still Fails

**Error:** `GraphQL error: ... not authorized to create a pull request`

**Solution:**
1. Ensure you're a repository admin or have write access
2. Check repository settings → Actions → General
3. Verify "Allow GitHub Actions to create and approve pull requests" is enabled:
   - Settings → Actions → General → Workflow permissions
   - Check ✅ "Allow GitHub Actions to create and approve pull requests"

### Secret Not Found

**Error:** Workflow shows manual PR creation instructions

**Solution:**
1. Verify secret name is exactly `GH_TOKEN` (case-sensitive)
2. Check secret is in repository secrets (not environment secrets)
3. Re-add secret if needed

---

## Security Best Practices

### Token Security

✅ **DO:**
- Store token in GitHub Secrets only
- Use fine-grained expiration (e.g., 90 days)
- Rotate tokens regularly
- Revoke unused tokens

❌ **DON'T:**
- Commit tokens to code
- Share tokens via email/chat
- Use the same token across multiple repos
- Give more permissions than needed

### Token Rotation

**Recommended Schedule:** Every 90 days

1. Generate new token with same scopes
2. Update `GH_TOKEN` secret
3. Revoke old token
4. Test workflow

---

## Alternative: GitHub App

For organizations or advanced use cases, consider using a GitHub App instead of a PAT:

### Pros:
- More granular permissions
- Better audit logging
- Scoped to specific repositories
- Doesn't require a user account

### Cons:
- More complex setup
- Requires additional configuration

**Setup Guide:** https://docs.github.com/en/developers/apps/building-github-apps

---

## Current Workflow Behavior

### Without GH_TOKEN:
1. Release workflow runs
2. Creates release branch
3. Shows manual PR creation instructions
4. You create PR manually

### With GH_TOKEN:
1. Release workflow runs
2. Creates release branch
3. **Automatically creates pull request** ✨
4. Adds `release` and `automated` labels
5. Assigns you as reviewer
6. You merge PR to complete release

---

## FAQ

### Q: Can I use GITHUB_TOKEN instead?
**A:** No, `GITHUB_TOKEN` has limited permissions and cannot create pull requests in workflows triggered by pushes.

### Q: Does the token need admin access?
**A:** No, just `repo` scope. You need to be a repository collaborator with write access.

### Q: What if my token expires?
**A:** The workflow will fall back to manual PR creation mode. Update the secret with a new token.

### Q: Is this secure?
**A:** Yes, when stored in GitHub Secrets. The token is encrypted and never exposed in logs. Use minimum required scopes and rotate regularly.

### Q: Can I use fine-grained tokens?
**A:** Yes! Fine-grained Personal Access Tokens (beta) work too. Grant "Pull requests: Read and write" permission.

---

## Support

**Need Help?**

1. Check GitHub Actions logs for detailed error messages
2. Verify token has correct scopes
3. Check repository permissions
4. Review [GitHub Actions documentation](https://docs.github.com/en/actions)

---

**Version:** 3.1.0
**Last Updated:** 2025-01-05
**Related:** Release Workflow, GitHub Actions
