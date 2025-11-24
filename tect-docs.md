TÊN DỰ ÁN: RELIEF CONNECT (HỆ THỐNG ĐIỀU PHỐI CỨU TRỢ)
Phiên bản: 1.0 (MVP - Minimum Viable Product) Tech Stack:

Backend: .NET 8 Web API (C#)

Frontend: ReactJS (Vite) + Tailwind CSS

Database: SQL Server (hoặc PostgreSQL)

ORM: Entity Framework Core

Map: Leaflet + OpenStreetMap

GIAI ĐOẠN 1: PHÂN TÍCH YÊU CẦU (ANALYSIS)
1.1. Actor (Tác nhân)
Requester (Người cần/Đầu mối): Trưởng thôn, UBND xã.

Quyền: Tạo yêu cầu, cập nhật trạng thái "Đã nhận".

Donor (Người cho/Vận chuyển): Các đội cứu trợ xe tải, bán tải.

Quyền: Xem bản đồ nhu cầu, đăng ký nhận hỗ trợ (Commit), báo cáo "Đang giao".

Admin (Quản trị): Tình nguyện viên IT.

Quyền: Xác thực tài khoản Requester (tránh tin giả), quản lý danh mục hàng hóa.

1.2. Use Case Chính (Luồng nghiệp vụ)
Luồng Yêu Cầu: Đăng nhập -> Tạo Yêu cầu (Vị trí, Số lượng, Loại hàng) -> Chờ duyệt -> Hiển thị lên Map.

Luồng Cứu Trợ (Matching): Xem Map -> Lọc các điểm chưa có ai nhận -> Chọn "Tôi sẽ hỗ trợ" -> Hệ thống khóa Yêu cầu đó lại (trạng thái In Progress) -> Giao hàng -> Upload ảnh xác nhận -> Hoàn thành.

GIAI ĐOẠN 2: THIẾT KẾ HỆ THỐNG (SYSTEM DESIGN)
2.1. Thiết kế Cơ sở dữ liệu (ERD Schema)
Bạn cần tạo 4 bảng chính. Dưới đây là cấu trúc cho Entity Framework:

1. Users (Quản lý người dùng)

C#

public class User {
    public Guid Id { get; set; }
    public string FullName { get; set; }
    public string PhoneNumber { get; set; } // Dùng làm ID đăng nhập
    public string PasswordHash { get; set; }
    public string Role { get; set; } // "Requester", "Donor", "Admin"
    public bool IsVerified { get; set; } // Admin tích xanh mới được đăng bài
}
2. ReliefRequests (Nhu cầu cứu trợ)

C#

public class ReliefRequest {
    public Guid Id { get; set; }
    public Guid RequesterId { get; set; } // FK to Users
    public string Title { get; set; } // Vd: "Thôn A ngập sâu, cần nước sạch"
    public string Description { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Address { get; set; }
    public RequestStatus Status { get; set; } // Open, InProgress, Completed, Cancelled
    public DateTime CreatedAt { get; set; }
    public ICollection<RequestItem> Items { get; set; }
}

public enum RequestStatus { Open = 0, InProgress = 1, Completed = 2 }
3. RequestItems (Chi tiết hàng hóa cần)

C#

public class RequestItem {
    public Guid Id { get; set; }
    public Guid RequestId { get; set; }
    public string ItemName { get; set; } // Vd: Mì tôm, Nước, Áo phao
    public int QuantityNeeded { get; set; }
    public string Unit { get; set; } // Thùng, Chai, Cái
}
4. ReliefMissions (Chuyến đi cứu trợ - Bảng Matching)

C#

public class ReliefMission {
    public Guid Id { get; set; }
    public Guid RequestId { get; set; } // FK to ReliefRequests
    public Guid DonorId { get; set; }   // FK to Users
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string ProofImage { get; set; } // Link ảnh bằng chứng
}
2.2. Thiết kế API (RESTful Endpoints)
POST /api/auth/login: Đăng nhập.

POST /api/requests: Tạo yêu cầu mới (Requester).

GET /api/requests?status=Open: Lấy danh sách các điểm đang cần cứu trợ (cho Donor xem).

POST /api/missions/accept/{requestId}: Donor nhận kèo -> Chuyển status Request sang InProgress.

POST /api/missions/complete/{missionId}: Xác nhận đã giao xong -> Chuyển status Request sang Completed.

GIAI ĐOẠN 3: LẬP TRÌNH (IMPLEMENTATION)
3.1. Setup Backend (.NET 8)
Khởi tạo project: dotnet new webapi -n ReliefConnect.API

Cài đặt Packages:

Microsoft.EntityFrameworkCore.SqlServer

Microsoft.EntityFrameworkCore.Tools (để chạy migration)

Swashbuckle.AspNetCore (Swagger UI)

Cấu hình CORS trong Program.cs (Quan trọng để Frontend gọi được API):

C#

builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});
// ...
app.UseCors("AllowAll");
3.2. Setup Frontend (React + Vite)
Khởi tạo: npm create vite@latest relief-web -- --template react

