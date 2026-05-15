// Client-side video exporter: Canvas + Web Audio → MediaRecorder → WebM download
// Zero external dependencies, zero cost

import { renderFrame, TOTAL_DURATION } from './canvasRenderer';

const W = 1280;
const H = 720;
const FPS = 30;

export type ExportStatus =
  | { phase: 'idle' }
  | { phase: 'recording'; progress: number }
  | { phase: 'encoding' }
  | { phase: 'done'; url: string; filename: string }
  | { phase: 'error'; message: string };

export type OnProgress = (status: ExportStatus) => void;

// ─── Procedural music for recording ───
function buildMusicStream(audioCtx: AudioContext): MediaStream {
  const dest = audioCtx.createMediaStreamDestination();
  const master = audioCtx.createGain();
  master.gain.setValueAtTime(0, audioCtx.currentTime);
  master.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 1.5);
  master.connect(dest);

  const BPM = 118;
  const beat = 60 / BPM;
  const bar = beat * 4;

  const scale = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.26, 784];
  const melody = [4, 6, 5, 4, 2, 4, 6, 7, 6, 5, 4, 2, 4, 5, 4, 2];
  const melDur = [0.5, 0.5, 0.25, 0.25, 0.5, 0.25, 0.25, 0.5, 0.5, 0.25, 0.25, 0.5, 0.5, 0.25, 0.25, 0.5];
  const chords = [
    [220, 261.63, 329.63],
    [196, 246.94, 293.66],
    [174.61, 220, 261.63],
    [196, 246.94, 293.66],
  ];
  const bass = [110, 98, 87.31, 98];

  function osc(freq: number, type: OscillatorType, t: number, dur: number, g: number, atk = 0.02, rel = 0.08) {
    const o = audioCtx.createOscillator();
    const gn = audioCtx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    gn.gain.setValueAtTime(0, t);
    gn.gain.linearRampToValueAtTime(g, t + atk);
    gn.gain.setValueAtTime(g, t + dur - rel);
    gn.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(gn);
    gn.connect(master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function noise(t: number, dur: number, g: number, hp = 8000) {
    const len = Math.ceil(audioCtx.sampleRate * (dur + 0.05));
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const filt = audioCtx.createBiquadFilter();
    filt.type = 'highpass';
    filt.frequency.setValueAtTime(hp, t);
    const gn = audioCtx.createGain();
    gn.gain.setValueAtTime(g, t);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filt);
    filt.connect(gn);
    gn.connect(master);
    src.start(t);
  }

  const bars = 11;
  const now = audioCtx.currentTime + 0.05;

  for (let b = 0; b < bars * 4; b++) {
    const t = now + b * beat;
    if (b % 2 === 0) {
      const k = audioCtx.createOscillator();
      const kg = audioCtx.createGain();
      k.type = 'sine';
      k.frequency.setValueAtTime(150, t);
      k.frequency.exponentialRampToValueAtTime(40, t + 0.25);
      kg.gain.setValueAtTime(0.5, t);
      kg.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      k.connect(kg);
      kg.connect(master);
      k.start(t);
      k.stop(t + 0.35);
    }
    if (b % 2 === 1) {
      noise(t, 0.14, 0.1, 2000);
      osc(180, 'triangle', t, 0.12, 0.05);
    }
    noise(t, 0.04, 0.03, 10000);
    noise(t + beat / 2, 0.03, 0.025, 12000);
  }

  let melTime = now + bar;
  for (let rep = 0; rep < 3; rep++) {
    let pos = 0;
    for (let i = 0; i < melody.length; i++) {
      const freq = scale[melody[i]];
      const dur = melDur[i] * beat * 1.8;
      osc(freq, 'triangle', melTime + pos, dur, 0.08, 0.01, 0.07);
      osc(freq * 2, 'sine', melTime + pos, dur * 0.5, 0.025, 0.01, 0.05);
      pos += melDur[i] * beat;
    }
    melTime += bar * 2;
  }

  for (let i = 0; i < bars; i++) {
    const t = now + i * bar;
    chords[i % chords.length].forEach(freq => {
      osc(freq, 'sine', t, bar * 0.95, 0.035, 0.1, 0.3);
      osc(freq * 2, 'sine', t, bar * 0.9, 0.012, 0.15, 0.4);
    });
    const bf = bass[i % bass.length];
    osc(bf, 'sawtooth', t, beat * 0.8, 0.1, 0.02, 0.08);
    osc(bf, 'sawtooth', t + beat * 2, beat * 0.8, 0.09, 0.02, 0.08);
  }

  master.gain.setValueAtTime(0.2, now + bars * bar - 3.5);
  master.gain.linearRampToValueAtTime(0, now + bars * bar);

  return dest.stream;
}

// ─── Main export function ───
export async function exportVideo(onProgress: OnProgress): Promise<void> {
  onProgress({ phase: 'recording', progress: 0 });

  // Canvas
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    onProgress({ phase: 'error', message: 'Canvas 2D not available' });
    return;
  }

  // Audio
  const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioCtxClass();
  const audioStream = buildMusicStream(audioCtx);

  // Video stream from canvas
  const videoStream = canvas.captureStream(FPS);

  // Combine video + audio
  const combined = new MediaStream([
    ...videoStream.getVideoTracks(),
    ...audioStream.getAudioTracks(),
  ]);

  // Pick best supported codec
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  const mimeType = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) ?? 'video/webm';

  const recorder = new MediaRecorder(combined, {
    mimeType,
    videoBitsPerSecond: 4_000_000,
    audioBitsPerSecond: 128_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  const filename = 'يمن-شات-ترويجي.webm';
  let resolveExport!: () => void;
  const done = new Promise<void>(res => { resolveExport = res; });

  recorder.onstop = () => {
    onProgress({ phase: 'encoding' });
    const blob = new Blob(chunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    onProgress({ phase: 'done', url, filename });
    resolveExport();
    audioCtx.close();
  };

  recorder.start(200); // collect data every 200ms

  // Drive canvas animation in real time
  const startTime = performance.now();
  let animFrame: number;

  const animate = () => {
    const elapsed = (performance.now() - startTime) / 1000;
    const progress = Math.min(1, elapsed / TOTAL_DURATION);

    if (elapsed >= TOTAL_DURATION + 0.5) {
      recorder.stop();
      return;
    }

    renderFrame(ctx, Math.min(elapsed, TOTAL_DURATION - 0.01), W, H);
    onProgress({ phase: 'recording', progress });

    animFrame = requestAnimationFrame(animate);
  };

  animFrame = requestAnimationFrame(animate);

  await done;
  cancelAnimationFrame(animFrame);
}

export function downloadBlob(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
