import { useState, useCallback, useRef } from 'react';
import { Download, Video, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { exportVideo, downloadBlob } from '@/lib/recorder/videoExporter';
import type { ExportStatus } from '@/lib/recorder/videoExporter';

export default function RecordButton() {
  const [status, setStatus] = useState<ExportStatus>({ phase: 'idle' });
  const [showInfo, setShowInfo] = useState(false);
  const urlRef = useRef<string | null>(null);

  const handleExport = useCallback(async () => {
    if (status.phase === 'recording' || status.phase === 'encoding') return;

    // Revoke previous URL
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }

    try {
      await exportVideo((s) => {
        setStatus(s);
        if (s.phase === 'done') {
          urlRef.current = s.url;
          downloadBlob(s.url, s.filename);
        }
      });
    } catch (err) {
      setStatus({ phase: 'error', message: String(err) });
    }
  }, [status.phase]);

  const handleReset = useCallback(() => {
    setStatus({ phase: 'idle' });
    setShowInfo(false);
  }, []);

  const isRecording = status.phase === 'recording';
  const isEncoding = status.phase === 'encoding';
  const isDone = status.phase === 'done';
  const isError = status.phase === 'error';
  const isBusy = isRecording || isEncoding;

  return (
    <div className="relative flex flex-col items-center gap-2">
      {/* Main button */}
      <button
        onClick={isDone || isError ? handleReset : handleExport}
        disabled={isBusy}
        className={`
          flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all
          shadow-lg active:scale-95 select-none
          ${isBusy
            ? 'opacity-70 cursor-not-allowed bg-slate-700 text-white/70'
            : isDone
              ? 'bg-green-500 text-white hover:bg-green-600'
              : isError
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-orange-500 text-white hover:bg-orange-600'
          }
        `}
        style={{ fontFamily: 'Cairo, sans-serif' }}
        title={isBusy ? `جارٍ التسجيل... ${isRecording && status.phase === 'recording' ? Math.round(('progress' in status ? status.progress : 0) * 40) + 'ث' : ''}` : ''}
      >
        {isEncoding ? (
          <><Loader2 className="w-4 h-4 animate-spin" />جارٍ الترميز...</>
        ) : isRecording ? (
          <><Loader2 className="w-4 h-4 animate-spin" />
            {'progress' in status ? `تسجيل ${Math.round(status.progress * 40)}ث / 40ث` : 'تسجيل...'}</>
        ) : isDone ? (
          <><CheckCircle className="w-4 h-4" />تم التحميل ✓</>
        ) : isError ? (
          <><AlertCircle className="w-4 h-4" />خطأ — أعد المحاولة</>
        ) : (
          <><Download className="w-4 h-4" />تحميل الفيديو MP4</>
        )}
      </button>

      {/* Progress bar */}
      {isRecording && 'progress' in status && (
        <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-orange-400 transition-all duration-200"
            style={{ width: `${status.progress * 100}%` }}
          />
        </div>
      )}

      {/* Info toggle */}
      {!isBusy && status.phase === 'idle' && (
        <button
          onClick={() => setShowInfo(v => !v)}
          className="text-xs text-white/40 hover:text-white/70 transition-colors"
          style={{ fontFamily: 'Cairo, sans-serif' }}
        >
          كيف يعمل؟
        </button>
      )}

      {/* Info card */}
      {showInfo && (
        <div
          className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-72 bg-slate-800 border border-white/10 rounded-xl p-4 shadow-2xl z-50 text-right"
          style={{ fontFamily: 'Cairo, sans-serif' }}
          dir="rtl"
        >
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => setShowInfo(false)} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <Video className="w-4 h-4 text-orange-400" />كيف يعمل نظام التحميل؟
            </span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
            <li>📽️ يُولِّد الفيديو باستخدام Canvas API (رسم برمجي)</li>
            <li>🎵 يُضيف موسيقى حماسية مُولَّدة بـ Web Audio API</li>
            <li>⏱️ يستغرق التسجيل 40 ثانية كاملة (مدة الفيديو)</li>
            <li>💾 يُحمِّل تلقائياً بصيغة WebM (مدعومة على معظم الأجهزة)</li>
            <li>💡 مجاني 100% — لا API خارجي، لا تكلفة</li>
          </ul>
          <div className="mt-2 pt-2 border-t border-white/10 text-xs text-slate-400">
            ⚠️ للتحويل إلى MP4 بعد التنزيل يمكن استخدام VLC أو HandBrake (مجاناً)
          </div>
        </div>
      )}
    </div>
  );
}