Cài đặt thư viện bản đồ và UI:

npm install leaflet react-leaflet (Bản đồ)

npm install axios (Gọi API)

npm install tailwindcss postcss autoprefixer (Giao diện)

3.3. Logic hiển thị bản đồ (Frontend)
Sử dụng react-leaflet để render các điểm cứu trợ. Logic màu sắc marker:

Đỏ: Status == Open (Cần cứu gấp).

Vàng: Status == InProgress (Đã có đoàn đang đến - để người khác tránh trùng).

Xanh: Status == Completed (Đã an toàn).

GIAI ĐOẠN 4: KIỂM THỬ (TESTING)
Tập trung test thủ công (Manual Test) các kịch bản quan trọng (Critical Path):

Unit Test (Optional): Test logic cập nhật trạng thái.

Input: Request đang Open, Donor gọi API accept.

Expected: Request chuyển sang InProgress, tạo record mới trong bảng ReliefMissions.

Race Condition Test (Quan trọng):

Mở 2 trình duyệt, đăng nhập 2 tài khoản Donor khác nhau.

Cùng bấm "Hỗ trợ" vào một địa điểm cùng lúc.

Yêu cầu: Chỉ 1 người thành công, người kia nhận thông báo "Đã có người nhận trước bạn".

Giải pháp Backend: Sử dụng Transaction hoặc Optimistic Concurrency trong Entity Framework.

GIAI ĐOẠN 5: TRIỂN KHAI (DEPLOYMENT)
Do bạn chuyên .NET, tôi gợi ý phương án Docker hóa để dễ deploy mọi nơi.

1. Dockerfile (Backend)

Dockerfile

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "ReliefConnect.API.dll"]
2. Môi trường chạy (Hosting)

Database: Thuê một SQL Server nhỏ trên Cloud hoặc dùng Docker Compose chạy container SQL Server.

Backend: Deploy Docker Container lên một VPS giá rẻ (DigitalOcean/Vultr ~5$/tháng) hoặc Azure App Service (nếu có credit sinh viên).

Frontend: Build ra file tĩnh (npm run build) -> Deploy lên Vercel (Miễn phí và cực nhanh).

GIAI ĐOẠN 6: BẢO TRÌ & VẬN HÀNH (MAINTENANCE)
Monitoring: Cài đặt Serilog trong .NET để ghi log ra file hoặc Console. Theo dõi xem có API nào bị lỗi 500 không.

Data Backup: Viết script tự động backup Database mỗi 6 tiếng (vì dữ liệu cứu trợ thay đổi rất nhanh).

Feature Flag: Chuẩn bị sẵn cờ để bật/tắt tính năng đăng ký nếu bị spam quá nhiều.