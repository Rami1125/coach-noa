/**
 * Web Audio API Subtle Chime Generator
 * ח. סבן חומרי בניין (1994) בע״מ - נועה AI
 * 
 * Generates an elegant, crystal dual-harmonic chime (A5 880Hz + E6 1320Hz)
 * with a smooth exponential decay envelope (0.6s).
 * 100% self-contained: requires no external audio assets or network requests.
 * Ideal for hands-free dispatch notifications on Samsung Galaxy Note / S22 Ultra and Desktop.
 */

// Singleton AudioContext
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }

    // Resume if suspended by browser autoplay policy
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {
        // Handled on next user gesture
      });
    }

    return audioCtx;
  } catch (err) {
    console.warn("[WebAudio] AudioContext unavailable:", err);
    return null;
  }
}

/**
 * Unlocks the Web Audio context on the first user interaction (touch/click/key).
 * Call this in your top-level event listeners for mobile Safari and Android Chrome.
 */
export function unlockAudioContext(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

export interface ChimeOptions {
  volume?: number;       // 0.0 to 1.0 (default: 0.28 - subtle & pleasant)
  duration?: number;     // seconds (default: 0.6s)
  freq1?: number;        // Hz (default: 880Hz - A5)
  freq2?: number;        // Hz (default: 1320Hz - E6 harmonic fifth)
}

/**
 * Plays the signature SabanOS subtle dual-harmonic bell chime.
 * Non-blocking, completely smooth, non-abrasive tone.
 */
export function playSubtleChime(options: ChimeOptions = {}): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // If context is still suspended, try resuming
    if (ctx.state === "suspended") {
      ctx.resume().then(() => executeChime(ctx, options)).catch(() => {});
      return;
    }

    executeChime(ctx, options);
  } catch (err) {
    console.warn("[WebAudio] Failed to synthesize notification chime:", err);
  }
}

function executeChime(ctx: AudioContext, options: ChimeOptions): void {
  const {
    volume = 0.28,
    duration = 0.6,
    freq1 = 880,  // A5
    freq2 = 1320, // E6
  } = options;

  const now = ctx.currentTime;

  // Master Gain for smooth envelope
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.001, now);
  // Quick 15ms rise to avoid audible click
  masterGain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
  // Natural bell exponential decay down to near-silent over duration
  masterGain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

  masterGain.connect(ctx.destination);

  // Harmonic 1: Fundamental A5 (880 Hz)
  const osc1 = ctx.createOscillator();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(freq1, now);

  // Harmonic 2: Perfect Fifth E6 (1320 Hz) - slightly softer for crystalline sheen
  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(freq2, now);

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.65, now);
  osc2.connect(gain2);
  gain2.connect(masterGain);

  osc1.connect(masterGain);

  // Start both oscillators synchronously
  osc1.start(now);
  osc2.start(now);

  // Stop and clean up nodes
  const stopTime = now + duration + 0.05;
  osc1.stop(stopTime);
  osc2.stop(stopTime);

  setTimeout(() => {
    try {
      osc1.disconnect();
      osc2.disconnect();
      gain2.disconnect();
      masterGain.disconnect();
    } catch (_e) {
      // Cleanup completed
    }
  }, (duration + 0.1) * 1000);
}
