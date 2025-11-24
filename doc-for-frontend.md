# RELIEF CONNECT API - Frontend Integration Guide

> **Tài liệu dành cho Frontend Developers**  
> Phiên bản: 1.0 | Cập nhật: 2025-11-24

---

## 📋 Tổng quan

API Backend cho hệ thống cứu trợ khẩn cấp **RELIEF CONNECT**. Hệ thống **không yêu cầu authentication** - phù hợp cho tình huống khẩn cấp.

### Tech Stack
- **.NET 10.0** Web API
- **Supabase (PostgreSQL)** Database
- **Snake_case** naming convention
- **CORS enabled** - Allow all origins

### Base URLs

```javascript
// Development (localhost)
const API_BASE_URL = 'http://localhost:5162';

// Production (ngrok)
const API_BASE_URL = 'https://heron-dear-bison.ngrok-free.app';
```

---

## 🚀 Quick Start

### 1. Setup API Config

Tạo file `src/config/api.js`:

```javascript
export const API_BASE_URL = 'https://heron-dear-bison.ngrok-free.app';

export const API_ENDPOINTS = {
  requests: `${API_BASE_URL}/api/requests`,
  missions: `${API_BASE_URL}/api/missions`,
};
```

### 2. Install Dependencies

```bash
npm install axios
```

### 3. Basic Usage

```javascript
import axios from 'axios';
import { API_BASE_URL } from './config/api';

// Lấy danh sách requests
const response = await axios.get(`${API_BASE_URL}/api/requests`);
console.log(response.data);
```

---

## 📡 API Endpoints

### 1. GET /api/requests

Lấy danh sách tất cả yêu cầu cứu trợ.

**Request:**
```http
GET /api/requests
GET /api/requests?status=0  # Lọc theo status
```

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | int | No | Filter by status (0=Open, 1=InProgress, 2=Completed) |

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

**JavaScript Example:**
```javascript
const fetchRequests = async (status = null) => {
  try {
    const url = status !== null 
      ? `${API_BASE_URL}/api/requests?status=${status}`
      : `${API_BASE_URL}/api/requests`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
};

// Usage
const allRequests = await fetchRequests();
const openRequests = await fetchRequests(0);
```

---

### 2. POST /api/requests

Tạo yêu cầu cứu trợ mới.

**Request:**
```http
POST /api/requests
Content-Type: application/json
```

**Request Body:**
```json
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

**Field Specifications:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `requester_id` | UUID string | Yes | Anonymous requester ID (use `crypto.randomUUID()`) |
| `title` | string | Yes | Tiêu đề yêu cầu |
| `description` | string | Yes | Mô tả chi tiết |
| `latitude` | number | Yes | Vĩ độ GPS |
| `longitude` | number | Yes | Kinh độ GPS |
| `address` | string | Yes | Địa chỉ |
| `contact_phone` | string | No | Số điện thoại liên hệ |

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

**JavaScript Example:**
```javascript
const createRequest = async (formData) => {
  try {
    const payload = {
      requester_id: crypto.randomUUID(), // Generate anonymous ID
      title: formData.title,
      description: formData.description,
      latitude: formData.latitude,
      longitude: formData.longitude,
      address: formData.address,
      contact_phone: formData.contactPhone || null,
    };

    const response = await axios.post(
      `${API_BASE_URL}/api/requests`,
      payload
    );
    
    return response.data;
  } catch (error) {
    console.error('Error creating request:', error.response?.data);
    throw error;
  }
};

// Usage
const newRequest = await createRequest({
  title: "Cần nước sạch",
  description: "Khu vực bị cô lập",
  latitude: 10.762622,
  longitude: 106.660172,
  address: "Xã Bình Phú",
  contactPhone: "0901234567"
});
```

---

### 3. POST /api/missions/accept/{requestId}

Nhận nhiệm vụ hỗ trợ.

**Request:**
```http
POST /api/missions/accept/9c9480e7-e27c-4a25-bf71-b02255bb5837
Content-Type: application/json
```

**Request Body:**
```json
"a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

⚠️ **QUAN TRỌNG:** Body là một **string UUID** (có dấu ngoặc kép), KHÔNG phải object!

