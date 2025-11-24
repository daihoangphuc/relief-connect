# 🚀 Hướng dẫn Push lên GitHub

## Bước 1: Khởi tạo Git Repository

```bash
# Di chuyển vào thư mục dự án
cd "d:\Tools\RELIEF CONNECT"

# Khởi tạo Git repository
git init

# Kiểm tra status
git status
```

## Bước 2: Thêm Remote Repository

### Option A: Tạo repo mới trên GitHub
1. Truy cập https://github.com/new
2. Tạo repository mới tên: `relief-connect`
3. **KHÔNG** chọn "Initialize with README" (vì đã có sẵn)
4. Copy URL của repo (ví dụ: `https://github.com/username/relief-connect.git`)

### Option B: Sử dụng GitHub CLI
```bash
# Cài đặt GitHub CLI nếu chưa có
winget install GitHub.cli

# Login
gh auth login

# Tạo repo mới
gh repo create relief-connect --public --source=. --remote=origin
```

### Thêm remote URL
```bash
git remote add origin https://github.com/YOUR_USERNAME/relief-connect.git

# Kiểm tra remote
git remote -v
```

## Bước 3: Commit Code

```bash
# Thêm tất cả files
git add .

# Kiểm tra files sẽ được commit
git status

# Commit với message
git commit -m "Initial commit: RELIEF CONNECT - Emergency Relief System"
```

## Bước 4: Push lên GitHub

```bash
# Push lên branch main
git branch -M main
git push -u origin main
```

## Bước 5: Verify

Truy cập repository trên GitHub và kiểm tra:
- ✅ README.md hiển thị đẹp
- ✅ Không có file `node_modules/`
- ✅ Không có file `.env` hoặc `appsettings.Development.json`
- ✅ Có đầy đủ source code

## 🔒 Bảo mật - QUAN TRỌNG!

### ⚠️ TRƯỚC KHI PUSH, kiểm tra:

```bash
# Kiểm tra xem có file nhạy cảm nào sẽ bị push không
git status

# Nếu thấy file nhạy cảm, thêm vào .gitignore
echo "appsettings.json" >> ReliefConnect.API/.gitignore
echo ".env.local" >> relief-web/.gitignore

# Xóa file khỏi staging
git reset HEAD <file-name>
```

### Files KHÔNG NÊN push:
- ❌ `appsettings.json` (chứa Supabase credentials)
- ❌ `.env.local` (chứa API URLs)
- ❌ `node_modules/`
- ❌ `.next/`
- ❌ `bin/`, `obj/`

### Nếu đã push nhầm credentials:

```bash
# Xóa file khỏi Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch ReliefConnect.API/appsettings.json" \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push origin --force --all
```

**SAU ĐÓ**: Đổi ngay Supabase API key trên dashboard!

## 📝 Cập nhật README với thông tin của bạn

Sửa file `README.md`:

1. Thay `your-username` bằng GitHub username của bạn
2. Thay `your-email@example.com` bằng email của bạn
3. Thêm tên và thông tin team
4. Cập nhật screenshots (nếu có)

## 🏷️ Tạo Tags và Releases

```bash
# Tạo tag cho version đầu tiên
git tag -a v1.0.0 -m "Release version 1.0.0 - MVP"

# Push tag lên GitHub
git push origin v1.0.0
```

Sau đó vào GitHub → Releases → Create new release từ tag `v1.0.0`

## 🌿 Branching Strategy (Khuyến nghị)

```bash
# Tạo branch development
git checkout -b develop
git push -u origin develop

# Tạo branch cho features mới
git checkout -b feature/new-feature
# ... code ...
git add .
git commit -m "feat: add new feature"
git push -u origin feature/new-feature
```

### Branch structure:
- `main` - Production code (stable)
- `develop` - Development code
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent fixes

## 🔄 Workflow hàng ngày

```bash
# Pull latest changes
git pull origin main

# Tạo branch mới cho feature
git checkout -b feature/my-feature

# Code và commit
git add .
git commit -m "feat: implement my feature"

# Push lên GitHub
git push -u origin feature/my-feature

# Tạo Pull Request trên GitHub
# Sau khi review → Merge vào main
```

## 📦 Cập nhật .gitignore sau khi push

Nếu cần thêm file vào .gitignore sau khi đã commit:

```bash
# Thêm vào .gitignore
echo "new-file-to-ignore" >> .gitignore

# Xóa file khỏi Git tracking (nhưng giữ local)
git rm --cached <file-name>

# Commit
git add .gitignore
git commit -m "chore: update .gitignore"
git push
```

## 🎯 Quick Commands

```bash
# Xem history
git log --oneline --graph --all

# Xem changes
git diff

# Undo last commit (giữ changes)
git reset --soft HEAD~1

# Undo last commit (xóa changes)
git reset --hard HEAD~1

# Stash changes
git stash
git stash pop

# Xem remote URL
git remote -v
```

## ✅ Checklist trước khi Push

- [ ] Đã tạo `.gitignore` cho frontend và backend
- [ ] Đã kiểm tra không có file nhạy cảm trong `git status`
- [ ] Đã test code chạy tốt locally
- [ ] Đã viết README.md rõ ràng
- [ ] Đã commit với message có ý nghĩa
- [ ] Đã tạo repository trên GitHub
- [ ] Đã thêm remote origin

## 🆘 Troubleshooting

### Lỗi: "fatal: remote origin already exists"
```bash
git remote remove origin
git remote add origin <your-repo-url>
```

### Lỗi: "Permission denied (publickey)"
```bash
# Tạo SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Thêm vào GitHub Settings → SSH Keys
```

### Lỗi: "Updates were rejected"
```bash
# Pull trước khi push
git pull origin main --rebase
git push origin main
```

---

**Chúc bạn push code thành công! 🎉**
