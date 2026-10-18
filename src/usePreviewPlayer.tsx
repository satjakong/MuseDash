import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react';
import { usePlayerStore } from './store';

export function PreviewPlayer() {
  const { currentTrack, isPlaying, togglePlay, pauseTrack, clearTrack, playNext, playPrevious } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Autoplay prevented", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  if (!currentTrack) return null;

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bottom-player">
      <audio 
        ref={audioRef} 
        src={currentTrack.previewUrl || currentTrack.preview} 
        onEnded={pauseTrack} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
      
      <div className="player-info">
        <img src={currentTrack.artworkUrl100?.replace('100x100', '300x300') || currentTrack.artwork} alt="cover" />
        <div className="player-text">
          <h4>{currentTrack.trackName || currentTrack.title}</h4>
          <p>{currentTrack.artistName || currentTrack.artist}</p>
        </div>
      </div>

      <div className="player-center">
        <div className="player-controls">
          <button className="control-btn" onClick={playPrevious}><SkipBack fill="white" size={20} /></button>
          
          <button className="play-pause-btn" onClick={togglePlay}>
            {isPlaying ? <Pause fill="white" size={24} /> : <Play fill="white" size={24} />}
          </button>
          
          <button className="control-btn" onClick={playNext}><SkipForward fill="white" size={20} /></button>
        </div>
        
        <div className="player-progress-container">
          <span className="time-text">{formatTime(currentTime)}</span>
          <input 
            type="range" 
            min="0" 
            max={duration || 30} 
            value={currentTime} 
            onChange={handleSeek}
            className="progress-bar"
          />
          <span className="time-text">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-right">
        <button className="close-player-btn" onClick={clearTrack} title="ปิดเครื่องเล่น">
          <X size={24} color="#aaaaaa" />
        </button>
      </div>
    </div>
  );
}