**Response (200 OK):**
```json
{
  "id": "mission-uuid",
  "request_id": "9c9480e7-e27c-4a25-bf71-b02255bb5837",
  "donor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "started_at": "2025-11-24T10:00:00+00:00",
  "completed_at": null,
  "proof_image": null
}
```

**Side Effects:**
- Request `status` tự động chuyển từ `0` (Open) → `1` (InProgress)
- Kiểm tra race condition: Nếu request đã được nhận, trả lỗi `400`

**JavaScript Example:**
```javascript
const acceptMission = async (requestId) => {
  try {
    const donorId = crypto.randomUUID();
    
    const response = await axios.post(
      `${API_BASE_URL}/api/missions/accept/${requestId}`,
      `"${donorId}"`, // String with quotes!
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      alert('Yêu cầu đã được nhận bởi người khác');
    }
    throw error;
  }
};

// Usage
const mission = await acceptMission('9c9480e7-e27c-4a25-bf71-b02255bb5837');
```

---

### 4. POST /api/missions/complete/{missionId}

Hoàn thành nhiệm vụ.

**Request:**
```http
POST /api/missions/complete/mission-uuid
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
- Mission `completed_at` được set
- Request `status` tự động chuyển từ `1` (InProgress) → `2` (Completed)

**JavaScript Example:**
```javascript
const completeMission = async (missionId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/missions/complete/${missionId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error completing mission:', error);
    throw error;
  }
};
```

---

## 🗂️ Data Models

### ReliefRequest

```typescript
interface ReliefRequest {
  id: string;                    // UUID
  requester_id: string;          // UUID (anonymous)
  title: string;                 // Required
  description: string;           // Required
  latitude: number;              // Required
  longitude: number;             // Required
  address: string;               // Required
  contact_phone: string | null;  // Optional
  status: number;                // 0=Open, 1=InProgress, 2=Completed, 3=Cancelled
  created_at: string;            // ISO 8601 timestamp
}
```

### ReliefMission

```typescript
interface ReliefMission {
  id: string;                    // UUID
  request_id: string;            // UUID
  donor_id: string;              // UUID (anonymous)
  started_at: string;            // ISO 8601 timestamp
  completed_at: string | null;   // ISO 8601 timestamp or null
  proof_image: string | null;    // URL or null
}
```

---

## 🎯 Status Codes

### Request Status

| Value | Name | Description | Color |
|-------|------|-------------|-------|
| `0` | Open | Yêu cầu mới, chưa có ai nhận | 🔴 Red |
| `1` | InProgress | Đã có người nhận, đang hỗ trợ | 🟡 Yellow |
| `2` | Completed | Đã hoàn thành | 🟢 Green |
| `3` | Cancelled | Đã hủy | ⚫ Gray |

**UI Mapping:**
```javascript
const statusConfig = {
  0: { label: 'Cần hỗ trợ gấp', color: 'red', icon: '🆘' },
  1: { label: 'Đang hỗ trợ', color: 'yellow', icon: '🚧' },
  2: { label: 'Đã hoàn thành', color: 'green', icon: '✅' },
  3: { label: 'Đã hủy', color: 'gray', icon: '❌' },
};
```

---

## ⚠️ Lưu ý quan trọng

### 1. Snake_case Convention

API sử dụng **snake_case** cho tất cả field names:

✅ **ĐÚNG:**
```javascript
{
  requester_id: "...",
  created_at: "...",
  contact_phone: "..."
}
```

❌ **SAI:**
```javascript
{
  requesterId: "...",
  createdAt: "...",
  contactPhone: "..."
}
```

### 2. UUID Generation

Sử dụng `crypto.randomUUID()` để generate UUID:

```javascript
const requesterId = crypto.randomUUID();
// Output: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

### 3. Missions Accept Body Format

Body phải là **string UUID** (có dấu ngoặc kép):

✅ **ĐÚNG:**
```javascript
await axios.post(url, `"${donorId}"`, { headers: {...} });
```

❌ **SAI:**
```javascript
await axios.post(url, { donorId: donorId }); // WRONG!
```

### 4. Timestamp Format

API trả về ISO 8601 format với timezone:

```javascript
"created_at": "2025-11-24T10:00:00+00:00"
```

Parse với JavaScript:
```javascript
const date = new Date(request.created_at);
```

### 5. CORS

API đã enable CORS cho tất cả origins. Không cần config đặc biệt.

