import { useCallback } from "react";

const useCrossfadeAudio = (audioRef, fadeDuration = 1) => {
  const crossfadeTo = useCallback(
    (targetTime) => {
      const audio = audioRef.current;
      if (!audio) return;

      const originalVolume = audio.volume;
      const isPlaying = !audio.paused;
      const fadeSteps = 10; // Steps per second
      const totalSteps = fadeDuration * fadeSteps;
      const stepInterval = 100; // ms

      let stepsCompleted = 0;

      const fadeInterval = setInterval(() => {
        stepsCompleted++;

        // Fade out first half
        if (stepsCompleted <= totalSteps / 2) {
          audio.volume = Math.max(
            0,
            originalVolume -
              originalVolume * (stepsCompleted / (totalSteps / 2))
          );
        }
        // Fade in second half after jumping
        else {
          if (stepsCompleted === Math.floor(totalSteps / 2) + 1) {
            audio.currentTime = targetTime;
            if (isPlaying) {
              audio.play().catch((e) => console.error("Play error:", e));
            }
          }
          audio.volume = Math.min(
            originalVolume,
            originalVolume *
              ((stepsCompleted - totalSteps / 2) / (totalSteps / 2))
          );
        }

        if (stepsCompleted >= totalSteps) {
          clearInterval(fadeInterval);
          audio.volume = originalVolume; // Ensure perfect final volume
        }
      }, stepInterval);

      return () => clearInterval(fadeInterval);
    },
    [audioRef, fadeDuration]
  );

  return { crossfadeTo };
};

export default useCrossfadeAudio;
