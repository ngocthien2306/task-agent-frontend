# Hướng dẫn Deploy lên GitHub Pages

## Thiết lập ban đầu

### 1. Cấu hình Repository

1. **Đẩy code lên GitHub:**
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

2. **Bật GitHub Pages trong repository settings:**
   - Vào repository trên GitHub
   - Chọn **Settings** → **Pages**
   - Trong **Source**, chọn **GitHub Actions**

### 2. Cấu hình Vite cho GitHub Pages

File `vite.config.js` đã được cấu hình để sử dụng base path phù hợp:

```javascript
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/task-agent-frontend/' : '/',
})
```

**Lưu ý:** Thay đổi `/task-agent-frontend/` thành tên repository thực tế của bạn nếu khác.

### 3. GitHub Actions Workflow

File `.github/workflows/deploy.yml` đã được tạo để tự động deploy khi có push vào branch `main`.

## Quy trình Deploy

### Deploy Tự động
- Mỗi khi push code lên branch `main`, GitHub Actions sẽ tự động:
  1. Build project với `npm run build`
  2. Deploy lên GitHub Pages
  3. Website sẽ có thể truy cập tại: `https://[username].github.io/task-agent-frontend/`

### Deploy Thủ công
1. Vào tab **Actions** trong repository
2. Chọn workflow **Deploy to GitHub Pages**
3. Nhấn **Run workflow**

## Kiểm tra Deploy

1. **Xem trạng thái build:**
   - Vào tab **Actions** để theo dõi quá trình build
   - Màu xanh = thành công, màu đỏ = lỗi

2. **Truy cập website:**
   - URL: `https://[username].github.io/task-agent-frontend/`
   - Có thể mất 5-10 phút để website cập nhật

## Xử lý lỗi thường gặp

### 1. Build fail
- Kiểm tra logs trong tab **Actions**
- Đảm bảo `package.json` có script `build`
- Chạy `npm run build` local để test

### 2. Website không load được assets
- Kiểm tra `base` path trong `vite.config.js`
- Đảm bảo tên repository trong base path chính xác

### 3. 404 khi refresh page
- Tạo file `public/404.html` copy nội dung từ `dist/index.html` sau khi build

## Branch Strategy

- **Main branch:** Code production, tự động deploy
- **Develop/feature branches:** Code development, không auto-deploy
- Chỉ merge vào `main` khi code đã tested kỹ

## Environment Variables

Nếu dự án sử dụng environment variables:

1. **Thêm vào GitHub Secrets:**
   - Repository Settings → Secrets and variables → Actions
   - Thêm các biến cần thiết

2. **Cập nhật workflow:**
   ```yaml
   - name: Build
     run: npm run build
     env:
       VITE_API_URL: ${{ secrets.VITE_API_URL }}
   ```

## Custom Domain (Tùy chọn)

Nếu muốn sử dụng domain riêng:

1. Tạo file `public/CNAME` với nội dung là domain name
2. Cấu hình DNS trỏ về GitHub Pages
3. Cập nhật base path trong `vite.config.js` thành `'/'`