---

## 🔄 Complete Workflow Example

```javascript
import axios from 'axios';
import { API_BASE_URL } from './config/api';

// 1. Người dân gửi yêu cầu
const createNewRequest = async () => {
  const payload = {
    requester_id: crypto.randomUUID(),
    title: "Cần nước sạch",
    description: "50 người cần hỗ trợ",
    latitude: 10.762622,
    longitude: 106.660172,
    address: "Xã Bình Phú",
    contact_phone: "0901234567"
  };
  
  const response = await axios.post(
    `${API_BASE_URL}/api/requests`,
    payload
  );
  
  return response.data; // status = 0 (Open)
};

// 2. Tình nguyện viên xem danh sách
const getOpenRequests = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/api/requests?status=0`
  );
  return response.data;
};

// 3. Nhận nhiệm vụ
const acceptRequest = async (requestId) => {
  const donorId = crypto.randomUUID();
  
  const response = await axios.post(
    `${API_BASE_URL}/api/missions/accept/${requestId}`,
    `"${donorId}"`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  return response.data; // Request status → 1 (InProgress)
};

// 4. Hoàn thành nhiệm vụ
const completeMission = async (missionId) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/missions/complete/${missionId}`
  );
  
  return response.data; // Request status → 2 (Completed)
};

// Full flow
const fullWorkflow = async () => {
  // Step 1: Create request
  const newRequest = await createNewRequest();
  console.log('Created:', newRequest);
  
  // Step 2: Get open requests
  const openRequests = await getOpenRequests();
  console.log('Open requests:', openRequests);
  
  // Step 3: Accept mission
  const mission = await acceptRequest(newRequest.id);
  console.log('Mission accepted:', mission);
  
  // Step 4: Complete mission
  const completedMission = await completeMission(mission.id);
  console.log('Mission completed:', completedMission);
};
```

---

## 🐛 Error Handling

### Common Errors

**400 Bad Request:**
```json
{
  "error": "Request is already taken or completed."
}
```

**404 Not Found:**
```json
{
  "error": "Request not found."
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to create request",
  "details": "Detailed error from Supabase"
}
```

### Error Handling Pattern

```javascript
const safeApiCall = async (apiFunction) => {
  try {
    return await apiFunction();
  } catch (error) {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
      alert(`Lỗi: ${error.response.data.error || 'Unknown error'}`);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
      alert('Lỗi kết nối. Vui lòng kiểm tra internet.');
    } else {
      // Something else happened
      console.error('Error:', error.message);
      alert('Đã xảy ra lỗi không xác định.');
    }
    throw error;
  }
};

// Usage
await safeApiCall(() => createRequest(formData));
```

---

## 🧪 Testing

### Swagger UI

Mở trình duyệt: `http://localhost:5162/swagger`

Test tất cả endpoints trực tiếp trong UI.

### Postman Collection

**GET Requests:**
```
GET http://localhost:5162/api/requests
GET http://localhost:5162/api/requests?status=0
```

**POST Create Request:**
```
POST http://localhost:5162/api/requests
Content-Type: application/json

{
  "requester_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Test Request",
  "description": "Test Description",
  "latitude": 10.762622,
  "longitude": 106.660172,
  "address": "Test Address",
  "contact_phone": "0901234567"
}
```

**POST Accept Mission:**
```
POST http://localhost:5162/api/missions/accept/{requestId}
Content-Type: application/json

"donor-uuid-here"
```

---

## 📞 Support

**Backend Issues:**
- Check terminal logs: `dotnet run`
- Check Swagger: `http://localhost:5162/swagger`
- Verify Supabase connection

**Frontend Issues:**
- Verify `API_BASE_URL` in `config/api.js`
- Check browser console for errors
- Verify CORS (should work by default)

**Common Fixes:**
1. Backend not running → `dotnet run`
2. Wrong URL → Update `config/api.js`
3. CORS error → Backend already configured, check URL
4. 400 error → Check snake_case field names

---

## 📝 Changelog

**v1.0 (2025-11-24)**
- ✅ Initial API documentation
- ✅ Added `contact_phone` field
- ✅ Snake_case convention
- ✅ Ngrok deployment support
- ✅ Complete workflow examples

---

**Happy Coding! 🚀**
