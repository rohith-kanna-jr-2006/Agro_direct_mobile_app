# Steps to Add/Update Files to GitHub

Follow these steps to push your local changes to the GitHub repository.

## 1. Check Status
First, check which files have been modified or are new.
```bash
git status
```

## 2. Add Files to Staging
Add the files you want to update.
- To add **all** changed files:
  ```bash
  git add .
  ```
- To add specific files:
  ```bash
  git add path/to/your/file.ext
  ```

## 3. Commit Changes
Save your changes with a descriptive message.
```bash
git commit -m "Your commit message here"
```

## 4. Push to GitHub
Upload your commits to the remote repository.
```bash
git push
```
*(If you are on a different branch, use `git push origin <branch-name>`)*

## Common Issues & Solutions

### "Updates were rejected because the remote contains work that you do not have"
This happens if changes were made on GitHub or by someone else. You need to pull first.
```bash
git pull
```
If there are merge conflicts, you will need to resolve them in your editor, then add and commit again.

### "Authentication failed"
Ensure you are logged in. You may need to generate a Personal Access Token (PAT) if password authentication is disabled.



Next Steps:
Go to your GitHub repository: Agro_direct_mobile_app
You should see a yellow banner asking to "Compare & pull request".
Click that button to create a Pull Request (PR) and merge your changes into master.
This workflow (Branch -> PR -> Merge) is the standard and recommended way to update code on GitHub.

e.g.

bash
git checkout -b new-feature
# make changes
git add .;
git commit -m "Add new feature 4/2/2026 v2";
git push -u origin new-feature
# Then open PR on GitHub