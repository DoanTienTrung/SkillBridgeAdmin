import React, { useState, useRef, useEffect } from 'react';

export default function AudioPlayer({ audioUrl, transcript, onWordClick, className = '' }) {
  // Audio state
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize audio
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      const audio = audioRef.current;
      
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        setLoading(false);
      };
      
      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      
      const handleError = () => {
        setError('Không thể tải file audio');
        setLoading(false);
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      };
    }
  }, [audioUrl]);

  // Audio control functions
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const clickX = e.nativeEvent.offsetX;
      const progressWidth = e.currentTarget.offsetWidth;
      const newTime = (clickX / progressWidth) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleSpeedChange = (e) => {
    const newRate = parseFloat(e.target.value);
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  // Format time display
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get progress percentage
  const getProgress = () => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Đang tải audio...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <div className="text-center text-red-500">
          <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Audio Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Audio Player</h3>
        
        {/* Main Controls */}
        <div className="flex items-center space-x-4 mb-4">
          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} ${!isPlaying ? 'ml-1' : ''}`}></i>
          </button>

          {/* Rewind Button */}
          <button
            onClick={handleRewind}
            className="w-10 h-10 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center transition-colors"
          >
            <i className="fas fa-undo"></i>
            <span className="text-xs ml-1">10s</span>
          </button>

          {/* Time Display */}
          <div className="text-sm text-gray-600 min-w-max">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Speed Control */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Speed:</span>
            <select
              value={playbackRate}
              onChange={handleSpeedChange}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
            </select>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <i className="fas fa-volume-up text-gray-600"></i>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div 
            className="w-full h-3 bg-gray-200 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="h-3 bg-blue-600 rounded-full transition-all duration-200"
              style={{ width: `${getProgress()}%` }}
            ></div>
          </div>
          {/* Progress indicator */}
          <div 
            className="absolute top-0 w-3 h-3 bg-blue-800 rounded-full transform -translate-x-1/2 -translate-y-0"
            style={{ left: `${getProgress()}%` }}
          ></div>
        </div>
      </div>

      {/* Transcript */}
      {transcript && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Transcript</h3>
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {transcript.split(' ').map((word, index) => (
                <span
                  key={index}
                  className="hover:bg-yellow-200 cursor-pointer px-1 rounded"
                  onClick={() => onWordClick && onWordClick(word.replace(/[.,!?;]/, ''))}
                >
                  {word}{' '}
                </span>
              ))}
            </div>
          </div>
          
          {onWordClick && (
            <div className="mt-2 text-sm text-gray-600">
              <i className="fas fa-info-circle mr-1"></i>
              Click vào từ bất kỳ để tra nghĩa
            </div>
          )}
        </div>
      )}
    </div>
  );
}
