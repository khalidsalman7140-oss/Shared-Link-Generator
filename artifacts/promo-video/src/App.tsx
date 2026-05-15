import { useEffect, useRef } from 'react';
import VideoWithControls from '@/components/video/VideoWithControls';
import { startBackgroundMusic } from '@/lib/video/music';

export default function App() {
  const stopMusicRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Start music on first user interaction (browser autoplay policy)
    const startOnInteraction = () => {
      if (!stopMusicRef.current) {
        stopMusicRef.current = startBackgroundMusic();
      }
      document.removeEventListener('click', startOnInteraction);
      document.removeEventListener('keydown', startOnInteraction);
    };

    // Try autoplay immediately, fallback to interaction
    try {
      stopMusicRef.current = startBackgroundMusic();
    } catch {
      document.addEventListener('click', startOnInteraction);
      document.addEventListener('keydown', startOnInteraction);
    }

    return () => {
      stopMusicRef.current?.();
      document.removeEventListener('click', startOnInteraction);
      document.removeEventListener('keydown', startOnInteraction);
    };
  }, []);

  return <VideoWithControls />;
}
