import { useCallback } from "react";

const useCrossfadeAudio = (audioRef, fadeDuration = 1) => {
  const crossfadeTo = useCallback(
    (targetTime) => {
      const audio = audioRef.current;
      if (!audio) return;

      const originalVolume = audio.volume;
      const step = originalVolume / (fadeDuration * 10); // 10 steps per sec
      let fadeOutInterval;
      console.log("Crossfading to:", targetTime);

      // Fade Out
      fadeOutInterval = setInterval(() => {
        if (audio.volume > step) {
          audio.volume -= step;
        } else {
          clearInterval(fadeOutInterval);
          audio.pause();
          audio.currentTime = targetTime;

          // Fade In
          audio.play().then(() => {
            let fadeInInterval = setInterval(() => {
              if (audio.volume < originalVolume - step) {
                audio.volume += step;
              } else {
                audio.volume = originalVolume;
                clearInterval(fadeInInterval);
              }
            }, 100);
          });
        }
      }, 100);
    },
    [audioRef, fadeDuration]
  );

  return { crossfadeTo };
};

export default useCrossfadeAudio;