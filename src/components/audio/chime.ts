/**
 * Luxury Acoustic Chime Synthesizer using Web Audio API
 * Generates an elegant, warm dual-tone chime (F#5 -> C#6 harmonic bell)
 * with zero external audio assets required.
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  return soundEnabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function playCallChime() {
  if (!soundEnabled || typeof window === "undefined") return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === "suspended") {
      audioCtx = new AudioContextClass();
    }

    const now = audioCtx.currentTime;

    // Tone 1: 740 Hz (F#5)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(740, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 1.2);

    // Tone 2: 1108 Hz (C#6) ringing in with a slight delay
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1108, now + 0.14);
    gain2.gain.setValueAtTime(0, now + 0.14);
    gain2.gain.linearRampToValueAtTime(0.22, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.14);
    osc2.stop(now + 1.6);
  } catch (err) {
    // AudioContext autoplay restrictions are handled gracefully
    console.debug("[AudioChime] Audio autoplay restricted or unavailable", err);
  }
}
