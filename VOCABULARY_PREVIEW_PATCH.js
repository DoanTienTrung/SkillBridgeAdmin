// Fix cho CreateListeningLesson.js
// Thêm các parts này vào file hiện tại

// 1. THÊM IMPORTS VÀO ĐẦU FILE (sau các imports hiện tại)
import LessonPreview from '../../components/LessonPreview';

// 2. THÊM STATES (sau các states hiện tại)
const [previewModal, setPreviewModal] = useState(false);
const [previewData, setPreviewData] = useState(null);
const [currentLessonId, setCurrentLessonId] = useState(null);

// 3. THÊM VOCABULARY HANDLING FUNCTIONS (sau loadCategories useEffect)
const handleTextSelect = (selection) => {
  setVocabularyModal({
    isOpen: true,
    selectedText: selection.text,
    textPosition: { start: selection.start, end: selection.end }
  });
};

const handleSaveVocabulary = async (vocabularyData) => {
  if (!currentLessonId) {
    alert('Vui lòng lưu bài học trước khi thêm từ vựng');
    return;
  }

  try {
    const response = await vocabularyService.addVocabularyToLesson(currentLessonId, vocabularyData);
    setVocabularies(prev => [...prev, response.data]);
    console.log('✅ Vocabulary added successfully - VOCABULARY_PREVIEW_PATCH.js:30');
  } catch (error) {
    console.error('❌ Failed to add vocabulary: - VOCABULARY_PREVIEW_PATCH.js:32', error);
    throw error;
  }
};

const handleDeleteVocabulary = async (vocabularyId) => {
  if (!confirm('Bạn có chắc chắn muốn xóa từ vựng này?')) return;

  try {
    await vocabularyService.removeVocabularyFromLesson(currentLessonId, vocabularyId);
    setVocabularies(prev => prev.filter(v => v.id !== vocabularyId));
    console.log('✅ Vocabulary deleted successfully - VOCABULARY_PREVIEW_PATCH.js:43');
  } catch (error) {
    console.error('❌ Failed to delete vocabulary: - VOCABULARY_PREVIEW_PATCH.js:45', error);
    alert('Lỗi khi xóa từ vựng: ' + error.message);
  }
};

// 4. THÊM PREVIEW HANDLING FUNCTIONS
const handlePreview = async () => {
  if (!currentLessonId) {
    alert('Vui lòng lưu bài học trước khi xem preview');
    return;
  }

  try {
    setPreviewModal(true);
    const response = await lessonService.getPreviewData(currentLessonId);
    setPreviewData(response.data);
  } catch (error) {
    console.error('❌ Failed to load preview: - VOCABULARY_PREVIEW_PATCH.js:62', error);
    alert('Lỗi khi tải preview: ' + error.message);
    setPreviewModal(false);
  }
};

const handlePublish = async () => {
  if (!confirm('Bạn có chắc chắn muốn xuất bản bài học này?')) return;

  try {
    await lessonService.publishLesson(currentLessonId);
    alert('✅ Bài học đã được xuất bản thành công!');
    setPreviewModal(false);
    
    // Refresh preview data
    const response = await lessonService.getPreviewData(currentLessonId);
    setPreviewData(response.data);
  } catch (error) {
    console.error('❌ Failed to publish lesson: - VOCABULARY_PREVIEW_PATCH.js:80', error);
    alert('Lỗi khi xuất bản bài học: ' + error.message);
  }
};

// 5. CẬP NHẬT handleSaveLesson (thay thế phần success trong try block)
// Thay thế phần:
// alert(`✅ Bài học "${lessonData.title}" đã được tạo thành công!\n\nID: ${response.data?.id}\nStatus: ${response.data?.status}`);
// resetForm();

// Bằng:
setCurrentLessonId(response.data.id);
alert(`✅ Bài học "${lessonData.title}" đã được tạo thành công!\n\nID: ${response.data?.id}\nStatus: ${response.data?.status}`);

