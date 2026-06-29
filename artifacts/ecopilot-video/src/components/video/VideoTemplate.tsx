import { useVideoPlayer } from '@/lib/video/hooks';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

import Scene1 from './video_scenes/Scene1';
import Scene2 from './video_scenes/Scene2';
import Scene3 from './video_scenes/Scene3';
import Scene4 from './video_scenes/Scene4';
import Scene5 from './video_scenes/Scene5';
import Scene6 from './video_scenes/Scene6';
import Scene7 from './video_scenes/Scene7';
import { PersistentBackground } from './PersistentBackground';

const SCENE_DURATIONS = {
  scene1: 6000,
  scene2: 12000,
  scene3: 20000,
  scene4: 17000,
  scene5: 20000,
  scene6: 10000,
  scene7: 5000,
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({
    durations: SCENE_DURATIONS,
  });

  const narrationRef = useRef<HTMLAudioElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (currentScene === 0) {
      if (narrationRef.current) {
        narrationRef.current.currentTime = 0;
        narrationRef.current.play().catch(() => {});
      }
      if (musicRef.current) {
        musicRef.current.currentTime = 0;
        musicRef.current.volume = 0.2;
        musicRef.current.play().catch(() => {});
      }
    }
  }, [currentScene]);

  return (
    <div className="w-full h-screen overflow-hidden relative text-white font-body" style={{ backgroundColor: 'var(--color-bg-dark)' }}>
      <audio ref={narrationRef} src={`${import.meta.env.BASE_URL}assets/ecopilot_narration.mp3`} />
      <audio ref={musicRef} src={`${import.meta.env.BASE_URL}assets/ecopilot_bg_music.mp3`} loop />

      <PersistentBackground currentScene={currentScene} />

      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="scene1" />}
        {currentScene === 1 && <Scene2 key="scene2" />}
        {currentScene === 2 && <Scene3 key="scene3" />}
        {currentScene === 3 && <Scene4 key="scene4" />}
        {currentScene === 4 && <Scene5 key="scene5" />}
        {currentScene === 5 && <Scene6 key="scene6" />}
        {currentScene === 6 && <Scene7 key="scene7" />}
      </AnimatePresence>
    </div>
  );
}
