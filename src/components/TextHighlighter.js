import React, { useState, useRef, useEffect } from 'react';

export default function TextHighlighter({
  text,
  vocabularies = [],
  onTextSelect,
  onWordClick,
  readOnly = false,
  fontSize = 16,
  className = ''
}) {
  const [selection, setSelection] = useState(null);
  const textRef = useRef();

  // Handle text selection for highlighting
  const handleMouseUp = () => {
    if (readOnly || !onTextSelect) return;

    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();

    if (selectedText.length === 0) return;

    // Calculate positions relative to the text container
    const textElement = textRef.current;

    const startOffset = getTextOffset(textElement, range.startContainer, range.startOffset);
    const endOffset = getTextOffset(textElement, range.endContainer, range.endOffset);

    if (startOffset !== -1 && endOffset !== -1) {
      onTextSelect({
        text: selectedText,
        start: startOffset,
        end: endOffset
      });
    }

    // Clear selection
    selection.removeAllRanges();
  };

  // Handle word click for dictionary lookup
  const handleWordClick = (e, word) => {
    if (!onWordClick) return;

    e.stopPropagation();
    onWordClick(word.trim());
  };

  const getTextOffset = (container, node, offset) => {
    let textOffset = 0;
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let currentNode;
    while (currentNode = walker.nextNode()) {
      if (currentNode === node) {
        return textOffset + offset;
      }
      textOffset += currentNode.textContent.length;
    }
    return -1;
  };

  const renderHighlightedText = () => {
    if (!vocabularies || vocabularies.length === 0) {
      return text;
    }

    // Sort vocabularies by start position
    const sortedVocabs = [...vocabularies].sort((a, b) => a.startPosition - b.startPosition);

    let result = [];
    let lastIndex = 0;

    sortedVocabs.forEach((vocab, index) => {
      // Add text before highlight
      if (vocab.startPosition > lastIndex) {
        result.push(
          <span key={`text-${index}`}>
            {text.substring(lastIndex, vocab.startPosition)}
          </span>
        );
      }

      // Add highlighted text
      result.push(
        <span
          key={`vocab-${vocab.id}`}
          className="vocabulary-highlight cursor-pointer relative group"
          style={{
            backgroundColor: vocab.highlightColor,
            color: '#000000', // Text đen cho tất cả
            padding: '2px 4px',
            borderRadius: '3px',
            fontWeight: 'bold',
            border: '1px solid rgba(0,0,0,0.2)', // Border nhẹ
            marginLeft: '1px',
            marginRight: '1px'
          }}
          title={`${vocab.word}: ${vocab.meaning}`}
        >
          {text.substring(vocab.startPosition, vocab.endPosition)}


          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
            <div className="bg-gray-800 text-white text-sm rounded-lg p-3 min-w-64 max-w-xs">
              <div className="font-semibold">{vocab.word}</div>
              {vocab.phonetic && (
                <div className="text-gray-300 text-xs">{vocab.phonetic}</div>
              )}
              <div className="mt-1">{vocab.meaning}</div>
              {vocab.exampleSentence && (
                <div className="mt-2 text-gray-300 text-xs italic">
                  "{vocab.exampleSentence}"
                </div>
              )}
            </div>
          </div>
        </span>
      );

      lastIndex = vocab.endPosition;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(
        <span key="text-end">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return result;
  };

  return (
    <div
      ref={textRef}
      className={`whitespace-pre-wrap ${!readOnly ? 'select-text' : ''}`}
      onMouseUp={handleMouseUp}
      style={{ lineHeight: '1.8' }}
    >
      {renderHighlightedText()}
    </div>
  );
}