import React from 'react';
import { Link } from 'react-router-dom';



export default function LessonTypeSelector() {
  const lessonTypes = [
    {
      type: 'listening',
      title: 'Bài Nghe',
      description: 'Tạo bài học luyện nghe với audio và câu hỏi',
      icon: 'fas fa-headphones',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      borderColor: 'border-blue-200',
      route: '/teacher/create-listening',
      features: [
        'Upload file audio (MP3, WAV)',
        'Transcript đầy đủ', 
        'Câu hỏi trắc nghiệm',
        'Từ vựng quan trọng',
        'Đa cấp độ (A2 - C1)'
      ]
    },
    {
      type: 'reading',
      title: 'Bài Đọc',
      description: 'Tạo bài học luyện đọc với văn bản và câu hỏi',
      icon: 'fas fa-file-text',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      borderColor: 'border-green-200',
      route: '/teacher/create-reading',
      features: [
        'Soạn thảo với rich text editor',
        'Upload file văn bản (.txt)',
        'Câu hỏi đa dạng',
        'Tính word count tự động',
        'Preview trước khi publish'
      ]
    }
  ];

  return (
    <div className="flex flex-wrap mt-4">
      <div className="w-full mb-12 px-4">
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
          
          {/* Header */}
          <div className="rounded-t mb-0 px-6 py-4 border-0">
            <div className="flex flex-wrap items-center">
              <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                <h3 className="font-semibold text-xl text-blueGray-700">
                  <i className="fas fa-plus-circle mr-3 text-lightBlue-500"></i>
                  Tạo bài học mới
                </h3>
                <p className="mt-1 text-sm text-blueGray-600">
                  Chọn loại bài học bạn muốn tạo
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            
            

            {/* Lesson Type Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {lessonTypes.map((lesson) => (
                <div 
                  key={lesson.type}
                  className={`relative bg-white border-2 ${lesson.borderColor} rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 group`}
                >
                  {/* Header */}
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${lesson.color} rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}>
                      <i className={`${lesson.icon} text-white text-xl`}></i>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-blueGray-700 group-hover:text-blueGray-900">
                        {lesson.title}
                      </h4>
                      <p className="text-sm text-blueGray-600">
                        {lesson.description}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h5 className="text-sm font-semibold text-blueGray-700 mb-3">
                      Tính năng chính:
                    </h5>
                    <ul className="space-y-2">
                      {lesson.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-blueGray-600">
                          <i className="fas fa-check text-green-500 mr-2 text-xs"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={lesson.route}
                    className={`w-full ${lesson.color} ${lesson.hoverColor}  text-black font-medium py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center group-hover:shadow-md`}
                  >
                    <i className="fas fa-arrow-right mr-2"></i>
                    Tạo {lesson.title}
                  </Link>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent group-hover:from-blue-50 group-hover:to-green-50 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              ))}
            </div>

            {/* Help Section */}
            <div className="mt-8 bg-lightBlue-50 border border-lightBlue-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-lightBlue-500 rounded-lg flex items-center justify-center mr-4 mt-0.5">
                  <i className="fas fa-question text-white text-sm"></i>
                </div>
                <div>
                  <h5 className="font-semibold text-blueGray-700 mb-2">
                    Cần hỗ trợ?
                  </h5>
                  <p className="text-sm text-blueGray-600 mb-3">
                    Không chắc chọn loại bài học nào? Đây là một số gợi ý:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-blue-700 mb-1">Chọn Bài Nghe khi:</div>
                      <ul className="text-blueGray-600 space-y-1">
                        <li>• Có sẵn file audio chất lượng tốt</li>
                        <li>• Muốn luyện kỹ năng nghe hiểu</li>
                        <li>• Phù hợp với accent/pronunciation</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium text-green-700 mb-1">Chọn Bài Đọc khi:</div>
                      <ul className="text-blueGray-600 space-y-1">
                        <li>• Có văn bản phong phú, đa dạng</li>
                        <li>• Muốn luyện đọc hiểu và từ vựng</li>
                        <li>• Dễ tạo nội dung và linh hoạt</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/teacher/lessons"
                className="bg-blueGray-500 hover:bg-blueGray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-300"
              >
                <i className="fas fa-list mr-2"></i>
                Xem bài học đã tạo
              </Link>
              <Link
                to="/teacher/dashboard"
                className="bg-white border border-blueGray-300 hover:border-blueGray-400 text-blueGray-700 px-4 py-2 rounded-lg text-sm transition-colors duration-300"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Quay lại dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}