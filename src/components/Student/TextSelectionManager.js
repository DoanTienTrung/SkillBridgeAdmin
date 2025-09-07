// File: src/components/Student/TextSelectionManager.js
import React, { useState, useEffect, useRef } from 'react';
import VocabularySaveButton from './VocabularySaveButton';

const TextSelectionManager = ({ 
  children, 
  lessonTitle = '',
  lessonType = '', // 'reading' | 'listening'
  onWordSaved
}) => {
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [context, setContext] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      if (selectedText && selection.rangeCount > 0) {
        // Check if selection is within our container
        const range = selection.getRangeAt(0);
        const isWithinContainer = containerRef.current && 
          containerRef.current.contains(range.commonAncestorContainer);
        
        if (isWithinContainer) {
          handleTextSelection(selectedText, selection);
        }
      } else {
        hideSelectionUI();
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleTextSelection = (text, selection) => {
    // Extract single word if multiple words selected
    const words = text.split(/\s+/).filter(word => word.length > 1);
    const targetWord = words.length === 1 ? words[0] : words[0]; // Take first word for now
    
    // Clean the word (remove punctuation)
    const cleanWord = targetWord.replace(/[^\w']/g, '');
    
    if (cleanWord.length < 2) {
      hideSelectionUI();
      return;
    }

    // Get context sentence
    const range = selection.getRangeAt(0);
    const contextRange = document.createRange();
    const container = range.commonAncestorContainer;
    
    // Try to get the full sentence containing the selected word
    let fullText = '';
    if (container.nodeType === Node.TEXT_NODE) {
      fullText = container.textContent;
    } else {
      fullText = container.textContent || range.toString();
    }
    
    // Extract sentence containing the word
    const sentences = fullText.split(/[.!?]+/);
    const contextSentence = sentences.find(sentence => 
      sentence.toLowerCase().includes(cleanWord.toLowerCase())
    ) || text;

    // Get position for popup
    const rect = range.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top - 10 // Show above selection
    };

    setSelectedText(cleanWord);
    setContext(contextSentence.trim());
    setSelectionPosition(position);
    setShowSaveButton(true);
  };

  const hideSelectionUI = () => {
    setShowSaveButton(false);
    setSelectedText('');
    setContext('');
  };

  const handleClickOutside = (event) => {
    if (showSaveButton && !event.target.closest('.vocabulary-save-popup')) {
      hideSelectionUI();
    }
  };

  const handleWordSaved = (data) => {
    hideSelectionUI();
    
    // Clear selection
    window.getSelection().removeAllRanges();
    
    if (onWordSaved) {
      onWordSaved({
        ...data,
        context: context,
        lessonTitle: lessonTitle,
        lessonType: lessonType
      });
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Render children content */}
      <div className="select-text">
        {children}
      </div>

      {/* Selection popup */}
      {showSaveButton && selectedText && (
        <div 
          className="vocabulary-save-popup fixed z-50 transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${selectionPosition.x}px`,
            top: `${selectionPosition.y}px`
          }}
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-max">
            {/* Word info */}
            <div className="text-center mb-3">
              <div className="font-semibold text-gray-900">{selectedText}</div>
              {context && (
                <div className="text-xs text-gray-500 italic mt-1 max-w-xs">
                  "{context.substring(0, 50)}{context.length > 50 ? '...' : ''}"
                </div>
              )}
            </div>
            
            {/* Save button */}
            <div className="flex justify-center">
              <VocabularySaveButton
                word={selectedText}
                context={context}
                lessonTitle={lessonTitle}
                onSaved={handleWordSaved}
                size="small"
                variant="primary"
              />
            </div>

            {/* Arrow pointing down */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 relative -top-1"></div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions overlay (can be toggled) */}
      <div className="absolute top-2 right-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm opacity-75 hover:opacity-100 transition-opacity">
        <i className="fas fa-info-circle mr-1"></i>
        Chọn từ để lưu vào từ vựng
      </div>
    </div>
  );
};

export default TextSelectionManager;