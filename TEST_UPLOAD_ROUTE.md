# 🎵 Test Route: Upload File Âm Thanh

## 📋 **ROUTE ĐÃ TẠO**

### **Route mới:**
- **URL**: `http://localhost:3000/#/admin/test-upload`
- **Component**: `AudioUploadTest.js`
- **Menu**: Sidebar → Quản lý nội dung → "Test Upload Audio"

---

## 🚀 **CÁCH TRUY CẬP**

### **Bước 1: Đăng nhập**
1. Mở `http://localhost:3000/#/auth/login`
2. Đăng nhập với tài khoản Teacher hoặc Admin:
   - **Teacher**: `teacher@skillbridge.com` / `teacher123`
   - **Admin**: `admin@skillbridge.com` / `admin123`

### **Bước 2: Truy cập Test Upload**
1. Sau khi đăng nhập thành công → tự động redirect tới Dashboard
2. Click menu **"Test Upload Audio"** trong sidebar (section "Quản lý nội dung")
3. Hoặc truy cập trực tiếp: `http://localhost:3000/#/admin/test-upload`

---

## 🎯 **CHỨC NĂNG TRONG TEST PAGE**

### **✅ Features có thể test:**

#### **1. File Validation**
- Kéo thả file vào drop zone
- Hoặc click "Chọn file audio"
- **Test cases:**
  - ✅ File hợp lệ (MP3, WAV, M4A, AAC, OGG)
  - ❌ File không hợp lệ (PDF, TXT, JPG, etc.)
  - ❌ File quá lớn (>50MB)
  - ❌ File rỗng hoặc corrupt

#### **2. Audio Duration Detection**
- Tự động detect thời lượng audio sau khi chọn file
- Hiển thị format MM:SS hoặc HH:MM:SS

#### **3. Upload Progress Tracking**
- Real-time progress bar (0-100%)
- Console logs với emoji indicators
- XMLHttpRequest progress events

#### **4. Upload Methods**
- **Upload thường**: Single attempt
- **Upload với retry**: Auto-retry up to 3 times với exponential backoff

#### **5. Audio Player**
- Sau upload thành công → hiện audio player
- Test playback audio đã upload

#### **6. File Management**
- **Delete**: Xóa file đã upload
- **Reset**: Clear tất cả states

---

## 🧪 **TEST SCENARIOS**

### **Scenario 1: Happy Path**
```
1. Chọn file MP3 hợp lệ (< 50MB)
2. Check validation status → "File hợp lệ" ✅
3. Click "Upload thường"
4. Watch progress bar → 0% → 100%
5. Check upload result → Audio URL hiển thị
6. Test audio player → Play audio
7. Click "Xóa" → File removed successfully
```

### **Scenario 2: File Validation Errors**
```
1. Chọn file PDF → "File không hợp lệ" ❌
2. Chọn file MP3 lớn > 50MB → "File quá lớn" ❌
3. Không chọn file → "File không được để trống" ❌
```

### **Scenario 3: Network Errors**
```
1. Tắt backend server
2. Upload file → Network error
3. Bật lại backend
4. Click "Upload với retry" → Auto retry success
```

### **Scenario 4: Upload Multiple Files**
```
1. Upload file 1 → Success
2. Không reset
3. Chọn file 2 khác → Replace file 1
4. Upload file 2 → Success
```

---

## 🔧 **BACKEND REQUIREMENTS**

### **Đảm bảo backend đang chạy:**
```bash
cd skillbridge-backend/skillbridge-backend
mvn spring-boot:run
```

### **Endpoints cần hoạt động:**
- ✅ `POST /api/audio/upload` - Upload file
- ✅ `DELETE /api/audio/{fileName}` - Delete file
- ✅ `GET /api/auth/me` - Auth check
- ✅ Static file serving: `/api/uploads/audio/**`

---

## 🎨 **UI COMPONENTS TRONG TEST PAGE**

### **1. Drag & Drop Zone**
- Hover effects
- Visual feedback khi drag over
- File input integration

### **2. Validation Status Card**
- ✅ Green = Valid file
- ❌ Red = Invalid file
- File metadata display

### **3. Upload Controls**
- Button states (enabled/disabled)
- Loading indicators
- Progress visualization

### **4. Result Display**
- Success cards với file info
- Error cards với messages
- Audio player integration

### **5. Info Panel**
- Test instructions
- Supported formats
- Console logs indicator
- Endpoint information

---

## 📊 **MONITORING & DEBUGGING**

### **Browser Console Logs**
Mở DevTools → Console để xem:
```
🎵 Selected file: song.mp3
🔍 Validating audio file: song.mp3
✅ File validation passed: song.mp3
🚀 Starting upload for: song.mp3
📊 Upload progress: 25%
📊 Upload progress: 50%
📊 Upload progress: 75%
📊 Upload progress: 100%
✅ Upload successful: {audioUrl: "...", ...}
```

### **Network Tab**
Check API calls:
```
POST /api/audio/upload → 200 OK
DELETE /api/audio/filename.mp3 → 200 OK
```

### **File System**
Check uploaded files:
```
skillbridge-backend/uploads/audio/
├── 1736513234567_uuid1.mp3
├── 1736513234568_uuid2.wav
└── ...
```

---

## 🎯 **SUCCESS CRITERIA**

### **✅ Test thành công khi:**
1. **File validation** hoạt động chính xác
2. **Upload progress** hiển thị real-time
3. **Audio player** play được file uploaded
4. **Error handling** hiển thị message phù hợp
5. **Delete function** remove file thành công
6. **Console logs** hiển thị đủ thông tin
7. **UI responsive** trên mobile/desktop

### **🔧 Troubleshooting:**
- **401 Unauthorized** → Check JWT token, re-login
- **Network Error** → Check backend running
- **File not playing** → Check audio URL và CORS
- **Upload stuck** → Check file size và format

---

## 📱 **MOBILE TESTING**

### **Responsive Design:**
- Drag & drop fallback to file input on mobile
- Touch-friendly buttons
- Audio player mobile compatibility
- Sidebar collapsible menu

---

## 🚀 **NEXT STEPS AFTER TESTING**

### **Integration Points:**
1. **Listening Lesson Form** - Integrate AudioUploadTest components
2. **Lesson Management** - CRUD operations với audio files
3. **Student View** - Audio playback trong lessons
4. **File Management** - Bulk operations, file browser

### **Production Considerations:**
1. **CDN Integration** - Serve audio files từ CDN
2. **File Compression** - Auto-compress large audio files
3. **Backup Strategy** - Backup uploaded files
4. **Security** - File scanning, virus detection

---

## 🎉 **READY TO TEST!**

**Route đã sẵn sàng để test:** `http://localhost:3000/#/admin/test-upload`

1. **Login** as Teacher/Admin
2. **Navigate** to "Test Upload Audio" in sidebar  
3. **Upload** your audio files
4. **Verify** all functionality works
5. **Check** console logs và network calls
6. **Test** error scenarios

**Happy Testing! 🎵**