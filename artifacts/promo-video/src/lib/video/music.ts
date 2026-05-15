// Procedural upbeat background music via Web Audio API
// No external files, no AI credits

export function startBackgroundMusic(): () => void {
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return () => {};

  const ctx = new AudioContextClass();
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.5);
  masterGain.connect(ctx.destination);

  const BPM = 118;
  const beat = 60 / BPM;
  const bar = beat * 4;

  // Pentatonic scale (A minor pentatonic) frequencies
  const scale = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.26, 784];

  // Melody pattern (indices into scale)
  const melodyPattern = [4, 6, 5, 4, 2, 4, 6, 7, 6, 5, 4, 2, 4, 5, 4, 2];
  const melodyDurations = [0.5, 0.5, 0.25, 0.25, 0.5, 0.25, 0.25, 0.5, 0.5, 0.25, 0.25, 0.5, 0.5, 0.25, 0.25, 0.5];

  // Chord pads (warm pads)
  const chords = [
    [220, 261.63, 329.63], // Am
    [196, 246.94, 293.66], // G
    [174.61, 220, 261.63], // F
    [196, 246.94, 293.66], // G
  ];

  const scheduledNodes: AudioNode[] = [];

  function createOscillator(freq: number, type: OscillatorType, startTime: number, duration: number, gainVal: number, attack = 0.02, release = 0.1) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(gainVal, startTime + attack);
    g.gain.setValueAtTime(gainVal, startTime + duration - release);
    g.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
    scheduledNodes.push(osc, g);
  }

  function createNoise(startTime: number, duration: number, gainVal: number, hipass = 8000) {
    const bufLen = Math.ceil(ctx.sampleRate * (duration + 0.05));
    const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(hipass, startTime);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gainVal, startTime);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    src.connect(filter);
    filter.connect(g);
    g.connect(masterGain);
    src.start(startTime);
    scheduledNodes.push(src, filter, g);
  }

  const totalBars = 11; // ~40 seconds at 118 BPM
  const startTime = ctx.currentTime + 0.1;

  for (let b = 0; b < totalBars * 4; b++) {
    const t = startTime + b * beat;

    // Kick drum on beats 1 and 3
    if (b % 2 === 0) {
      const kick = ctx.createOscillator();
      const kickG = ctx.createGain();
      kick.type = 'sine';
      kick.frequency.setValueAtTime(150, t);
      kick.frequency.exponentialRampToValueAtTime(40, t + 0.25);
      kickG.gain.setValueAtTime(0.5, t);
      kickG.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      kick.connect(kickG);
      kickG.connect(masterGain);
      kick.start(t);
      kick.stop(t + 0.35);
      scheduledNodes.push(kick, kickG);
    }

    // Snare on beats 2 and 4
    if (b % 2 === 1) {
      createNoise(t, 0.15, 0.12, 2000);
      createOscillator(180, 'triangle', t, 0.12, 0.06);
    }

    // Hi-hat on every 8th note
    createNoise(t, 0.04, 0.04, 10000);
    createNoise(t + beat / 2, 0.03, 0.03, 12000);
  }

  // Melody
  let melodyTime = startTime + bar; // starts after 1 bar intro
  for (let rep = 0; rep < 3; rep++) {
    let pos = 0;
    for (let i = 0; i < melodyPattern.length; i++) {
      const freq = scale[melodyPattern[i]];
      const dur = melodyDurations[i] * beat * 1.8;
      createOscillator(freq, 'triangle', melodyTime + pos, dur, 0.09, 0.01, 0.08);
      // Add octave shimmer
      createOscillator(freq * 2, 'sine', melodyTime + pos, dur * 0.5, 0.03, 0.01, 0.05);
      pos += melodyDurations[i] * beat;
    }
    melodyTime += bar * 2;
  }

  // Chord pads (every bar)
  for (let i = 0; i < totalBars; i++) {
    const chord = chords[i % chords.length];
    const t = startTime + i * bar;
    chord.forEach(freq => {
      createOscillator(freq, 'sine', t, bar * 0.95, 0.04, 0.1, 0.3);
      createOscillator(freq * 2, 'sine', t, bar * 0.9, 0.015, 0.15, 0.4);
    });
  }

  // Bass line
  const bassNotes = [110, 98, 87.31, 98];
  for (let i = 0; i < totalBars; i++) {
    const t = startTime + i * bar;
    const freq = bassNotes[i % bassNotes.length];
    createOscillator(freq, 'sawtooth', t, beat * 0.8, 0.12, 0.02, 0.1);
    createOscillator(freq, 'sawtooth', t + beat * 2, beat * 0.8, 0.10, 0.02, 0.1);
  }

  // Fade out at end
  masterGain.gain.setValueAtTime(0.18, startTime + totalBars * bar - 3);
  masterGain.gain.linearRampToValueAtTime(0, startTime + totalBars * bar);

  return () => {
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    setTimeout(() => ctx.close(), 600);
  };
}
