import { useState, useCallback, useRef } from 'react';
import { Download, Video, Loader2, CheckCircle, AlertCircle, X, Smartphone } from 'lucide-react';
import { exportVideo, downloadBlob } from '@/lib/recorder/videoExporter';
import type { ExportStatus } from '@/lib/recorder/videoExporter';

type ConvertStatus =
  | { phase: 'idle' }
  | { phase: 'uploading'; progress: number }
  | { phase: 'converting' }
  | { phase: 'done' }
  | { phase: 'error'; message: string };

export default function RecordButton() {
  const [status, setStatus] = useState<ExportStatus>({ phase: 'idle' });
  const [convertStatus, setConvertStatus] = useState<ConvertStatus>({ phase: 'idle' });
  const [showInfo, setShowInfo] = useState(false);
  const webmBlobRef = useRef<Blob | null>(null);
  const webmUrlRef = useRef<string | null>(null);

  const handleExport = useCallback(async () => {
    if (status.phase === 'recording' || status.phase === 'encoding') return;

    if (webmUrlRef.current) {
      URL.revokeObjectURL(webmUrlRef.current);
      webmUrlRef.current = null;
    }
    webmBlobRef.current = null;
    setConvertStatus({ phase: 'idle' });

    try {
      await exportVideo((s) => {
        setStatus(s);
        if (s.phase === 'done') {
          webmUrlRef.current = s.url;
          fetch(s.url)
            .then(r => r.blob())
            .then(blob => { webmBlobRef.current = blob; });
          downloadBlob(s.url, s.filename);
        }
      });
    } catch (err) {
      setStatus({ phase: 'error', message: String(err) });
    }
  }, [status.phase]);

  const handleConvertMP4 = useCallback(async () => {
    const blob = webmBlobRef.current;
    if (!blob || convertStatus.phase === 'uploading' || convertStatus.phase === 'converting') return;

    setConvertStatus({ phase: 'uploading', progress: 0 });

    try {
      const arrayBuffer = await blob.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/convert-video', true);
      xhr.setRequestHeader('Content-Type', 'video/webm');
      xhr.responseType = 'blob';

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setConvertStatus({ phase: 'uploading', progress: e.loaded / e.total });
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const mp4Blob = xhr.response as Blob;
          const mp4Url = URL.createObjectURL(mp4Blob);
          const a = document.createElement('a');
          a.href = mp4Url;
          a.download = 'يمن-شات-ترويجي.mp4';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(mp4Url), 5000);
          setConvertStatus({ phase: 'done' });
        } else {
          setConvertStatus({ phase: 'error', message: 'فشل التحويل — تأكد من الاتصال' });
        }
      };

      xhr.onerror = () => {
        setConvertStatus({ phase: 'error', message: 'خطأ في الاتصال بالخادم' });
      };

      setConvertStatus({ phase: 'converting' });
      xhr.send(uint8);
    } catch (err) {
      setConvertStatus({ phase: 'error', message: String(err) });
    }
  }, [convertStatus.phase]);

  const handleReset = useCallback(() => {
    setStatus({ phase: 'idle' });
    setConvertStatus({ phase: 'idle' });
    setShowInfo(false);
    webmBlobRef.current = null;
    if (webmUrlRef.current) {
      URL.revokeObjectURL(webmUrlRef.current);
      webmUrlRef.current = null;
    }
  }, []);

  const isRecording = status.phase === 'recording';
  const isEncoding = status.phase === 'encoding';
  const isDone = status.phase === 'done';
  const isError = status.phase === 'error';
  const isBusy = isRecording || isEncoding;
  const isConverting = convertStatus.phase === 'uploading' || convertStatus.phase === 'converting';

  return (
    <div className="relative flex flex-col items-center gap-2" dir="rtl">
      {/* Main record button */}
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
      >
        {isEncoding ? (
          <><Loader2 className="w-4 h-4 animate-spin" />جارٍ الترميز...</>
        ) : isRecording ? (
          <><Loader2 className="w-4 h-4 animate-spin" />
            {'progress' in status ? `تسجيل ${Math.round(status.progress * 40)}ث / 40ث` : 'تسجيل...'}</>
        ) : isDone ? (
          <><CheckCircle className="w-4 h-4" />تم تحميل WebM ✓ — أعد التسجيل</>
        ) : isError ? (
          <><AlertCircle className="w-4 h-4" />خطأ — أعد المحاولة</>
        ) : (
          <><Download className="w-4 h-4" />تسجيل وتحميل الفيديو</>
        )}
      </button>

      {/* Progress bar for recording */}
      {isRecording && 'progress' in status && (
        <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-orange-400 transition-all duration-200"
            style={{ width: `${status.progress * 100}%` }}
          />
        </div>
      )}

      {/* MP4 conversion button (shown after WebM download) */}
      {isDone && (
        <div className="flex flex-col items-center gap-1.5 mt-1">
          <button
            onClick={handleConvertMP4}
            disabled={isConverting || convertStatus.phase === 'done'}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all
              shadow-md active:scale-95 select-none
              ${convertStatus.phase === 'done'
                ? 'bg-green-600 text-white cursor-default'
                : isConverting
                  ? 'bg-blue-700 text-white/70 cursor-wait'
                  : convertStatus.phase === 'error'
                    ? 'bg-red-600 text-white hover:bg-red-500'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
              }
            `}
            style={{ fontFamily: 'Cairo, sans-serif' }}
          >
            <Smartphone className="w-3.5 h-3.5" />
            {convertStatus.phase === 'done'
              ? 'تم تحميل MP4 للجوال ✓'
              : convertStatus.phase === 'error'
                ? (convertStatus.message ?? 'خطأ في التحويل')
                : isConverting
                  ? convertStatus.phase === 'uploading'
                    ? `رفع ${Math.round(('progress' in convertStatus ? convertStatus.progress : 0) * 100)}%...`
                    : 'تحويل إلى MP4...'
                  : 'تحويل إلى MP4 للجوال (iPhone)'}
          </button>

          {isConverting && (
            <div className="w-40 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${convertStatus.phase === 'converting' ? 'bg-blue-400 animate-pulse w-full' : 'bg-blue-400'}`}
                style={{
                  width: convertStatus.phase === 'uploading' && 'progress' in convertStatus
                    ? `${convertStatus.progress * 100}%`
                    : '100%'
                }}
              />
            </div>
          )}

          <p className="text-xs text-white/40 text-center" style={{ fontFamily: 'Cairo, sans-serif' }}>
            {convertStatus.phase === 'idle' && 'WebM للأندرويد/ويندوز · MP4 لـ iPhone'}
            {convertStatus.phase === 'done' && 'MP4 يعمل على كل الأجهزة والتطبيقات'}
          </p>
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
          className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-80 bg-slate-800 border border-white/10 rounded-xl p-4 shadow-2xl z-50 text-right"
          style={{ fontFamily: 'Cairo, sans-serif' }}
        >
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => setShowInfo(false)} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <Video className="w-4 h-4 text-orange-400" />كيف يعمل التحميل؟
            </span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
            <li>📽️ تسجيل 40 ثانية كاملة عبر Canvas API (بدون كاميرا)</li>
            <li>🎵 موسيقى برمجية بـ Web Audio API</li>
            <li>💾 تحميل تلقائي بصيغة WebM (أندرويد/ويندوز/ماك)</li>
            <li>📱 زر "تحويل MP4" يحوّل الفيديو على الخادم بـ FFmpeg</li>
            <li>✅ MP4 يعمل على iPhone وكل تطبيقات المشاركة</li>
            <li>💡 مجاني 100% — لا API خارجي، لا تكلفة</li>
          </ul>
          <div className="mt-2 pt-2 border-t border-white/10 text-xs text-slate-400 text-center">
            ⏱️ التحويل إلى MP4 يستغرق ~30 ثانية
          </div>
        </div>
      )}
    </div>
  );
}
