# Git Authentication Fix Guide

## Problem
Git is using cached credentials for a different GitHub account (`Kurisu21`) when trying to push to `FitzFitzFitz69/portfolio.git`.

**Error:** `Permission to FitzFitzFitz69/portfolio.git denied to Kurisu21`

## Solution Options

### Option 1: Clear Windows Credential Manager (Recommended)

1. **Open Windows Credential Manager:**
   - Press `Win + R`
   - Type: `control /name Microsoft.CredentialManager`
   - Press Enter

2. **Find and Remove GitHub Credentials:**
   - Click on "Windows Credentials"
   - Look for entries like:
     - `git:https://github.com`
     - `github.com`
   - Click on each GitHub-related entry
   - Click "Remove" or "Delete"

3. **Try Pushing Again:**
   ```powershell
   git push -u origin main
   ```
   - Windows will prompt for credentials
   - Enter your `FitzFitzFitz69` GitHub username
   - Use a **Personal Access Token** as the password (not your GitHub password)

### Option 2: Use Personal Access Token (Best Practice)

1. **Create a Personal Access Token:**
   - Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Give it a name: "Portfolio Project"
   - Select scopes: `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

2. **Use Token When Pushing:**
   ```powershell
   git push -u origin main
   ```
   - Username: `FitzFitzFitz69`
   - Password: **Paste your Personal Access Token** (not your GitHub password)

### Option 3: Use SSH Instead of HTTPS

1. **Change Remote URL to SSH:**
   ```powershell
   git remote set-url origin git@github.com:FitzFitzFitz69/portfolio.git
   ```

2. **Set Up SSH Key** (if not already done):
   - Generate SSH key: `ssh-keygen -t ed25519 -C "cutadalamo@gmail.com"`
   - Add to SSH agent: `ssh-add ~/.ssh/id_ed25519`
   - Copy public key: `cat ~/.ssh/id_ed25519.pub`
   - Add to GitHub: Settings → SSH and GPG keys → New SSH key

3. **Push:**
   ```powershell
   git push -u origin main
   ```

### Option 4: Quick Fix - Update Remote with Token in URL

```powershell
git remote set-url origin https://YOUR_TOKEN@github.com/FitzFitzFitz69/portfolio.git
```

Replace `YOUR_TOKEN` with your Personal Access Token.

## Recommended Steps (Easiest)

1. **Clear credentials** (Option 1)
2. **Create Personal Access Token** (Option 2)
3. **Push and use token as password**

## Verify Your Git Config

Make sure your local Git config is correct:

```powershell
git config user.name "fitzfitzfitz69"
git config user.email "cutadalamo@gmail.com"
```

## After Fixing

Once authentication works, you should be able to push:

```powershell
git push -u origin main
```

## Troubleshooting

**If still getting 403 error:**
- Make sure the repository `FitzFitzFitz69/portfolio` exists on GitHub
- Verify you have write access to the repository
- Check that you're logged into the correct GitHub account in your browser
- Try using a Personal Access Token instead of password

**If credential manager keeps using wrong account:**
- Use SSH (Option 3) - most reliable
- Or manually edit Windows Credential Manager

