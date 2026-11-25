import { useCallback, useRef, useState } from 'react';
import { Experience } from './components/Experience';
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
      {/* The page scrolls through this tall spacer; the fixed canvas sits above */}
      <div ref={spacer} style={{ height: '900vh' }} aria-hidden="true" />
      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
          <div className="max-w-md rounded-2xl border border-white/15 bg-[#090d1f] p-6">
            <h2 className="text-lg font-semibold">Navigation Guide</h2>
            <p className="mt-2 text-sm text-white/70">
              Scroll smoothly to travel through each chapter of the 3D experience.
            </p>
            <button
              onClick={closeGuide}
              className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
