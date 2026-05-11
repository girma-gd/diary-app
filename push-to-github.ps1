git config --global user.email "girmadereje27@gmail.com"
git config --global user.name "girma-gd"
git add .
git commit -m "Initial commit: diary app with Google OAuth"
git branch -M main
git remote remove origin 2>$null
git remote add origin https://github.com/girma-gd/diary-app.git
git push -u origin main
