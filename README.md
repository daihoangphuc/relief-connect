# 🚨 RELIEF CONNECT - Hệ thống Cứu trợ Khẩn cấp

[![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black)](https://nextjs.org/)
[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4)](https://dotnet.microsoft.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Hệ thống kết nối người cần giúp đỡ với tình nguyện viên trong tình huống khẩn cấp (bão lũ, thiên tai) **mà không cần đăng nhập/đăng ký**.

![RELIEF CONNECT Banner](https://via.placeholder.com/1200x300/3b82f6/ffffff?text=RELIEF+CONNECT)

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Tính năng](#-tính-năng)
- [Tech Stack](#-tech-stack)
- [Cấu trúc Dự án](#-cấu-trúc-dự-án)
- [Cài đặt & Chạy](#-cài-đặt--chạy)
- [Hướng dẫn Sử dụng](#-hướng-dẫn-sử-dụng)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Tổng quan

**RELIEF CONNECT** là hệ thống full-stack giúp kết nối người dân cần hỗ trợ với tình nguyện viên trong tình huống khẩn cấp. Hệ thống được thiết kế để:

- ✅ **Không cần đăng nhập**: Phù hợp cho tình huống khẩn cấp
- ✅ **Real-time**: Cập nhật trạng thái ngay lập tức
- ✅ **Geolocation**: Tự động xác định vị trí
- ✅ **Anonymous**: Bảo vệ quyền riêng tư người dùng
- ✅ **Responsive**: Hoạt động tốt trên mọi thiết bị

---

## ✨ Tính năng

### Cho Người Cần Giúp Đỡ
- 🆘 Gửi yêu cầu SOS với vị trí GPS
- 📍 Tự động xác định địa chỉ
- 📝 Mô tả chi tiết tình huống
- 📞 Thêm số điện thoại liên hệ (tùy chọn)

### Cho Tình Nguyện Viên
- 🗺️ Xem danh sách yêu cầu trên bản đồ
- 🔍 Lọc theo trạng thái (Đang chờ, Đang hỗ trợ, Hoàn thành)
- ✅ Nhận nhiệm vụ hỗ trợ
- 📊 Theo dõi nhiệm vụ đã nhận
- ✔️ Đánh dấu hoàn thành

### Hệ thống
- 🔄 Cập nhật trạng thái real-time
- 🗃️ Lưu trữ dữ liệu trên Supabase
- 🌐 CORS enabled cho cross-origin requests
- 📱 PWA ready (Progressive Web App)

---

## 🛠️ Tech Stack

### Frontend (`relief-web/`)
- **Framework**: Next.js 16.0.3 (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 4.1.9
- **Components**: Radix UI + shadcn/ui
- **Forms**: React Hook Form + Zod
- **Maps**: Leaflet + React Leaflet
- **Icons**: Lucide React
- **Package Manager**: npm/pnpm

### Backend (`ReliefConnect.API/`)
- **Framework**: .NET 10.0 Web API
- **Language**: C# 12
- **Database**: Supabase (PostgreSQL)
- **HTTP Client**: HttpClient + IHttpClientFactory
- **Serialization**: System.Text.Json (snake_case)
- **Documentation**: Swagger/OpenAPI

### Database
- **Provider**: Supabase
- **Type**: PostgreSQL
- **Tables**: 
  - `relief_requests` - Yêu cầu cứu trợ
  - `relief_missions` - Nhiệm vụ hỗ trợ
  - `request_items` - Vật phẩm cần hỗ trợ

---

## 📁 Cấu trúc Dự án

```
RELIEF CONNECT/
├── relief-web/                 # Frontend Next.js
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Landing page
│   │   ├── request/           # Trang gửi yêu cầu
│   │   ├── volunteer/         # Trang tình nguyện viên
│   │   └── missions/          # Trang quản lý nhiệm vụ
│   ├── components/            # React components (60+)
│   │   ├── ui/               # shadcn/ui components
│   │   ├── request-list.tsx  # Danh sách yêu cầu
│   │   └── request-map.tsx   # Bản đồ hiển thị vị trí
│   ├── lib/
│   │   └── api.ts            # API client + fallback logic
│   ├── types/                # TypeScript definitions
│   └── public/               # Static assets
│
├── ReliefConnect.API/         # Backend .NET
│   ├── Controllers/
│   │   ├── RequestsController.cs   # API yêu cầu
│   │   └── MissionsController.cs   # API nhiệm vụ
│   ├── Models/
│   │   ├── ReliefRequest.cs
│   │   ├── ReliefMission.cs
│   │   └── RequestItem.cs
│   ├── Program.cs            # Entry point
│   └── appsettings.json      # Configuration
│
├── schema.sql                # Database schema
├── doc-for-frontend.md       # Frontend documentation
└── README.md                 # This file
```

---

## 🚀 Cài đặt & Chạy

### Yêu cầu Hệ thống

- **Node.js**: 18.x hoặc cao hơn
- **.NET SDK**: 10.0
- **Supabase Account**: Miễn phí tại [supabase.com](https://supabase.com)
- **Git**: Để clone repository

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/relief-connect.git
cd relief-connect
```

### 2️⃣ Cài đặt Database (Supabase)

1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com)
2. Tạo project mới
3. Vào **SQL Editor** và chạy file `schema.sql`
4. Lấy credentials:
   - Vào **Project Settings** → **API**
   - Copy **Project URL** và **anon/public key**

### 3️⃣ Cấu hình Backend

```bash
cd ReliefConnect.API
```

Mở `appsettings.json` và cập nhật:

```json
{
  "SupabaseUrl": "https://your-project.supabase.co",
  "SupabaseKey": "your-anon-key-here"
}
```

Chạy backend:

```bash
dotnet restore
dotnet run
```

✅ Backend chạy tại: `http://localhost:5162`  
✅ Swagger UI: `http://localhost:5162/swagger`

### 4️⃣ Cấu hình Frontend

```bash
cd ../relief-web
```

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5162/api
```

Cài đặt dependencies:

```bash
npm install
# hoặc
pnpm install
```

Chạy frontend:

```bash
npm run dev
# hoặc
pnpm dev
```

✅ Frontend chạy tại: `http://localhost:3000`

### 5️⃣ (Optional) Expose API với Ngrok

Nếu cần public URL cho API:

```bash
ngrok http 5162
```

Cập nhật `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-ngrok-url.ngrok-free.app/api
```

---

## 📖 Hướng dẫn Sử dụng

### Người Cần Giúp Đỡ

1. Truy cập `http://localhost:3000`
2. Click **"Tôi Cần Giúp Đỡ"**
3. Điền thông tin:
   - Tiêu đề yêu cầu
   - Mô tả chi tiết
   - Vị trí (tự động hoặc nhập thủ công)
   - Số điện thoại (tùy chọn)
4. Click **"Gửi Yêu Cầu SOS"**
5. Nhận mã yêu cầu để theo dõi

### Tình Nguyện Viên

1. Truy cập `http://localhost:3000`
2. Click **"Tôi Muốn Giúp"**
3. Xem danh sách yêu cầu
4. Click **"Xem & Nhận Hỗ Trợ"** trên yêu cầu
5. Xem bản đồ vị trí
6. Click **"Tôi Nhận Nhiệm Vụ Này"**
7. Vào **"Nhiệm vụ của tôi"** để theo dõi
8. Đánh dấu **"Hoàn thành"** khi xong

---

## 📡 API Documentation

### Base URL
```
http://localhost:5162/api
```

### Endpoints

#### 1. Tạo yêu cầu mới
```http
POST /api/requests
Content-Type: application/json

{
  "requester_id": "uuid",
  "title": "Cần nước sạch",
  "description": "Khu vực bị ngập",
  "latitude": 10.762622,
  "longitude": 106.660172,
  "address": "Xã Bình Phú, Vĩnh Long",
  "contact_phone": "0901234567"
}
```

#### 2. Lấy danh sách yêu cầu
```http
GET /api/requests
GET /api/requests?status=0  # Lọc theo status
```

#### 3. Nhận nhiệm vụ
```http
POST /api/missions/accept/{requestId}
Content-Type: application/json

"donor-uuid-here"
```

#### 4. Hoàn thành nhiệm vụ
```http
POST /api/missions/complete/{missionId}
```

### Status Codes
- `0` - Open (Đang chờ)
- `1` - InProgress (Đang hỗ trợ)
- `2` - Completed (Hoàn thành)
- `3` - Cancelled (Đã hủy)

Chi tiết API: Xem [ReliefConnect.API/README.md](ReliefConnect.API/README.md)

---

## 📸 Screenshots

### Landing Page
![Landing Page](https://via.placeholder.com/800x500/3b82f6/ffffff?text=Landing+Page)

### Request Form
![Request Form](https://via.placeholder.com/800x500/ef4444/ffffff?text=Request+Form)

### Volunteer Dashboard
![Volunteer Dashboard](https://via.placeholder.com/800x500/10b981/ffffff?text=Volunteer+Dashboard)

### Map View
![Map View](https://via.placeholder.com/800x500/f59e0b/ffffff?text=Map+View)

---

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd relief-web
vercel
```

Hoặc kết nối GitHub repo với Vercel Dashboard.

**Environment Variables cần thiết**:
```
NEXT_PUBLIC_API_URL=https://your-api-url.com/api
```

### Backend (Railway/Render)

1. Tạo project mới trên Railway/Render
2. Connect GitHub repository
3. Set build command: `dotnet publish -c Release`
4. Set start command: `dotnet ReliefConnect.API.dll`
5. Thêm environment variables:
   - `SupabaseUrl`
   - `SupabaseKey`

### Database (Supabase)

Database đã được host sẵn trên Supabase, không cần deploy riêng.

---

## 🤝 Contributing

Chúng tôi hoan nghênh mọi đóng góp! Để contribute:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

### Coding Standards

- **Frontend**: ESLint + Prettier
- **Backend**: .NET coding conventions
- **Commits**: Conventional Commits format

---

## 📄 License

Dự án này được phát hành dưới giấy phép **MIT License** - xem file [LICENSE](LICENSE) để biết chi tiết.

```
MIT License - Free to use for humanitarian purposes
```

---

## 👥 Team

Dự án được phát triển để hỗ trợ công tác cứu trợ khẩn cấp tại Việt Nam.

**Maintainers**:
- Your Name - [@yourhandle](https://github.com/yourhandle)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React Framework
- [.NET](https://dotnet.microsoft.com/) - Backend Framework
- [Supabase](https://supabase.com/) - Database & Backend
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Leaflet](https://leafletjs.com/) - Interactive Maps
- [Radix UI](https://www.radix-ui.com/) - Headless UI Components

---

## 📞 Support

Nếu bạn gặp vấn đề hoặc có câu hỏi:

- 🐛 [Báo lỗi](https://github.com/your-username/relief-connect/issues)
- 💬 [Discussions](https://github.com/your-username/relief-connect/discussions)
- 📧 Email: your-email@example.com

---

## 🗺️ Roadmap

- [ ] Thêm authentication cho admin
- [ ] Tích hợp SMS notifications
- [ ] Thêm chat real-time
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] Export reports (PDF/Excel)

---

<div align="center">

**⭐ Nếu dự án hữu ích, hãy cho chúng tôi một star! ⭐**

Made with ❤️ for humanitarian purposes

</div>
