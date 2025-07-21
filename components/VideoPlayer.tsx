"use client";
import { useRef, useState, useEffect } from "react";



const VideoPlayer = ({ beforeVideo, afterVideo }: { beforeVideo: string; afterVideo: string }) => {
  // SSR/CSR mismatch fix: only render on client
  const [mounted, setMounted] = useState(false);
  // error: false | 'main' | 'final'
  const [error, setError] = useState<false | 'main' | 'final'>(false);
  const [currentVideo, setCurrentVideo] = useState<'before' | 'after'>('before');
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const switchVideo = (type: 'before' | 'after') => {
    setCurrentVideo(type);
    setIsPlaying(false);
    setError(false); // Reset error when switching
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Fallback test video (public/videos/david_m_before.mp4)
  const fallbackVideo = "/videos/david_m_before.mp4"; // Use an existing video to avoid 404 errors


  return (
    <div className="relative w-full h-[30rem] bg-gray-100 rounded-lg overflow-hidden">
      {error ? (
        // Try fallback video if main video fails
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          controls
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onError={(e) => {
            console.error('[VideoPlayer] Fallback video failed to load:', fallbackVideo, e);
            setError('final');
          }}
          onLoadedData={(e) => {
            console.log('[VideoPlayer] Fallback video loaded successfully:', fallbackVideo, e);
          }}
        >
          <source src={fallbackVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <video
          key={currentVideo}
          ref={videoRef}
          className="w-full h-full object-cover"
          controls
          autoPlay={isPlaying}
          onClick={toggleVideo}
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          poster={undefined}
          aria-label={currentVideo + " testimonial video"}
          onError={(e) => {
            const src = currentVideo === 'before' ? beforeVideo : afterVideo;
            console.error('[VideoPlayer] Main video failed to load:', src, e);
            setError('main');
          }}
          onLoadedData={(e) => {
            const src = currentVideo === 'before' ? beforeVideo : afterVideo;
            console.log('[VideoPlayer] Video loaded successfully:', src, e);
          }}
        >
          <source src={currentVideo === 'before' ? beforeVideo : afterVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      {error === 'final' && (
        <div className="flex flex-col items-center justify-center w-full h-full bg-gray-200 text-red-600 p-6 rounded-lg">
          <svg className="w-10 h-10 mb-2 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
          <span className="font-semibold">All video sources failed to load.</span>
          <span className="text-xs mt-1">Failed video src: {currentVideo === 'before' ? beforeVideo : afterVideo} (fallback also failed)</span>
          <span className="text-xs mt-1">Please check your video files in /public/videos or try a different browser.</span>
        </div>
      )}
      {/* Video Controls Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
        <button
          onClick={toggleVideo}
          className="bg-white bg-opacity-80 rounded-full p-3 hover:bg-opacity-100 transition-all"
          aria-label={isPlaying ? "Pause video" : "Play video"}
          type="button"
        >
          {isPlaying ? (
            <div className="w-4 h-4 bg-gray-800"></div>
          ) : (
            <svg className="w-4 h-4 text-gray-800 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18l15-9-15-9z" /></svg>
          )}
        </button>
      </div>
      {/* Video Type Selector */}
      <div className="absolute bottom-2 left-2 flex gap-1">
        <button
          onClick={() => switchVideo('before')}
          className={`px-2 py-2 text-xs rounded ${currentVideo === 'before' ? 'bg-teal-600 text-white' : 'bg-white bg-opacity-80 text-gray-800'}`}
        >
          Before
        </button>
        <button
          onClick={() => switchVideo('after')}
          className={`px-2 py-2 text-xs rounded ${currentVideo === 'after' ? 'bg-teal-600 text-white' : 'bg-white bg-opacity-80 text-gray-800'}`}
        >
          After
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
