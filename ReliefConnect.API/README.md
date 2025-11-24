# RELIEF CONNECT - Backend API Documentation

## 📋 Tổng quan

**RELIEF CONNECT** là hệ thống API backend cho ứng dụng điều phối cứu trợ khẩn cấp. Hệ thống cho phép người dân gửi yêu cầu cứu trợ và đội ngũ tình nguyện nhận nhiệm vụ hỗ trợ **mà không cần đăng nhập/đăng ký** - phù hợp cho tình huống khẩn cấp như bão lũ, thiên tai.

### Tech Stack
- **.NET 10.0** - Web API Framework
- **Supabase (PostgreSQL)** - Database
- **HttpClient** - REST API communication
- **Swagger/OpenAPI** - API Documentation

---

## 🚀 Cài đặt & Chạy

### 1. Yêu cầu hệ thống
- .NET 10.0 SDK
- Tài khoản Supabase (miễn phí tại [supabase.com](https://supabase.com))

### 2. Cấu hình Database

#### Bước 1: Tạo Database Schema
1. Đăng nhập vào **Supabase Dashboard**
2. Vào **SQL Editor**
3. Copy nội dung file `schema.sql` và chạy

#### Bước 2: Lấy Credentials
1. Vào **Project Settings** → **API**
2. Copy:
   - **Project URL** (ví dụ: `https://xxxxx.supabase.co`)
   - **anon/public key**

#### Bước 3: Cấu hình Backend
Mở file `appsettings.json` và cập nhật:

```json
{
  "SupabaseUrl": "https://your-project.supabase.co",
  "SupabaseKey": "your-anon-key-here"
}
```

### 3. Chạy Backend

```bash
cd ReliefConnect.API
dotnet restore
dotnet run
```

API sẽ chạy tại:
- **HTTP**: `http://localhost:5162`
- **Swagger UI**: `http://localhost:5162/swagger`

### 4. Deploy với Ngrok (Optional - cho Frontend từ xa)

Nếu Frontend chạy trên máy khác hoặc cần public URL:

```bash
# Terminal riêng
ngrok http --domain=heron-dear-bison.ngrok-free.app 5162
```

API sẽ có public URL: `https://heron-dear-bison.ngrok-free.app`

**Lưu ý:** Frontend cần update API URL từ `http://localhost:5162` → `https://heron-dear-bison.ngrok-free.app`

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5162/api
```

### 1. **Relief Requests** - Quản lý yêu cầu cứu trợ

#### 📤 Tạo yêu cầu mới
```http
POST /api/requests
Content-Type: application/json

{
  "requester_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Cần nước sạch và lương thực",
  "description": "Khu vực bị cô lập, 50 người cần hỗ trợ gấp",
  "latitude": 10.762622,
  "longitude": 106.660172,
  "address": "Xã Bình Phú, Tỉnh Vĩnh Long, Việt Nam",
  "contact_phone": "0901234567"
}
```

**Lưu ý quan trọng:**
- Tất cả field names phải dùng **snake_case** (vd: `requester_id`, `created_at`)
- `requester_id` có thể là UUID bất kỳ (anonymous system)
- Backend tự động set `status = 0` và `created_at = UTC now`

**Response (201 Created):**
```json
{
  "id": "9c9480e7-e27c-4a25-bf71-b02255bb5837",
  "requester_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Cần nước sạch và lương thực",
  "description": "Khu vực bị cô lập, 50 người cần hỗ trợ gấp",
  "latitude": 10.762622,
  "longitude": 106.660172,
  "address": "Xã Bình Phú, Tỉnh Vĩnh Long, Việt Nam",
  "contact_phone": "0901234567",
  "status": 0,
  "created_at": "2025-11-24T10:00:00+00:00"
}
```

#### 📥 Lấy danh sách yêu cầu
```http
GET /api/requests
GET /api/requests?status=0  # Lọc theo status
```

**Response (200 OK):**
```json
[
  {
    "id": "9c9480e7-e27c-4a25-bf71-b02255bb5837",
    "requester_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Cần nước sạch",
    "description": "Khu vực bị cô lập",
    "latitude": 10.762622,
    "longitude": 106.660172,
    "address": "Xã Bình Phú, Tỉnh Vĩnh Long",
    "contact_phone": "0901234567",
    "status": 0,
    "created_at": "2025-11-24T10:00:00+00:00"
  }
]
```

---

### 2. **Missions** - Quản lý nhiệm vụ cứu trợ

#### ✅ Nhận nhiệm vụ hỗ trợ
```http
POST /api/missions/accept/{requestId}
Content-Type: application/json

"a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

**Lưu ý:** Body là một string UUID (trong dấu ngoặc kép), không phải object JSON.

**Response (200 OK):**
```json
{
  "id": "mission-uuid",
  "request_id": "request-uuid",
  "donor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "started_at": "2025-11-24T10:00:00+00:00",
  "completed_at": null,
  "proof_image": null
}
```

**Side Effects:**
- API tự động cập nhật `status` của request từ `0` (Open) → `1` (InProgress)
- Kiểm tra race condition: Nếu request đã được nhận, trả lỗi `400 Bad Request`

#### ✔️ Hoàn thành nhiệm vụ
```http
POST /api/missions/complete/{missionId}
```

**Response (200 OK):**
```json
{
  "id": "mission-uuid",
  "request_id": "request-uuid",
  "donor_id": "donor-uuid",
  "started_at": "2025-11-24T10:00:00+00:00",
  "completed_at": "2025-11-24T11:00:00+00:00",
  "proof_image": null
}
```

**Side Effects:**
- API tự động cập nhật `completed_at` của mission
- API tự động cập nhật `status` của request từ `1` (InProgress) → `2` (Completed)

---

## 🗂️ Database Schema

### Bảng: `relief_requests`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID | Primary key |
| `requester_id` | UUID | ID người yêu cầu (nullable, anonymous) |
| `title` | TEXT | Tiêu đề yêu cầu |
| `description` | TEXT | Mô tả chi tiết |
| `latitude` | FLOAT | Vĩ độ GPS |
| `longitude` | FLOAT | Kinh độ GPS |
| `address` | TEXT | Địa chỉ |
| `contact_phone` | TEXT | Số điện thoại liên hệ (nullable) |
| `status` | INT | 0=Open, 1=InProgress, 2=Completed, 3=Cancelled |
| `created_at` | TIMESTAMP | Thời gian tạo |

### Bảng: `request_items`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID | Primary key |
| `request_id` | UUID | ID yêu cầu |
| `item_name` | TEXT | Tên vật phẩm |
| `quantity_needed` | INT | Số lượng cần |
| `unit` | TEXT | Đơn vị (kg, lít, cái...) |

### Bảng: `relief_missions`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID | Primary key |
| `request_id` | UUID | ID yêu cầu |
| `donor_id` | UUID | ID người hỗ trợ (nullable, anonymous) |
| `started_at` | TIMESTAMP | Thời gian bắt đầu |
| `completed_at` | TIMESTAMP | Thời gian hoàn thành |
| `proof_image` | TEXT | URL ảnh chứng minh (optional) |

---

## 🔧 Cấu trúc Project

```
ReliefConnect.API/
├── Controllers/
│   ├── AuthController.cs       # (Deprecated - không dùng)
│   ├── RequestsController.cs   # API quản lý yêu cầu
│   └── MissionsController.cs   # API quản lý nhiệm vụ
├── Models/
│   ├── ReliefRequest.cs        # Model yêu cầu cứu trợ
│   ├── RequestItem.cs          # Model vật phẩm cần hỗ trợ
│   ├── ReliefMission.cs        # Model nhiệm vụ
│   └── User.cs                 # (Deprecated - không dùng)
├── Program.cs                  # Entry point, DI configuration
├── appsettings.json            # Configuration (Supabase credentials)
└── schema.sql                  # Database schema
```

---

## 🎯 Status Codes

### Request Status
- `0` - **Open**: Yêu cầu mới, chưa có ai nhận
- `1` - **InProgress**: Đã có người nhận, đang hỗ trợ
- `2` - **Completed**: Đã hoàn thành
- `3` - **Cancelled**: Đã hủy

---

## 🔐 CORS Configuration

API đã được cấu hình CORS cho phép tất cả origins (phù hợp cho development):

```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", b => 
        b.AllowAnyOrigin()
         .AllowAnyMethod()
         .AllowAnyHeader());
});
```

**Lưu ý:** Trong production, nên giới hạn origins cụ thể.

---

## 📝 Logging

API sử dụng `ILogger` để ghi log chi tiết:
- Request/Response từ Supabase
- Lỗi khi tạo/cập nhật dữ liệu
- HTTP status codes

Xem log trong terminal khi chạy `dotnet run`.

---

## 🧪 Testing với Swagger

1. Chạy backend: `dotnet run`
2. Mở trình duyệt: `http://localhost:5162/swagger`
3. Test các endpoints trực tiếp trong UI

---

## 🚨 Lưu ý quan trọng

### 1. Anonymous System
- Hệ thống **không yêu cầu authentication**
- `requesterId` và `donorId` có thể là UUID bất kỳ
- Phù hợp cho tình huống khẩn cấp

### 2. Race Condition Handling
API `missions/accept` có xử lý cơ bản cho race condition:
- Kiểm tra `status` trước khi accept
- Trả lỗi nếu request đã được nhận

### 3. Data Validation
- Tất cả trường bắt buộc được validate
- Latitude/Longitude phải là số hợp lệ
- Title và Description không được rỗng

---

## 🐛 Troubleshooting

### Lỗi: "Failed to bind to address"
**Nguyên nhân:** Port 5162 đã được sử dụng  
**Giải pháp:**
```bash
# Windows
netstat -ano | findstr :5162
taskkill /F /PID <process_id>
```

### Lỗi: "Could not find the 'items' column"
**Nguyên nhân:** Model có property `Items` nhưng database không có cột này  
**Giải pháp:** Đã thêm `[JsonIgnore]` vào property `Items`

### Lỗi: "Foreign key constraint violation"
**Nguyên nhân:** Database có foreign key constraints  
**Giải pháp:** Chạy lại `schema.sql` mới (không có foreign keys)

---

## 📞 API Response Examples

### Success Response
```json
{
  "id": "uuid",
  "title": "...",
  "status": 0
}
```

### Error Response
```json
{
  "error": "Failed to create request",
  "details": "Detailed error message from Supabase"
}
```

---

## 🔄 Workflow

1. **Người dân gửi yêu cầu** → `POST /api/requests`
2. **Hệ thống lưu vào DB** → Status = 0 (Open)
3. **Tình nguyện viên xem danh sách** → `GET /api/requests?status=0`
4. **Nhận nhiệm vụ** → `POST /api/missions/accept/{requestId}`
5. **Hệ thống cập nhật** → Status = 1 (InProgress)
6. **Hoàn thành** → `POST /api/missions/complete/{missionId}`
7. **Hệ thống cập nhật** → Status = 2 (Completed)

---

## 📦 Dependencies

```xml
<PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="8.0.0" />
<PackageReference Include="postgrest-csharp" Version="3.5.1" />
<PackageReference Include="Supabase" Version="1.1.1" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="10.0.1" />
```

---

## 🎨 Frontend Integration

### Axios Example (React/Vue/Angular)

```javascript
// Lấy danh sách yêu cầu
const response = await axios.get('http://localhost:5162/api/requests');
const requests = response.data;

// Tạo yêu cầu mới - QUAN TRỌNG: Dùng snake_case
const newRequest = await axios.post('http://localhost:5162/api/requests', {
  requester_id: crypto.randomUUID(), // snake_case, không phải requesterId
  title: "Cần nước sạch",
  description: "Khu vực bị cô lập",
  latitude: 10.762622,
  longitude: 106.660172,
  address: "Xã Bình Phú, Tỉnh Vĩnh Long"
});

// Nhận nhiệm vụ - Body là string UUID
const donorId = crypto.randomUUID();
await axios.post(
  `http://localhost:5162/api/missions/accept/${requestId}`,
  `"${donorId}"`, // String với dấu ngoặc kép
  { headers: { 'Content-Type': 'application/json' } }
);

// Response sẽ có snake_case fields
console.log(newRequest.data.created_at); // không phải createdAt
console.log(newRequest.data.requester_id); // không phải requesterId
```

### Lưu ý quan trọng cho Frontend Developer

1. **Snake Case Convention:**
   - API sử dụng `snake_case` cho tất cả field names
   - Request: `requester_id`, `created_at`
   - Response: `requester_id`, `created_at`, `request_id`, `donor_id`, `started_at`, `completed_at`

2. **UUID Format:**
   - Tất cả IDs đều là UUID string
   - Có thể dùng `crypto.randomUUID()` để generate

3. **Missions Accept:**
   - Body phải là string UUID (trong dấu ngoặc kép)
   - Ví dụ: `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`
   - **KHÔNG** gửi object `{ donorId: "..." }`

---

## 📄 License

MIT License - Free to use for humanitarian purposes

---

## 👥 Contact

Dự án được phát triển để hỗ trợ công tác cứu trợ khẩn cấp tại Việt Nam.

**Lưu ý:** Đây là phiên bản MVP (Minimum Viable Product) - tối ưu cho tốc độ triển khai trong tình huống khẩn cấp.
