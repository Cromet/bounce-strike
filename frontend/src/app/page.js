'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Only run p5 initialization on the client side
    if (typeof window !== 'undefined') {
      // Wait for p5 to be loaded
      const checkP5Ready = setInterval(() => {
        if (window.p5) {
          clearInterval(checkP5Ready);
          // Initialize p5 with our sketch
          new window.p5((p) => {
            // Move all p5 functions to use p. prefix
            p.setup = () => {
              p.createCanvas(p.windowWidth, p.windowHeight);
            };

            p.draw = () => {
              // Initial background to show p5 is working
              p.background(20);
            };

            p.windowResized = () => {
              p.resizeCanvas(p.windowWidth, p.windowHeight);
            };
          });
        }
      }, 100);
    }
  }, []);

  return (
    <main>
      <div id="p5-container"></div>
    </main>
  );
}