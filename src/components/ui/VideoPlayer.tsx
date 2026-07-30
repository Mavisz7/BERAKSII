import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, PictureInPicture2, Gauge } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onPlay?: () => void;
}

const speeds = [0.5, 1, 1.5, 2];

export function VideoPlayer({ src, poster, onPlay }: VideoPlayerProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onTime = () => {
      setCurrent(v.currentTime);
      setProgress((v.currentTime / (v.duration || 1)) * 100);
    };
    const onDur = () => setDuration(v.duration || 0);
    const onEnd = () => setPlaying(false);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onDur);
    v.addEventListener('ended', onEnd);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onDur);
      v.removeEventListener('ended', onEnd);
    };
  }, []);

  function togglePlay() {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); onPlay?.(); }
    else { v.pause(); setPlaying(false); }
  }

  function toggleMute() {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const v = ref.current;
    if (!v) return;
    const pct = Number(e.target.value);
    v.currentTime = (pct / 100) * v.duration;
    setProgress(pct);
  }

  function fullscreen() {
    const v = ref.current;
    if (!v) return;
    if (document.pictureInPictureElement) document.exitPictureInPicture();
    if (v.requestFullscreen) v.requestFullscreen();
  }

  async function pip() {
    const v = ref.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else if (v.requestPictureInPicture) await v.requestPictureInPicture();
    } catch { /* not supported */ }
  }

  function changeSpeed(s: number) {
    const v = ref.current;
    if (!v) return;
    v.playbackRate = s;
    setSpeed(s);
    setShowSpeed(false);
  }

  function fmt(t: number) {
    if (!isFinite(t)) return '00:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black group">
      <video
        ref={ref}
        src={src}
        poster={poster}
        className="w-full aspect-video bg-black"
        playsInline
        preload="metadata"
        onClick={togglePlay}
      />

      {/* Center play button overlay */}
      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors"
          aria-label="Putar video"
        >
          <span className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
            <Play className="w-9 h-9 text-brand-600 ml-1" fill="currentColor" />
          </span>
        </button>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        {/* Progress */}
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={seek}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/30 accent-brand-500 mb-3"
          aria-label="Posisi video"
        />
        <div className="flex items-center gap-2 sm:gap-3 text-white">
          <button onClick={togglePlay} className="p-1.5 rounded-lg hover:bg-white/20" aria-label={playing ? 'Jeda' : 'Putar'}>
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button onClick={toggleMute} className="p-1.5 rounded-lg hover:bg-white/20" aria-label={muted ? 'Bisukan' : 'Suara'}>
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <span className="text-xs tabular-nums">{fmt(current)} / {fmt(duration)}</span>
          <div className="ml-auto flex items-center gap-1 relative">
            <button onClick={() => setShowSpeed((s) => !s)} className="p-1.5 rounded-lg hover:bg-white/20 flex items-center gap-1" aria-label="Kecepatan putar">
              <Gauge className="w-4 h-4" /> <span className="text-xs">{speed}x</span>
            </button>
            {showSpeed && (
              <div className="absolute bottom-full right-0 mb-2 card p-1 min-w-[100px]">
                {speeds.map((s) => (
                  <button key={s} onClick={() => changeSpeed(s)} className={`block w-full text-left px-3 py-1.5 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 ${s === speed ? 'font-bold text-brand-600' : ''}`}>
                    {s}x
                  </button>
                ))}
              </div>
            )}
            <button onClick={pip} className="p-1.5 rounded-lg hover:bg-white/20" aria-label="Picture in Picture">
              <PictureInPicture2 className="w-4 h-4" />
            </button>
            <button onClick={fullscreen} className="p-1.5 rounded-lg hover:bg-white/20" aria-label="Layar penuh">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
