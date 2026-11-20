import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ALL_SURAHS, AyahItem, toArabicDigits, toBengaliDigits } from '../data/quran';

export type QuoteThemeId = 'amethyst' | 'emerald' | 'midnight' | 'sunset' | 'onyx' | 'pearl';
export type QuoteRatio = 'story' | 'square';
export type ArabicFontChoice = 'uthmani' | 'indopak' | 'warsh' | 'naskh';

interface ThemeConfig {
  id: QuoteThemeId;
  nameBn: string;
  gradient: [string, string, string];
  accentColor: string;
  textColor: string;
  transColor: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  isLight?: boolean;
}

const THEMES: Record<QuoteThemeId, ThemeConfig> = {
  amethyst: {
    id: 'amethyst',
    nameBn: 'রাজকীয় পার্পল',
    gradient: ['#1A0F33', '#311860', '#120A24'],
    accentColor: '#D8CCFF',
    textColor: '#FFFFFF',
    transColor: '#D8CCFF',
    borderColor: '#7C5CE6',
    badgeBg: 'rgba(124, 92, 230, 0.25)',
    badgeText: '#E6DCFF',
  },
  emerald: {
    id: 'emerald',
    nameBn: 'ইসলামিক পান্না',
    gradient: ['#052518', '#0C442D', '#02160E'],
    accentColor: '#F5D77F',
    textColor: '#FFFFFF',
    transColor: '#BEE7D4',
    borderColor: '#D4AF37',
    badgeBg: 'rgba(212, 175, 55, 0.2)',
    badgeText: '#FBE9B3',
  },
  midnight: {
    id: 'midnight',
    nameBn: 'গভীর নীলিমা',
    gradient: ['#08162A', '#13284C', '#040B16'],
    accentColor: '#80B5FE',
    textColor: '#FFFFFF',
    transColor: '#B8D5FA',
    borderColor: '#3B82F6',
    badgeBg: 'rgba(59, 130, 246, 0.25)',
    badgeText: '#CFE2FE',
  },
  sunset: {
    id: 'sunset',
    nameBn: 'গোধূলি আভা',
    gradient: ['#381512', '#5A241B', '#220A08'],
    accentColor: '#F6B17A',
    textColor: '#FFFFFF',
    transColor: '#F8D2BA',
    borderColor: '#E06D44',
    badgeBg: 'rgba(224, 109, 68, 0.25)',
    badgeText: '#FCE0D4',
  },
  onyx: {
    id: 'onyx',
    nameBn: 'অভিজাত ব্ল্যাক',
    gradient: ['#0E0F12', '#1B1C22', '#08080A'],
    accentColor: '#E6C687',
    textColor: '#FFFFFF',
    transColor: '#D1D2D6',
    borderColor: '#C5A059',
    badgeBg: 'rgba(197, 160, 89, 0.2)',
    badgeText: '#F2DFBC',
  },
  pearl: {
    id: 'pearl',
    nameBn: 'শুভ্র মুক্তা',
    gradient: ['#FBF9F5', '#F3EBE0', '#EAE0D2'],
    accentColor: '#4A2E80',
    textColor: '#1F1735',
    transColor: '#50446A',
    borderColor: '#7C5CE6',
    badgeBg: 'rgba(124, 92, 230, 0.12)',
    badgeText: '#4A2E80',
    isLight: true,
  },
};

const FONT_MAP: Record<ArabicFontChoice, { nameBn: string; family: string; cssClass: string }> = {
  uthmani: {
    nameBn: 'উসমানী লিপি (হাফস)',
    family: "'Amiri Quran', 'Amiri', serif",
    cssClass: 'font-uthmani',
  },
  indopak: {
    nameBn: 'ইন্দো-পাক / নূরানী',
    family: "'Scheherazade New', serif",
    cssClass: 'font-indopak',
  },
  warsh: {
    nameBn: 'রেওয়ায়েত ওয়ারশ',
    family: "'Warsh Quran', 'Amiri Quran', serif",
    cssClass: 'font-warsh',
  },
  naskh: {
    nameBn: 'সুলভ নাসেখ',
    family: "'Noto Naskh Arabic', sans-serif",
    cssClass: 'font-naskh',
  },
};

