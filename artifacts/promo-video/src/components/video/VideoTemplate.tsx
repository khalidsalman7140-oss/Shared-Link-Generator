import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

export const SCENE_DURATIONS: Record<string, number> = {
  open: 5000,
  chat: 6500,
  services: 7000,
  pricing: 6000,
  close: 5500,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  open: Scene1,
  chat: Scene2,
  services: Scene3,
  pricing: Scene4,
  close: Scene5,
};

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentScene, currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '') as keyof typeof SCENE_DURATIONS;
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  return (
    <div
      className="w-full h-screen overflow-hidden relative font-body"
      style={{ backgroundColor: 'var(--color-bg-dark)', color: 'var(--color-text-primary)' }}
      dir="rtl"
    >
      {/* Persistent Background Layer */}
      <div className="absolute inset-0 z-0">
        <motion.div className="absolute w-[100vw] h-[100vw] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-primary), transparent)' }}
          animate={{ x: ['-20%', '50%', '10%'], y: ['-20%', '30%', '-10%'], scale: [1, 1.2, 0.9] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute w-[80vw] h-[80vw] rounded-full opacity-20 blur-3xl right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, var(--color-accent), transparent)' }}
          animate={{ x: ['10%', '-40%', '0%'], y: ['10%', '-50%', '10%'] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      {/* Persistent midground accent that transforms between scenes */}
      <motion.div
        className="absolute rounded-full blur-2xl z-0"
        style={{ background: 'var(--color-accent)', width: '30vw', height: '30vw' }}
        animate={{
          x: ['60vw', '5vw', '70vw', '20vw', '50vw'][sceneIndex] ?? '50vw',
          y: ['70vh', '10vh', '60vh', '20vh', '80vh'][sceneIndex] ?? '70vh',
          opacity: [0.08, 0.12, 0.1, 0.15, 0.06][sceneIndex] ?? 0.08,
          scale: [1, 1.3, 0.8, 1.1, 0.9][sceneIndex] ?? 1,
        }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />

      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>
    </div>
  );
}
