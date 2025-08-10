# Test Route: Tạo Bài Nghe Mới

## Hướng dẫn kiểm tra chức năng

### 1. Khởi động ứng dụng
```bash
cd C:\Finall\CNPM_BookApp\Demo\SkillBridge-English\skillbridge-frontend
npm start
```

### 2. Truy cập route mới
- URL: `http://localhost:3000/#/admin/create-listening`
- Hoặc click vào menu "Tạo bài nghe" trong sidebar
- Hoặc click vào button "Tạo bài học" trong Quick Actions

### 3. Tính năng cần test

#### Tab 1: Thông tin cơ bản
- [x] Nhập tiêu đề bài học
- [x] Chọn mức độ khó (Beginner/Intermediate/Advanced)
- [x] Chọn thể loại (Conversation/News/Story/Interview/Lecture/Podcast)
- [x] Nhập tags
- [x] Nhập mô tả bài học
- [x] Nhập hướng dẫn làm bài

#### Tab 2: File âm thanh
- [x] Drag & drop file audio (MP3, WAV, M4A, AAC, OGG)
- [x] Click để chọn file audio
- [x] Validation file (size, format)
- [x] Hiển thị thông tin file
- [x] Progress bar khi upload
- [x] Audio player để nghe thử
- [x] Hiển thị thời lượng audio

#### Tab 3: Câu hỏi
- [x] Thêm/xóa câu hỏi
- [x] Nhập nội dung câu hỏi
- [x] Nhập 4 lựa chọn A, B, C, D
- [x] Chọn đáp án đúng
- [x] Nhập giải thích (tùy chọn)

#### Tab 4: Transcript
- [x] Nhập nội dung transcript
- [x] Đếm ký tự và từ
- [x] Hiển thị mẹo viết transcript

#### Các chức năng khác
- [x] Lưu bài học (validation trước khi lưu)
- [x] Xem trước bài học
- [x] Hủy bỏ (confirmation)
- [x] Hiển thị lỗi
- [x] Responsive design

### 4. Test Cases

#### Test Case 1: Tạo bài học hoàn chỉnh
1. Điền tất cả thông tin cơ bản
2. Upload file audio hợp lệ
3. Tạo ít nhất 2 câu hỏi
4. Nhập transcript
5. Click "Lưu bài học"
6. **Expected**: Hiển thị thông báo thành công

#### Test Case 2: Validation
1. Click "Lưu bài học" mà không điền tiêu đề
2. **Expected**: Hiển thị lỗi "Vui lòng nhập tiêu đề bài học"

3. Click "Lưu bài học" mà không upload audio
4. **Expected**: Hiển thị lỗi "Vui lòng upload file audio trước khi lưu"

5. Tạo câu hỏi nhưng để trống nội dung
6. **Expected**: Hiển thị lỗi "Vui lòng điền đầy đủ câu hỏi và các lựa chọn"

#### Test Case 3: Audio Upload
1. Upload file không hợp lệ (PDF, TXT, ...)
2. **Expected**: Hiển thị lỗi "Format không hỗ trợ"

3. Upload file quá lớn (>50MB)
4. **Expected**: Hiển thị lỗi "File quá lớn"

5. Upload file MP3 hợp lệ
6. **Expected**: Upload thành công, hiển thị audio player

### 5. UI/UX Test
- [x] Navigation giữa các tabs
- [x] Responsive trên mobile/tablet
- [x] Icons và colors phù hợp
- [x] Loading states
- [x] Hover effects
- [x] Form validation real-time

### 6. Console Logs để Debug
Mở Browser DevTools (F12) → Console để xem logs:
- 🎵 File selection
- 🚀 Upload start  
- 📊 Progress updates
- ✅ Success operations
- ❌ Error handling
- 💾 Save lesson data

### 7. Backend Integration (TODO)
Route này hiện tại sử dụng mock data. Cần integrate với:
- API tạo bài học: `POST /api/lessons`
- API upload audio: `POST /api/audio/upload` (đã có)
- API lưu questions: `POST /api/questions`

### 8. File Structure đã tạo
```
src/
├── views/admin/
│   ├── CreateListeningLesson.js     # Component chính
│   ├── AudioUploadTest.js          # Đã có (để test audio)
│   └── ...
├── layouts/
│   └── TeacherAdmin.js             # Đã thêm route
├── components/Sidebar/
│   └── TeacherSidebar.js           # Đã thêm menu item
└── services/
    └── audioService.js             # Đã có (audio upload)
```

### 9. Notes
- Component sử dụng pattern và styling giống với codebase hiện tại
- Tương thích với Tailwind CSS classes đã defined
- Sử dụng Font Awesome icons
- Responsive design cho mobile/tablet
- State management với React hooks
- Form validation
- Error handling
- Progress tracking

### 10. Next Steps
1. Test route trên browser
2. Test tất cả tính năng theo checklist
3. Fix bugs nếu có
4. Integrate với backend APIs
5. Thêm unit tests
6. Thêm documentation

---

**Route URL**: `/#/admin/create-listening`  
**Created**: 2025-08-10  
**Status**: ✅ Ready for testing
