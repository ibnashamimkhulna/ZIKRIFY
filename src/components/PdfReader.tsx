import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { AppLang } from '../data/i18n';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface PdfReaderProps {
  id: string;
  title: string;
  /** Local blob URL or CORS-friendly direct PDF stream URL */
  pdfUrl?: string;
  /** Google Drive /preview fallback iframe URL */
  fallbackIframeUrl?: string | null;
  /** Default reading direction: RTL for Quran Mushafs */
  defaultRtl?: boolean;
  appLang: AppLang;
  isOfflineCached?: boolean;
  cachingOffline?: boolean;
  onSaveOffline?: () => void;
  onClose: () => void;
}

type ReadMode = 'book' | 'scroll';
type ReaderTheme = 'day' | 'sepia' | 'night';

interface ScrollPageProps {
  doc: any;
  pageNum: number;
  zoom: number;
  containerWidth: number;
  onVisible: (pageNum: number) => void;
}

const ScrollPdfPage: React.FC<ScrollPageProps> = ({
  doc,
  pageNum,
  zoom,
  containerWidth,
  onVisible,
}) => {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderedZoom, setRenderedZoom] = useState<number>(0);
  const [inView, setInView] = useState(pageNum <= 3);
  const [aspect, setAspect] = useState<number>(1.414);

  useEffect(() => {
    const el = holderRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (entry.intersectionRatio >= 0.35) {
              onVisible(pageNum);
            }
          }
        }
      },
      { rootMargin: '420px 0px', threshold: [0.05, 0.35] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onVisible, pageNum]);

  useEffect(() => {
    if (!inView || !doc) return;
    let cancelled = false;
    let renderTask: any = null;

    (async () => {
      try {
        const page = await doc.getPage(pageNum);
        if (cancelled) return;
        const baseViewport = page.getViewport({ scale: 1 });
        setAspect(baseViewport.height / Math.max(1, baseViewport.width));

        const targetWidth = Math.max(260, containerWidth - 20) * zoom;
        const scale = targetWidth / baseViewport.width;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: scale * dpr });

        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(targetWidth)}px`;
        canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

        renderTask = page.render({ canvasContext: ctx, viewport });
        await renderTask.promise;
        if (!cancelled) setRenderedZoom(zoom);
      } catch {
        // Ignore cancelled renders
      }
    })();

    return () => {
      cancelled = true;
      try {
        renderTask?.cancel?.();
      } catch {
        // ignore
      }
    };
  }, [containerWidth, doc, inView, pageNum, zoom]);

  const estWidth = Math.max(260, containerWidth - 20) * zoom;
  const estHeight = Math.round(estWidth * aspect);

  return (
    <div
      ref={holderRef}
      className="reader-scroll-page"
      style={{ minHeight: renderedZoom === zoom ? undefined : estHeight }}
    >
      <canvas ref={canvasRef} />
      <span className="reader-page-badge">{pageNum}</span>
    </div>
  );
};

export const PdfReader: React.FC<PdfReaderProps> = ({
  id,
  title,
  pdfUrl,
  fallbackIframeUrl,
  defaultRtl = true,
  appLang,
  isOfflineCached = false,
  cachingOffline = false,
  onSaveOffline,
  onClose,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const bookCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [readMode, setReadMode] = useState<ReadMode>('book');
  const [rtlFlip, setRtlFlip] = useState<boolean>(defaultRtl);
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>('day');
  const [zoom, setZoom] = useState<number>(1);
  const [barsHidden, setBarsHidden] = useState(false);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNum, setPageNum] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem(`zk_pdf_page_${id}`) || 1);
      return Number.isFinite(saved) && saved >= 1 ? saved : 1;
    } catch {
      return 1;
    }
  });
  const [jumpInput, setJumpInput] = useState<string>(String(pageNum));
  const [loadingPdf, setLoadingPdf] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [useIframeFallback, setUseIframeFallback] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(390);
  const [flipAnim, setFlipAnim] = useState<'next' | 'prev' | null>(null);

  const swipeRef = useRef<{ x: number; y: number } | null>(null);

  // Measure reader body width dynamically
  useEffect(() => {
    const updateWidth = () => {
      if (bodyRef.current) {
        setContainerWidth(bodyRef.current.clientWidth || 390);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Save reading bookmark
  useEffect(() => {
    setJumpInput(String(pageNum));
    try {
      localStorage.setItem(`zk_pdf_page_${id}`, String(pageNum));
    } catch {
      // ignore
    }
  }, [id, pageNum]);

  // Load PDF document via pdfjs-dist
  useEffect(() => {
    let cancelled = false;
    let loadingTask: any = null;

    setLoadingPdf(true);
    setUseIframeFallback(false);
    setLoadProgress(0);
    setPdfDoc(null);

    if (!pdfUrl) {
      setLoadingPdf(false);
      setUseIframeFallback(true);
      return;
    }

    (async () => {
      try {
        loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          withCredentials: false,
        });
        loadingTask.onProgress = (p: { loaded: number; total?: number }) => {
          if (!cancelled && p.total && p.total > 0) {
            setLoadProgress(Math.min(100, Math.round((p.loaded / p.total) * 100)));
          }
        };
        const doc = await loadingTask.promise;
        if (cancelled) {
          doc.destroy?.();
          return;
        }
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setPageNum((prev) => Math.max(1, Math.min(doc.numPages, prev)));
        setLoadingPdf(false);
      } catch {
        if (!cancelled) {
          setLoadingPdf(false);
          setUseIframeFallback(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        loadingTask?.destroy?.();
      } catch {
        // ignore
      }
    };
  }, [pdfUrl]);

  // Render active page in Book Mode
  useEffect(() => {
    if (readMode !== 'book' || !pdfDoc || useIframeFallback) return;
    let cancelled = false;
    let renderTask: any = null;

    (async () => {
      try {
        const safePage = Math.max(1, Math.min(pdfDoc.numPages, pageNum));
        const page = await pdfDoc.getPage(safePage);
        if (cancelled) return;

        const bodyEl = bodyRef.current;
        const availW = Math.max(260, (bodyEl?.clientWidth || containerWidth) - 24);
        const availH = Math.max(320, (bodyEl?.clientHeight || 580) - 24);
        const baseViewport = page.getViewport({ scale: 1 });

        const fitScale =
          zoom === 1
            ? Math.min(availW / baseViewport.width, availH / baseViewport.height)
            : (availW / baseViewport.width) * zoom;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: fitScale * dpr });

        const canvas = bookCanvasRef.current;
        if (!canvas || cancelled) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
        canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

        renderTask = page.render({ canvasContext: ctx, viewport });
        await renderTask.promise;
      } catch {
        // Ignore cancelled renders
      }
    })();

    return () => {
      cancelled = true;
      try {
        renderTask?.cancel?.();
      } catch {
        // ignore
      }
    };
  }, [containerWidth, pageNum, pdfDoc, readMode, useIframeFallback, zoom]);

  const goPage = useCallback(
    (nextPage: number, dir?: 'next' | 'prev') => {
      if (!numPages) return;
      const clamped = Math.max(1, Math.min(numPages, nextPage));
      if (clamped === pageNum) return;
      if (dir) {
        setFlipAnim(dir);
        window.setTimeout(() => setFlipAnim(null), 220);
      }
      setPageNum(clamped);
    },
    [numPages, pageNum]
  );

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (readMode !== 'book') return;
      if (e.key === 'ArrowRight') goPage(rtlFlip ? pageNum - 1 : pageNum + 1, rtlFlip ? 'prev' : 'next');
      if (e.key === 'ArrowLeft') goPage(rtlFlip ? pageNum + 1 : pageNum - 1, rtlFlip ? 'next' : 'prev');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPage, onClose, pageNum, readMode, rtlFlip]);

  const isBn = appLang === 'bn';

  return (
    <div
      ref={rootRef}
      className={`pdf-reader theme-${readerTheme}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Top Toolbar */}
      <header className={`reader-top${barsHidden ? ' hide' : ''}`}>
        <button className="reader-btn" onClick={onClose} aria-label={isBn ? 'বন্ধ করুন' : 'Close'}>
          ← {isBn ? 'ফিরুন' : 'Back'}
        </button>
        <div className="reader-title">
          <b>{title}</b>
          {numPages > 0 && (
            <span>
              {isBn ? `পৃষ্ঠা ${pageNum} / ${numPages}` : `Page ${pageNum} of ${numPages}`}
            </span>
          )}
        </div>
        {onSaveOffline && !isOfflineCached && (
          <button
            className="reader-btn pri"
            disabled={cachingOffline}
            onClick={onSaveOffline}
            title={isBn ? 'অফলাইনে সেভ করুন' : 'Save for offline reading'}
          >
            {cachingOffline ? '…' : isBn ? 'অফলাইন সেভ' : 'Save Offline'}
          </button>
        )}
        <button
          className="reader-btn"
          onClick={() => {
            const el = rootRef.current;
            if (!el) return;
            if (document.fullscreenElement) {
              document.exitFullscreen().catch(() => {});
            } else {
              el.requestFullscreen?.().catch(() => {});
            }
          }}
          title={isBn ? 'ফুলস্ক্রিন' : 'Fullscreen'}
        >
          ⛶
        </button>
      </header>

      {/* Secondary Reading Mode & Comfort Bar */}
      {!useIframeFallback && (
        <div className={`reader-subbar${barsHidden ? ' hide' : ''}`}>
          <div className="reader-seg">
            <button
              className={readMode === 'book' ? 'on' : ''}
              onClick={() => setReadMode('book')}
            >
              📖 {isBn ? 'বই মোড' : 'Book Mode'}
            </button>
            <button
              className={readMode === 'scroll' ? 'on' : ''}
              onClick={() => setReadMode('scroll')}
            >
              📜 {isBn ? 'স্ক্রল মোড' : 'Scroll Mode'}
            </button>
          </div>

          {readMode === 'book' && (
            <button
              className={`reader-pill${rtlFlip ? ' on' : ''}`}
              onClick={() => setRtlFlip((v) => !v)}
              title="Reading direction"
            >
              {rtlFlip ? (isBn ? 'ডান←বাম (কুরআন)' : 'RTL (Quran)') : isBn ? 'বাম→ডান' : 'LTR'}
            </button>
          )}

          <div className="reader-zoom">
            <button
              className="reader-pill"
              onClick={() => setZoom((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))}
            >
              −
            </button>
            <button className="reader-pill" onClick={() => setZoom(1)}>
              {zoom === 1 ? (isBn ? 'ফিট' : 'Fit') : `${Math.round(zoom * 100)}%`}
            </button>
            <button
              className="reader-pill"
              onClick={() => setZoom((z) => Math.min(2.4, +(z + 0.25).toFixed(2)))}
            >
              +
            </button>
          </div>

          <button
            className="reader-pill"
            onClick={() =>
              setReaderTheme((t) => (t === 'day' ? 'sepia' : t === 'sepia' ? 'night' : 'day'))
            }
          >
            {readerTheme === 'day'
              ? isBn
                ? '☀ দিন'
                : '☀ Day'
              : readerTheme === 'sepia'
              ? isBn
                ? '📜 কাগজ'
                : '📜 Sepia'
              : isBn
              ? '☾ রাত'
              : '☾ Night'}
          </button>
        </div>
      )}

      {/* Main Reader Stage */}
      <div
        ref={bodyRef}
        className={`reader-body mode-${readMode}`}
        onPointerDown={(e) => {
          swipeRef.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          const start = swipeRef.current;
          swipeRef.current = null;
          if (!start || useIframeFallback || loadingPdf) return;
          const dx = e.clientX - start.x;
          const dy = e.clientY - start.y;

          if (readMode === 'book' && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) {
            if (rtlFlip) {
              // Swipe right-to-left (dx < 0) turns back in RTL? Wait: in Arabic/Quran RTL books, page 2 is on the LEFT, so swiping left-to-right (dx > 0) turns forward to next page!
              if (dx > 0) goPage(pageNum + 1, 'next');
              else goPage(pageNum - 1, 'prev');
            } else {
              if (dx < 0) goPage(pageNum + 1, 'next');
              else goPage(pageNum - 1, 'prev');
            }
          } else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
            setBarsHidden((b) => !b);
          }
        }}
      >
        {loadingPdf && (
          <div className="reader-loading">
            <div className="reader-spinner" />
            <b>{isBn ? 'কিতাব লোড হচ্ছে…' : 'Opening Kitab…'}</b>
            {loadProgress > 0 && (
              <>
                <div className="pbar" style={{ width: 220 }}>
                  <i style={{ width: `${loadProgress}%` }} />
                </div>
                <span className="mut sm">{loadProgress}%</span>
              </>
            )}
          </div>
        )}

        {!loadingPdf && useIframeFallback && fallbackIframeUrl && (
          <iframe
            title={title}
            src={fallbackIframeUrl}
            className="reader-iframe"
            allow="autoplay"
          />
        )}

        {!loadingPdf && !useIframeFallback && pdfDoc && readMode === 'book' && (
          <div className={`reader-book-wrap${flipAnim ? ` flip-${flipAnim}` : ''}`}>
            <div className="reader-book-sheet">
              <canvas ref={bookCanvasRef} />
            </div>
          </div>
        )}

        {!loadingPdf && !useIframeFallback && pdfDoc && readMode === 'scroll' && (
          <div className="reader-scroll-list">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
              <ScrollPdfPage
                key={n}
                doc={pdfDoc}
                pageNum={n}
                zoom={zoom}
                containerWidth={containerWidth}
                onVisible={setPageNum}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Book Navigation & Page Scrubber */}
      {!useIframeFallback && numPages > 0 && (
        <footer className={`reader-foot${barsHidden ? ' hide' : ''}`}>
          {readMode === 'book' && (
            <button
              className="reader-btn"
              disabled={rtlFlip ? pageNum >= numPages : pageNum <= 1}
              onClick={() =>
                rtlFlip
                  ? goPage(pageNum + 1, 'next')
                  : goPage(pageNum - 1, 'prev')
              }
            >
              ‹ {rtlFlip ? (isBn ? 'পরের' : 'Next') : isBn ? 'আগের' : 'Prev'}
            </button>
          )}

          <input
            type="range"
            className="reader-range"
            min={1}
            max={numPages}
            dir={rtlFlip && readMode === 'book' ? 'rtl' : 'ltr'}
            value={pageNum}
            onChange={(e) => goPage(Number(e.target.value))}
          />

          <form
            className="reader-jump"
            onSubmit={(e) => {
              e.preventDefault();
              const val = Number(jumpInput);
              if (Number.isFinite(val)) goPage(val);
            }}
          >
            <input
              type="number"
              min={1}
              max={numPages}
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              aria-label="Page number"
            />
            <span>/ {numPages}</span>
          </form>

          {readMode === 'book' && (
            <button
              className="reader-btn"
              disabled={rtlFlip ? pageNum <= 1 : pageNum >= numPages}
              onClick={() =>
                rtlFlip
                  ? goPage(pageNum - 1, 'prev')
                  : goPage(pageNum + 1, 'next')
              }
            >
              {rtlFlip ? (isBn ? 'আগের' : 'Prev') : isBn ? 'পরের' : 'Next'} ›
            </button>
          )}
        </footer>
      )}
    </div>
  );
};
