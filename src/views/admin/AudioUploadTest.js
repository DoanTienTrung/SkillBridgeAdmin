import React, { useState, useRef } from 'react';
import audioService, { AudioUploadError } from '../../services/audioService';

export default function AudioUploadTest() {
  // State management
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState(null);
  const [audioDuration, setAudioDuration] = useState('');
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return;

    console.log('🎵 Selected file:', file.name);
    
    // Reset previous states
    setError('');
    setUploadResult(null);
    setUploadProgress(0);
    setAudioDuration('');

    // Validate file
    const validationResult = audioService.validateAudioFile(file);
    setValidation(validationResult);

    if (validationResult.isValid) {
      setSelectedFile(file);
      
      // Get audio duration (optional)
      audioService.getAudioDuration(file)
        .then(duration => {
          setAudioDuration(duration);
          console.log('🎧 Audio duration:', duration);
        })
        .catch(err => {
          console.warn('Could not get audio duration:', err.message);
          setAudioDuration('Unknown');
        });
    } else {
      setError(validationResult.error);
      setSelectedFile(null);
    }
  };

  // Handle file input change
  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    handleFileSelect(file);
  };

  // Handle drag and drop
  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      console.log('🚀 Starting upload for:', selectedFile.name);
      
      const result = await audioService.uploadAudio(selectedFile, (progress) => {
        setUploadProgress(progress);
        console.log(`📊 Upload progress: ${progress}%`);
      });

      setUploadResult(result);
      console.log('✅ Upload successful:', result);

    } catch (error) {
      console.error('❌ Upload failed:', error);
      
      if (error instanceof AudioUploadError) {
        setError(`${error.message} (Code: ${error.code})`);
      } else {
        setError(error.message || 'Upload failed');
      }
    } finally {
      setUploading(false);
    }
  };

  // Handle upload with retry
  const handleUploadWithRetry = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      console.log('🔄 Starting upload with retry for:', selectedFile.name);
      
      const result = await audioService.uploadWithRetry(selectedFile, (progress) => {
        setUploadProgress(progress);
      }, 3);

      setUploadResult(result);
      console.log('✅ Upload with retry successful:', result);

    } catch (error) {
      console.error('❌ Upload with retry failed:', error);
      setError(error.message || 'Upload failed after retries');
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!uploadResult?.savedFileName) return;

    try {
      console.log('🗑️ Deleting file:', uploadResult.savedFileName);
      
      await audioService.deleteAudio(uploadResult.savedFileName);
      
      // Reset states
      setUploadResult(null);
      setSelectedFile(null);
      setValidation(null);
      setAudioDuration('');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      console.log('✅ File deleted successfully');

    } catch (error) {
      console.error('❌ Delete failed:', error);
      setError(error.message || 'Delete failed');
    }
  };

  // Handle reset
  const handleReset = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploading(false);
    setUploadResult(null);
    setError('');
    setValidation(null);
    setAudioDuration('');
    setDragOver(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Render validation status
  const renderValidationStatus = () => {
    if (!validation) return null;

    return (
      <div className={`p-4 rounded-lg mb-4 ${
        validation.isValid ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'
      }`}>
        <div className="flex items-center">
          <i className={`fas ${validation.isValid ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-2`}></i>
          <span className="font-medium">
            {validation.isValid ? 'File hợp lệ' : 'File không hợp lệ'}
          </span>
        </div>
        {validation.error && (
          <p className="mt-2 text-sm">{validation.error}</p>
        )}
        {validation.fileInfo && (
          <div className="mt-2 text-sm">
            <p><strong>Tên:</strong> {validation.fileInfo.name}</p>
            <p><strong>Kích thước:</strong> {validation.fileInfo.formattedSize || audioService.formatFileSize(validation.fileInfo.size)}</p>
            <p><strong>Định dạng:</strong> {validation.fileInfo.extension?.toUpperCase()}</p>
            <p><strong>MIME type:</strong> {validation.fileInfo.type}</p>
            {audioDuration && <p><strong>Thời lượng:</strong> {audioDuration}</p>}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full lg:w-8/12 px-4">
          {/* Main Upload Card */}
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white border-0">
            <div className="rounded-t bg-lightBlue-600 mb-0 px-6 py-6">
              <div className="text-center">
                <h6 className="text-white text-xl font-bold">
                  🎵 Test Upload File Âm Thanh
                </h6>
                <p className="text-lightBlue-100 text-sm mt-2">
                  Test chức năng upload MP3, WAV, M4A, AAC, OGG (Max 50MB)
                </p>
              </div>
            </div>
            
            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
              
              {/* Drag and Drop Area */}
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver 
                    ? 'border-lightBlue-500 bg-lightBlue-50' 
                    : 'border-blueGray-300 bg-blueGray-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-6xl text-blueGray-400 mb-4">
                  <i className="fas fa-cloud-upload-alt"></i>
                </div>
                <h3 className="text-xl font-semibold text-blueGray-700 mb-2">
                  Kéo thả file vào đây
                </h3>
                <p className="text-blueGray-500 mb-4">
                  hoặc click để chọn file
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,.aac,.ogg,audio/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={uploading}
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-lightBlue-500 text-white px-6 py-3 rounded-lg hover:bg-lightBlue-600 transition-colors disabled:opacity-50"
                >
                  <i className="fas fa-folder-open mr-2"></i>
                  Chọn file audio
                </button>
                
                <p className="text-xs text-blueGray-400 mt-4">
                  Hỗ trợ: MP3, WAV, M4A, AAC, OGG • Tối đa 50MB
                </p>
              </div>

              {/* Validation Status */}
              {renderValidationStatus()}

              {/* Upload Controls */}
              {selectedFile && validation?.isValid && (
                <div className="bg-blueGray-50 p-6 rounded-lg mb-4">
                  <h4 className="text-lg font-semibold text-blueGray-700 mb-4">
                    Điều khiển Upload
                  </h4>
                  
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      <i className="fas fa-upload mr-2"></i>
                      {uploading ? 'Đang upload...' : 'Upload thường'}
                    </button>
                    
                    <button
                      onClick={handleUploadWithRetry}
                      disabled={uploading}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      <i className="fas fa-redo mr-2"></i>
                      {uploading ? 'Đang upload...' : 'Upload với retry'}
                    </button>
                    
                    <button
                      onClick={handleReset}
                      disabled={uploading}
                      className="bg-blueGray-500 text-white px-4 py-2 rounded hover:bg-blueGray-600 transition-colors disabled:opacity-50"
                    >
                      <i className="fas fa-times mr-2"></i>
                      Reset
                    </button>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {uploading && (
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-blueGray-600">Tiến trình upload</span>
                    <span className="text-sm text-blueGray-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blueGray-200 rounded-full h-3">
                    <div 
                      className="bg-lightBlue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    <span className="font-medium">Lỗi:</span>
                  </div>
                  <p className="mt-2">{error}</p>
                </div>
              )}

              {/* Upload Result */}
              {uploadResult && (
                <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-2">
                        <i className="fas fa-check-circle mr-2"></i>
                        <span className="font-medium">Upload thành công!</span>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <p><strong>File gốc:</strong> {uploadResult.originalFileName}</p>
                        <p><strong>Kích thước:</strong> {uploadResult.formattedFileSize}</p>
                        <p><strong>Định dạng:</strong> {uploadResult.fileFormat?.toUpperCase()}</p>
                        <p><strong>URL:</strong> <code className="bg-green-200 px-1 rounded">{uploadResult.audioUrl}</code></p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleDelete}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      <i className="fas fa-trash mr-1"></i>
                      Xóa
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="w-full lg:w-4/12 px-4">
          {/* Audio Player */}
          {uploadResult?.audioUrl && (
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg">
              <div className="px-6 py-6">
                <h3 className="text-lg font-semibold text-blueGray-700 mb-4">
                  <i className="fas fa-play-circle mr-2"></i>
                  Audio Player
                </h3>
                
                <audio 
                  ref={audioPlayerRef}
                  controls 
                  className="w-full"
                  src={`http://localhost:8080${uploadResult.audioUrl}`}
                >
                  Trình duyệt không hỗ trợ audio player.
                </audio>
                
                <div className="mt-4 text-xs text-blueGray-500">
                  <p>URL: {uploadResult.audioUrl}</p>
                  {audioDuration && <p>Thời lượng: {audioDuration}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Test Info */}
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg">
            <div className="px-6 py-6">
              <h3 className="text-lg font-semibold text-blueGray-700 mb-4">
                <i className="fas fa-info-circle mr-2"></i>
                Thông tin Test
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-blueGray-600">Định dạng hỗ trợ:</p>
                  <p className="text-blueGray-500">MP3, WAV, M4A, AAC, OGG</p>
                </div>
                
                <div>
                  <p className="font-medium text-blueGray-600">Kích thước tối đa:</p>
                  <p className="text-blueGray-500">50 MB</p>
                </div>
                
                <div>
                  <p className="font-medium text-blueGray-600">Features test:</p>
                  <ul className="text-blueGray-500 list-disc list-inside mt-1">
                    <li>File validation</li>
                    <li>Progress tracking</li>
                    <li>Audio duration detection</li>
                    <li>Drag & drop upload</li>
                    <li>Retry mechanism</li>
                    <li>File deletion</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-medium text-blueGray-600">Endpoints test:</p>
                  <ul className="text-blueGray-500 text-xs mt-1">
                    <li>POST /audio/upload</li>
                    <li>DELETE /audio/:filename</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Console Logs */}
          <div className="relative flex flex-col min-w-0 break-words bg-blueGray-800 w-full mb-6 shadow-xl rounded-lg">
            <div className="px-6 py-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                <i className="fas fa-terminal mr-2"></i>
                Console Logs
              </h3>
              
              <div className="text-xs text-green-400 font-mono">
                <p>Open browser DevTools → Console để xem logs chi tiết</p>
                <p className="mt-2 text-blueGray-300">
                  Tất cả actions sẽ log ra console với icons:
                </p>
                <div className="mt-2 space-y-1 text-blueGray-400">
                  <p>🎵 File selection</p>
                  <p>🚀 Upload start</p>
                  <p>📊 Progress updates</p>
                  <p>✅ Success operations</p>
                  <p>❌ Error handling</p>
                  <p>🗑️ File deletion</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}