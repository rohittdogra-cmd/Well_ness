// Web Audio API Ambient Soundscape & Meditation Chime Engine
// 100% self-contained, zero external network assets, offline-ready

export type SoundscapeType = "rain" | "ocean" | "breeze" | "zen";

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentSource: AudioNode | null = null;
  private lfo: OscillatorNode | null = null;
  private activeSound: SoundscapeType | null = null;
  private currentVolume = 0.6;
  private intervalTimer: NodeJS.Timeout | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(
        this.currentVolume,
        this.ctx.currentTime,
      );
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  private createNoiseBuffer(type: "white" | "pink" | "brown"): AudioBuffer {
    this.initContext();
    const sampleRate = this.ctx!.sampleRate;
    const duration = 5; // 5 seconds looped
    const bufferSize = sampleRate * duration;
    const buffer = this.ctx!.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    let brown = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      if (type === "white") {
        data[i] = white * 0.2;
      } else if (type === "pink") {
        // Paul Kellet's filtered pink noise algorithm
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
        b6 = white * 0.115926;
      } else {
        // Brown noise
        brown = (brown + 0.02 * white) / 1.02;
        data[i] = brown * 0.85;
      }
    }
    return buffer;
  }

  public playSound(type: SoundscapeType) {
    this.stopSound();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.activeSound = type;

    if (type === "rain") {
      // Gentle rainfall: Pink noise passed through bandpass & high-shelf
      const noiseBuffer = this.createNoiseBuffer("pink");
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

      const highPass = this.ctx.createBiquadFilter();
      highPass.type = "highpass";
      highPass.frequency.setValueAtTime(250, this.ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(highPass);
      highPass.connect(this.masterGain);

      noiseSource.start();
      this.currentSource = noiseSource;
    } else if (type === "ocean") {
      // Ocean waves: Brown noise with LFO modulating gain periodically
      const noiseBuffer = this.createNoiseBuffer("brown");
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      const waveGain = this.ctx.createGain();
      waveGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

      // LFO for wave swelling every ~9 seconds
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.11, this.ctx.currentTime); // ~9 second wave cycle

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(waveGain.gain);

      noiseSource.connect(filter);
      filter.connect(waveGain);
      waveGain.connect(this.masterGain);

      lfo.start();
      noiseSource.start();

      this.lfo = lfo;
      this.currentSource = noiseSource;
    } else if (type === "breeze") {
      // Forest Breeze: Warm brown noise + sweeping bandpass
      const noiseBuffer = this.createNoiseBuffer("brown");
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // slow wind sway

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noiseSource.connect(filter);
      filter.connect(this.masterGain);

      lfo.start();
      noiseSource.start();

      this.lfo = lfo;
      this.currentSource = noiseSource;
    } else if (type === "zen") {
      // Zen Singing Bowl drone & periodic chime
      this.playChime(true);
      this.intervalTimer = setInterval(() => {
        this.playChime(false);
      }, 7000);
    }
  }

  public playChime(deep = false) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const fundamental = deep ? 216 : 432; // Sacred A4 (432Hz) or warm fundamental
    const harmonics = [fundamental, fundamental * 2.01, fundamental * 2.76];
    const weights = [0.45, 0.25, 0.12];

    const now = this.ctx.currentTime;
    const chimeGain = this.ctx.createGain();
    chimeGain.gain.setValueAtTime(0.001, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.4, now + 0.06);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

    harmonics.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      const partialGain = this.ctx!.createGain();
      partialGain.gain.setValueAtTime(weights[idx], now);

      osc.connect(partialGain);
      partialGain.connect(chimeGain);

      osc.start(now);
      osc.stop(now + 6);
    });

    chimeGain.connect(this.masterGain);
  }

  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.currentVolume,
        this.ctx.currentTime,
        0.05,
      );
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public stopSound() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    if (this.lfo) {
      try {
        this.lfo.stop();
        this.lfo.disconnect();
      } catch {
        // ignore
      }
      this.lfo = null;
    }
    if (this.currentSource) {
      try {
        (this.currentSource as AudioScheduledSourceNode).stop?.();
        this.currentSource.disconnect();
      } catch {
        // ignore
      }
      this.currentSource = null;
    }
    this.activeSound = null;
  }

  public playPopSound(pitchMultiplier = 1) {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      const baseFreq = (520 + Math.random() * 140) * pitchMultiplier;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.07);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Audio playback can be silent if blocked
    }
  }

  public playCelebrationChime() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.001, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 1.2);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 1.3);
      });
    } catch {
      // ignore
    }
  }

  public getActiveSound(): SoundscapeType | null {
    return this.activeSound;
  }
}

export const ambientAudio = new AmbientAudioEngine();
