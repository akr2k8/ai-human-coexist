import { useCallback, useRef, useState } from 'react';
import { CalibratePanel } from './components/CalibratePanel';
import { Experience } from './components/Experience';
import { GuideDrawer } from './components/GuideDrawer';
import { LoadingScreen } from './components/LoadingScreen';
import { Overlay } from './components/Overlay';
import { useScrollDriver } from './lib/useScrollDriver';

export default function App() {
  const spacer = useRef<HTMLDivElement>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const openGuide = useCallback(() => setGuideOpen(true), []);
  const closeGuide = useCallback(() => setGuideOpen(false), []);

  useScrollDriver(spacer);

  return (
    <main className="relative bg-[#02030a] text-white">
      <Experience onOpenGuide={openGuide} />
      {/* The page scrolls through this tall spacer; the fixed canvas sits above it and stays interactive. */}
      <div ref={spacer} style={{ height: '900vh' }} aria-hidden="true" />
      <Overlay />
      <CalibratePanel />
      <GuideDrawer open={guideOpen} onClose={closeGuide} />
      <LoadingScreen />
    </main>
  );
}
