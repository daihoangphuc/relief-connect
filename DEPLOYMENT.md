# 🚀 DEPLOYMENT GUIDE - RELIEF CONNECT

Hướng dẫn chi tiết cách đưa dự án lên môi trường Internet.

---

## 🏗️ Kiến trúc Deployment

Dự án hiện tại là **Fullstack Next.js** (Frontend + Backend API tích hợp). Chúng ta chỉ cần deploy **1 lần duy nhất** lên Vercel.

1.  **App (Next.js)**: Deploy lên **Vercel**.
2.  **Database**: Đã có trên **Supabase** (Cloud).

---

## 1️⃣ Deploy lên Vercel

### Bước 1: Chuẩn bị
Đảm bảo bạn đã push code mới nhất lên GitHub.

### Bước 2: Import vào Vercel
1.  Truy cập [vercel.com](https://vercel.com) và đăng nhập bằng GitHub.
2.  Bấm **Add New...** -> **Project**.
3.  Chọn repository `relief-connect`.
4.  Bấm **Import**.

### Bước 3: Cấu hình Project
1.  **Framework Preset:** Next.js (Vercel tự nhận diện).
2.  **Root Directory:** Bấm **Edit** và chọn thư mục `relief-web`.
3.  **Environment Variables:**
    *   Bấm mở rộng phần Environment Variables.
    *   Thêm các biến sau (lấy từ `.env.local` của bạn):
        *   `NEXT_PUBLIC_SUPABASE_URL`: `https://your-project.supabase.co`
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `your-anon-key`
        *   `NEXT_PUBLIC_API_URL`: Để trống hoặc điền URL của Vercel sau khi deploy (ví dụ: `https://relief-connect.vercel.app/api`). *Thực ra Next.js tự hiểu relative path `/api` nên có thể không cần biến này nếu code gọi API dùng relative path.*

### Bước 4: Deploy
1.  Bấm **Deploy**.
2.  Chờ khoảng 1-2 phút để Vercel build và deploy.
3.  Khi hoàn tất, màn hình sẽ hiện hiệu ứng pháo hoa 🎉.

---

## 2️⃣ Kiểm tra sau khi Deploy

1.  Truy cập URL dự án (ví dụ: `https://relief-connect.vercel.app`).
2.  Vào trang **"Tôi Cần Giúp Đỡ"**.
3.  Thử gửi một yêu cầu -> Kiểm tra xem dữ liệu có vào Supabase không.
4.  Nếu thành công -> Hệ thống đã hoạt động 100% online!

---

## ⚠️ Troubleshooting (Sửa lỗi thường gặp)

### Lỗi 500 API
*   Kiểm tra lại **Environment Variables** trên Vercel xem đã copy đúng `SupabaseUrl` và `Key` chưa.
*   Vào tab **Logs** trên Vercel để xem chi tiết lỗi.

### Lỗi Build Failed
*   Đảm bảo bạn đã chọn đúng **Root Directory** là `relief-web`.
*   Đảm bảo không có lệnh build lạ (như `dotnet...`) trong phần Settings.

---

**Chúc mừng! Bạn đã đưa dự án ra thế giới! 🌍**