// Load vocabularies if this lesson already has some
if (response.data.id) {
  try {
    const vocabResponse = await vocabularyService.getLessonVocabularies(response.data.id);
    setVocabularies(vocabResponse.data || []);
  } catch (error) {
    console.log('No vocabularies found for this lesson - VOCABULARY_PREVIEW_PATCH.js:100');
  }
}

// 6. THÊM TAB VOCABULARY VÀO RENDER (trong phần tabs navigation và content)
// Tìm dòng có 'vocabulary' tab và đảm bảo nó active

// 7. THÊM VOCABULARY TAB CONTENT (thay thế tab vocabulary hiện tại)
{activeTab === 'vocabulary' && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-blueGray-700">
        📚 Quản lý từ vựng ({vocabularies.length} từ)
      </h3>
      <div className="text-sm text-blueGray-500">
        {currentLessonId ? 'Select text trong transcript để thêm từ vựng' : 'Vui lòng lưu bài học trước'}
      </div>
    </div>

    {!currentLessonId && (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          ⚠️ Vui lòng lưu bài học trong tab "Thông tin cơ bản" trước khi thêm từ vựng
        </p>
      </div>
    )}

    {/* Transcript với highlight */}
    <div className="bg-blueGray-50 p-6 rounded-lg">
      <h4 className="text-md font-semibold text-blueGray-700 mb-4">
        Transcript (Click để chọn từ vựng)
      </h4>
      <div className="bg-white p-4 rounded border min-h-48 max-h-96 overflow-y-auto">
        {lessonData.transcript ? (
          <TextHighlighter
            text={lessonData.transcript}
            vocabularies={vocabularies}
            onTextSelect={currentLessonId ? handleTextSelect : null}
            readOnly={!currentLessonId}
          />
        ) : (
          <p className="text-gray-500 italic">
            Vui lòng nhập transcript trong tab "Transcript" trước khi thêm từ vựng
          </p>
        )}
      </div>
    </div>

    {/* Vocabulary List */}
    {vocabularies.length > 0 && (
      <div className="bg-white border rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-md font-semibold text-gray-700">
            Danh sách từ vựng đã thêm
          </h4>
        </div>
        <div className="divide-y divide-gray-200">
          {vocabularies.map((vocab) => (
            <div key={vocab.id} className="px-6 py-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="inline-block w-4 h-4 rounded"
                    style={{ backgroundColor: vocab.highlightColor }}
                  ></span>
                  <span className="font-semibold text-gray-800">
                    {vocab.word}
                  </span>
                  {vocab.phonetic && (
                    <span className="text-sm text-gray-500">
                      {vocab.phonetic}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  {vocab.meaning}
                </p>
                {vocab.selectedText && (
                  <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    "{vocab.selectedText}"
                  </p>
                )}
                {vocab.exampleSentence && (
                  <p className="text-xs text-gray-500 italic mt-2">
                    Ví dụ: {vocab.exampleSentence}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDeleteVocabulary(vocab.id)}
                className="text-red-500 hover:text-red-700 p-2"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}

// 8. CẬP NHẬT PREVIEW BUTTON (trong Action Buttons section)
<button
  onClick={handlePreview}
  disabled={!currentLessonId}
  className="bg-lightBlue-500 text-white px-6 py-3 rounded-lg hover:bg-lightBlue-600 transition-colors font-medium disabled:opacity-50"
>
  <i className="fas fa-eye mr-2"></i>
  {!currentLessonId ? 'Lưu bài học để preview' : 'Xem trước'}
</button>

// 9. THÊM MODALS VÀO CUỐI COMPONENT (trước closing tag)
{/* Vocabulary Modal */}
<VocabularyModal
  isOpen={vocabularyModal.isOpen}
  onClose={() => setVocabularyModal({ isOpen: false, selectedText: '', textPosition: null })}
  selectedText={vocabularyModal.selectedText}
  textPosition={vocabularyModal.textPosition}
  onSave={handleSaveVocabulary}
/>

{/* Preview Modal */}
{previewModal && (
  <div className="inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
      <LessonPreview
        previewData={previewData}
        onClose={() => setPreviewModal(false)}
        onPublish={handlePublish}
        onBackToEdit={() => setPreviewModal(false)}
      />
    </div>
  </div>
)}