export interface AyahQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  ayahNumber: number;
  ayahItem: AyahItem;
  defaultFont?: ArabicFontChoice;
  onToast: (msg: string) => void;
}

export function AyahQuoteModal({
  isOpen,
  onClose,
  surahNumber,
  ayahNumber,
  ayahItem,
  defaultFont = 'uthmani',
  onToast,
}: AyahQuoteModalProps) {
  const [themeId, setThemeId] = useState<QuoteThemeId>('amethyst');
  const [ratio, setRatio] = useState<QuoteRatio>('story');
  const [fontChoice, setFontChoice] = useState<ArabicFontChoice>(defaultFont);
  const [showArabic, setShowArabic] = useState(true);
  const [showBangla, setShowBangla] = useState(true);
  const [showEnglish, setShowEnglish] = useState(false);
  const [showRef, setShowRef] = useState(true);
  const [showBrand, setShowBrand] = useState(true);
  const [sizeScale, setSizeScale] = useState<'sm' | 'md' | 'lg'>('md');
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (defaultFont) setFontChoice(defaultFont);
  }, [defaultFont]);

  const surahMeta = ALL_SURAHS.find((s) => s.number === surahNumber) || ALL_SURAHS[0];
  const theme = THEMES[themeId];

  // Helper to wrap text on canvas
  const wrapText = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      text: string,
      x: number,
      startY: number,
      maxWidth: number,
      lineHeight: number,
      align: 'center' | 'right' | 'left' = 'center'
    ): number => {
      ctx.textAlign = align;
      const words = text.split(/\s+/);
      let line = '';
      let y = startY;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + (line ? ' ' : '') + words[n];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, x, y);
          line = words[n];
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      if (line) {
        ctx.fillText(line, x, y);
        y += lineHeight;
      }
      return y;
    },
    []
  );

  // Generate high-resolution Canvas Blob
  const renderCanvasBlob = useCallback(async (): Promise<Blob> => {
    const W = ratio === 'story' ? 1080 : 1080;
    const H = ratio === 'story' ? 1920 : 1080;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    // 1. Draw Background Gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, theme.gradient[0]);
    grad.addColorStop(0.5, theme.gradient[1]);
    grad.addColorStop(1, theme.gradient[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 2. Draw Subtle Radial Glow
    const glowGrad = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, Math.max(W, H) / 1.5);
    glowGrad.addColorStop(0, `${theme.borderColor}26`);
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, W, H);

    // 3. Draw Islamic Decorative Border
    const pad = 54;
    ctx.save();
    ctx.strokeStyle = `${theme.borderColor}4D`;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2);

    // Inner subtle border
    const innerPad = pad + 14;
    ctx.strokeStyle = `${theme.borderColor}22`;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(innerPad, innerPad, W - innerPad * 2, H - innerPad * 2);

    // Corner Accents
    const cornerSize = 24;
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 3;
    const corners = [
      [pad, pad, pad + cornerSize, pad, pad, pad + cornerSize],
      [W - pad, pad, W - pad - cornerSize, pad, W - pad, pad + cornerSize],
      [pad, H - pad, pad + cornerSize, H - pad, pad, H - pad - cornerSize],
      [W - pad, H - pad, W - pad - cornerSize, H - pad, W - pad, H - pad - cornerSize],
    ];
    for (const [x1, y1, x2, y2, x3, y3] of corners) {
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x3, y3);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Header Badge: Surah Reference
    let cursorY = ratio === 'story' ? 220 : 130;

    if (showRef) {
      const refText = `${surahMeta.bn} • আয়াত ${toBengaliDigits(ayahNumber)}`;
      ctx.save();
      ctx.font = '600 28px "Hind Siliguri", sans-serif';
      const badgeWidth = ctx.measureText(refText).width + 64;
      const badgeHeight = 52;
      const badgeX = (W - badgeWidth) / 2;
      const badgeY = cursorY;

      // Draw rounded badge
      ctx.fillStyle = theme.badgeBg;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 26);
      ctx.fill();

      ctx.strokeStyle = `${theme.borderColor}66`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = theme.badgeText;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(refText, W / 2, badgeY + badgeHeight / 2 + 2);
      ctx.restore();

      cursorY += badgeHeight + (ratio === 'story' ? 60 : 36);
    }

    // 5. Islamic Bismillah / Calligraphy Accent
    if (surahNumber !== 9 && (ayahNumber !== 1 || surahNumber !== 1)) {
      ctx.save();
      ctx.font = '400 36px "Amiri Quran", "Amiri", serif';
      ctx.fillStyle = `${theme.accentColor}99`;
      ctx.textAlign = 'center';
      ctx.fillText('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', W / 2, cursorY);
      ctx.restore();
      cursorY += 60;
    }

    // Measure and layout text content
    const contentWidth = W - 220;
    const fontMultiplier = sizeScale === 'sm' ? 0.85 : sizeScale === 'lg' ? 1.15 : 1;

    // 6. Arabic Ayah Text
    if (showArabic && ayahItem.ar) {
      cursorY += 20;
      const arFontSize = Math.round(
        (ratio === 'story' ? 56 : 48) * fontMultiplier
      );
      const arLineHeight = Math.round(arFontSize * 1.9);

      ctx.save();
      ctx.font = `normal ${arFontSize}px ${FONT_MAP[fontChoice].family}`;
      ctx.fillStyle = theme.textColor;
      ctx.direction = 'rtl';

      cursorY = wrapText(
        ctx,
        ayahItem.ar,
        W / 2,
        cursorY + arFontSize,
        contentWidth,
        arLineHeight,
        'center'
      );
      ctx.restore();
    }

    // Decorative Divider
    cursorY += 30;
    ctx.save();
    ctx.strokeStyle = `${theme.borderColor}55`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 120, cursorY);
    ctx.lineTo(W / 2 + 120, cursorY);
    ctx.stroke();

    // Center jewel
    ctx.fillStyle = theme.accentColor;
    ctx.beginPath();
    ctx.arc(W / 2, cursorY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    cursorY += 44;

    // 7. Bengali Translation
    if (showBangla && ayahItem.bn) {
      const bnFontSize = Math.round((ratio === 'story' ? 36 : 30) * fontMultiplier);
      const bnLineHeight = Math.round(bnFontSize * 1.6);

      ctx.save();
      ctx.font = `500 ${bnFontSize}px "Hind Siliguri", sans-serif`;
      ctx.fillStyle = theme.transColor;
      cursorY = wrapText(
        ctx,
        `"${ayahItem.bn}"`,
        W / 2,
        cursorY + bnFontSize,
        contentWidth,
        bnLineHeight,
        'center'
      );
      ctx.restore();
    }

    // 8. English Translation (Optional)
    if (showEnglish && ayahItem.en) {
      cursorY += 20;
      const enFontSize = Math.round((ratio === 'story' ? 28 : 24) * fontMultiplier);
      const enLineHeight = Math.round(enFontSize * 1.5);

      ctx.save();
      ctx.font = `italic 400 ${enFontSize}px "Inter", sans-serif`;
      ctx.fillStyle = `${theme.transColor}B3`;
      cursorY = wrapText(
        ctx,
        ayahItem.en,
        W / 2,
        cursorY + enFontSize,
        contentWidth,
        enLineHeight,
        'center'
      );
      ctx.restore();
    }

    // 9. Footer: ZIKRIFY Branding & MAHADUL FURQAN
    if (showBrand) {
      const footerY = H - (ratio === 'story' ? 140 : 100);
      ctx.save();
      ctx.textAlign = 'center';

      // Brand Title
      ctx.font = '700 30px "Inter", sans-serif';
      ctx.fillStyle = theme.accentColor;
      ctx.fillText('ZIKRIFY', W / 2, footerY);

      // Subtitle
      ctx.font = '500 20px "Hind Siliguri", sans-serif';
      ctx.fillStyle = `${theme.textColor}80`;
      ctx.fillText('Graphico Global • Mahadul Furqan', W / 2, footerY + 32);
      ctx.restore();
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas export failed'));
      }, 'image/png');
    });
  }, [
    ratio,
    theme,
    showRef,
    showArabic,
    showBangla,
    showEnglish,
    showBrand,
    surahNumber,
    ayahNumber,
    surahMeta,
    ayahItem,
    sizeScale,
    fontChoice,
    wrapText,
  ]);

  // Handle Download Image
  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const blob = await renderCanvasBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ZIKRIFY_Surah_${surahNumber}_Ayah_${ayahNumber}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      onToast('কোট কার্ডের ছবি সফলভাবে ডাউনলোড হয়েছে!');
    } catch (err) {
      console.error('Download error:', err);
      onToast('ছবি ডাউনলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Web Share API
  const handleShare = async () => {
    try {
      setIsExporting(true);
      const blob = await renderCanvasBlob();
      const file = new File(
        [blob],
        `ZIKRIFY_Surah_${surahNumber}_Ayah_${ayahNumber}.png`,
        { type: 'image/png' }
      );

      const shareText = `পবিত্র কুরআন • ${surahMeta.bn} (${toBengaliDigits(
        surahNumber
      )}:${toBengaliDigits(ayahNumber)})\n\n${ayahItem.ar}\n\n"${
        ayahItem.bn
      }"\n\n— ZIKRIFY (MAHADUL FURQAN)`;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `ZIKRIFY • ${surahMeta.bn}:${ayahNumber}`,
          text: shareText,
          files: [file],
        });
        onToast('সফলভাবে শেয়ার করা হয়েছে!');
      } else if (navigator.share) {
        await navigator.share({
          title: `ZIKRIFY • ${surahMeta.bn}:${ayahNumber}`,
          text: shareText,
        });
        onToast('টেক্সট শেয়ার করা হয়েছে!');
      } else {
        await navigator.clipboard.writeText(shareText);
        onToast('আয়াত ও অনুবাদ ক্লিপবোর্ডে কপি করা হয়েছে!');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
        onToast('শেয়ার করা সম্ভব হয়নি। ছবি ডাউনলোড করুন।');
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Copy Formatted Text
  const handleCopyText = async () => {
    try {
      const formatted = `بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\n\n${ayahItem.ar}\n\n"${ayahItem.bn}"\n\n— ${surahMeta.bn} (${surahNumber}:${ayahNumber})\n📱 ZIKRIFY • Mahadul Furqan`;
      await navigator.clipboard.writeText(formatted);
      onToast('আয়াতের টেক্সট কপি করা হয়েছে!');
    } catch {
      onToast('কপি করতে সমস্যা হয়েছে।');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="quote-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Ayah Quote Card Creator"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="quote-modal-container">
        {/* Top Header */}
        <div className="quote-modal-head">
          <div className="quote-modal-title">
            <b>🎨 আয়াত কোট ও ফটো কার্ড মেকার</b>
            <span>সোশ্যাল মিডিয়া স্টোরি বা ফেসবুক পোস্টের জন্য ছবি তৈরি করুন</span>
          </div>
          <button className="chip" onClick={onClose} aria-label="Close">
            ✕ বন্ধ
          </button>
        </div>

        <div className="quote-modal-body">
          {/* Card Visual Preview */}
          <div className="quote-preview-wrapper">
            <div
              className={`quote-card-preview ${ratio === 'story' ? 'ratio-story' : 'ratio-square'}`}
              style={{
                background: `linear-gradient(135deg, ${theme.gradient[0]} 0%, ${theme.gradient[1]} 50%, ${theme.gradient[2]} 100%)`,
                borderColor: `${theme.borderColor}80`,
                color: theme.textColor,
              }}
            >
              {/* Inner Decorative Border */}
              <div
                className="quote-preview-border"
                style={{ borderColor: `${theme.borderColor}33` }}
              />

              {/* Reference Badge */}
              {showRef && (
                <div
                  className="quote-preview-badge"
                  style={{
                    backgroundColor: theme.badgeBg,
                    color: theme.badgeText,
                    borderColor: `${theme.borderColor}55`,
                  }}
                >
                  {surahMeta.bn} • আয়াত {toBengaliDigits(ayahNumber)}
                </div>
              )}

              {/* Arabic Verse Text */}
              {showArabic && ayahItem.ar && (
                <div
                  className={`quote-preview-ar ${FONT_MAP[fontChoice].cssClass}`}
                  dir="rtl"
                  lang="ar"
                  style={{
                    fontSize:
                      sizeScale === 'sm'
                        ? '19px'
                        : sizeScale === 'lg'
                        ? '27px'
                        : '23px',
                    color: theme.textColor,
                  }}
                >
                  {ayahItem.ar}
                </div>
              )}

              {/* Divider Jewel */}
              <div className="quote-preview-divider">
                <span style={{ backgroundColor: `${theme.borderColor}4D` }} />
                <i style={{ backgroundColor: theme.accentColor }} />
                <span style={{ backgroundColor: `${theme.borderColor}4D` }} />
              </div>

              {/* Bengali Translation */}
              {showBangla && ayahItem.bn && (
                <div
                  className="quote-preview-bn"
                  style={{
                    fontSize:
                      sizeScale === 'sm'
                        ? '13px'
                        : sizeScale === 'lg'
                        ? '16px'
                        : '14.5px',
                    color: theme.transColor,
                  }}
                >
                  “{ayahItem.bn}”
                </div>
              )}

              {/* English Translation */}
              {showEnglish && ayahItem.en && (
                <div
                  className="quote-preview-en"
                  style={{
                    fontSize:
                      sizeScale === 'sm'
                        ? '11.5px'
                        : sizeScale === 'lg'
                        ? '14px'
                        : '12.5px',
                    color: `${theme.transColor}B3`,
                  }}
                >
                  {ayahItem.en}
                </div>
              )}

              {/* Footer Branding */}
              {showBrand && (
                <div className="quote-preview-footer">
                  <span
                    className="quote-preview-brand"
                    style={{ color: theme.accentColor }}
                  >
                    ZIKRIFY
                  </span>
                  <span
                    className="quote-preview-sub"
                    style={{ color: `${theme.textColor}80` }}
                  >
                    Graphico Global • Mahadul Furqan
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Controls & Customization Toolbar */}
          <div className="quote-controls-panel">
            {/* Format: Story vs Square */}
            <div className="quote-control-group">
              <label>📐 ছবির মাপ / অনুপাত</label>
              <div className="quote-btn-grid cols-2">
                <button
                  type="button"
                  className={`chip${ratio === 'story' ? ' on' : ''}`}
                  onClick={() => setRatio('story')}
                >
                  📱 স্টোরি / স্ট্যাটাস (9:16)
                </button>
                <button
                  type="button"
                  className={`chip${ratio === 'square' ? ' on' : ''}`}
                  onClick={() => setRatio('square')}
                >
                  🔲 স্কয়ার / পোস্ট (1:1)
                </button>
              </div>
            </div>

            {/* Arabic Font Selection */}
            <div className="quote-control-group">
              <label>🔤 আরবি ফন্ট স্টাইল</label>
              <div className="quote-btn-grid cols-2">
                {(Object.keys(FONT_MAP) as ArabicFontChoice[]).map((fKey) => (
                  <button
                    key={fKey}
                    type="button"
                    className={`chip${fontChoice === fKey ? ' on' : ''}`}
                    onClick={() => setFontChoice(fKey)}
                  >
                    {FONT_MAP[fKey].nameBn}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Theme Swatches */}
            <div className="quote-control-group">
              <label>🎨 ব্যাকগ্রাউন্ড থিম</label>
              <div className="quote-theme-grid">
                {(Object.keys(THEMES) as QuoteThemeId[]).map((tId) => {
                  const th = THEMES[tId];
                  return (
                    <button
                      key={tId}
                      type="button"
                      className={`quote-theme-btn${themeId === tId ? ' act' : ''}`}
                      onClick={() => setThemeId(tId)}
                      title={th.nameBn}
                      style={{
                        background: `linear-gradient(135deg, ${th.gradient[0]}, ${th.gradient[1]})`,
                        borderColor: themeId === tId ? th.accentColor : 'transparent',
                      }}
                    >
                      <span className="quote-theme-name">{th.nameBn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Size & Elements Toggles */}
            <div className="quote-control-group">
              <label>🔍 লেখার সাইজ</label>
              <div className="quote-btn-grid cols-3">
                <button
                  type="button"
                  className={`chip${sizeScale === 'sm' ? ' on' : ''}`}
                  onClick={() => setSizeScale('sm')}
                >
                  ছোট (S)
                </button>
                <button
                  type="button"
                  className={`chip${sizeScale === 'md' ? ' on' : ''}`}
                  onClick={() => setSizeScale('md')}
                >
                  মাঝারি (M)
                </button>
                <button
                  type="button"
                  className={`chip${sizeScale === 'lg' ? ' on' : ''}`}
                  onClick={() => setSizeScale('lg')}
                >
                  বড় (L)
                </button>
              </div>
            </div>

            {/* Element Visibility Checkboxes */}
            <div className="quote-control-group">
              <label>⚙️ কার্ডে কী কী রাখবেন</label>
              <div className="quote-toggle-grid">
                <label className="quote-checkbox-row">
                  <input
                    type="checkbox"
                    checked={showArabic}
                    onChange={(e) => setShowArabic(e.target.checked)}
                  />
                  <span>আরবি মূল আয়াত</span>
                </label>
                <label className="quote-checkbox-row">
                  <input
                    type="checkbox"
                    checked={showBangla}
                    onChange={(e) => setShowBangla(e.target.checked)}
                  />
                  <span>বাংলা অনুবাদ</span>
                </label>
                <label className="quote-checkbox-row">
                  <input
                    type="checkbox"
                    checked={showEnglish}
                    onChange={(e) => setShowEnglish(e.target.checked)}
                  />
                  <span>ইংরেজি অর্থ</span>
                </label>
                <label className="quote-checkbox-row">
                  <input
                    type="checkbox"
                    checked={showRef}
                    onChange={(e) => setShowRef(e.target.checked)}
                  />
                  <span>সূরার নাম ও রেফারেন্স ব্যাজ</span>
                </label>
                <label className="quote-checkbox-row">
                  <input
                    type="checkbox"
                    checked={showBrand}
                    onChange={(e) => setShowBrand(e.target.checked)}
                  />
                  <span>ZIKRIFY ব্র্যান্ড ও ক্রেডিট</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="quote-actions-row">
              <button
                type="button"
                className="btn-primary quote-main-btn"
                onClick={handleDownload}
                disabled={isExporting}
              >
                {isExporting ? 'তৈরি হচ্ছে...' : '⬇️ ছবি ডাউনলোড করুন (HD)'}
              </button>
              <button
                type="button"
                className="chip quote-sub-btn"
                onClick={handleShare}
                disabled={isExporting}
              >
                🚀 সরাসরি শেয়ার
              </button>
              <button
                type="button"
                className="chip quote-sub-btn"
                onClick={handleCopyText}
              >
                📋 টেক্সট কপি
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
