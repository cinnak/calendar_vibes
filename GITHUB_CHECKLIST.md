# 🚀 GitHub Pre-Push Checklist

Use this checklist before pushing your project to GitHub.

## ✅ Security & Privacy

- [ ] `.env` file is in `.gitignore` (CRITICAL)
- [ ] `server/db.json` is in `.gitignore` (contains user tokens)
- [ ] No API keys hardcoded in source files
- [ ] `.env.example` created for reference
- [ ] Reviewed all files for sensitive data

## ✅ Documentation

- [ ] README.md is comprehensive and up-to-date
- [ ] LESSONS_LEARNED.md documents project insights
- [ ] CONTRIBUTING.md provides contribution guidelines
- [ ] Screenshots added to `docs/screenshots/` (optional but recommended)
- [ ] All links in README work correctly

## ✅ Code Quality

- [ ] All features working locally
- [ ] No console errors in browser
- [ ] Server starts without errors
- [ ] AI classification working (Gemini API key configured)
- [ ] Google Calendar authentication working

## ✅ Repository Setup

- [ ] Repository initialized (`git init`)
- [ ] Appropriate `.gitignore` in place
- [ ] Meaningful commit messages
- [ ] Main branch named `main` or `master`

## 📋 Git Commands Reference

### First Time Setup

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Initial commit
git commit -m "feat: initial commit - Calendar Vibes with AI-powered analytics"

# Create GitHub repository (via GitHub.com), then:
git remote add origin https://github.com/YOUR_USERNAME/calendar_vibes.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Subsequent Updates

```bash
# Check status
git status

# Add changes
git add .

# Commit with message
git commit -m "docs: add screenshots and update README"

# Push
git push
```

## 🎯 Post-Push Actions

After pushing to GitHub:

1. **Add Topics/Tags**: 
   - `ai`, `analytics`, `google-calendar`, `react`, `gemini`, `time-tracking`

2. **Update Repository Description**:
   - "AI-Powered Life Analytics Dashboard using Google Calendar & Gemini"

3. **Add Website** (if deployed):
   - https://your-app.vercel.app

4. **Enable Issues & Discussions** (optional)

5. **Add LICENSE file** (MIT recommended based on README)

6. **Star your own repo** 😄

## 📸 Screenshots Reminder

If you haven't added screenshots yet:
1. Start both client and server
2. Open http://localhost:5173
3. Use `Win + Shift + S` (Windows) or `Cmd + Shift + 4` (Mac)
4. Save to `docs/screenshots/dashboard.png` and `category-tuner.png`
5. Commit and push:
   ```bash
   git add docs/screenshots/
   git commit -m "docs: add application screenshots"
   git push
   ```

---

**Ready to share your amazing work with the world! 🎉**
