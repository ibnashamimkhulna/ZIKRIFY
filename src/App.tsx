import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ALL_SURAHS,
  AyahItem,
  BISMILLAH_AR,
  DEFAULT_SURAH,
  ENGLISH_SURAH_BASE,
  FATIHAH_AYAHS,
  OfflineBulkProgress,
  PDF_COVER_PRESETS,
  RECITERS,
  SIMILAR_VERSES,
  SurahMeta,
  downloadAllQuranText,
  downloadAllSurahAudio,
  fetchSurahAyahs,
  getAyahAudioUrl,
  getBanglaTtsUrl,
  getEnglishAyahAudioUrl,
  getSurahAudioUrl,
  normalizeArabic,
  toArabicDigits,
  toBengaliDigits,
  tokenizeAyahForHifz,
} from './data/quran';
import { AppLang, COPY } from './data/i18n';
import {
  TAJWEED_RULES,
  TEACH_LANG_LABELS,
  TajweedRuleId,
  TeachLang,
} from './data/tajweedData';
import { TajweedWord, parseAyahTajweed } from './utils/tajweedParser';
import { PdfReader } from './components/PdfReader';
import { TajweedInspectorSheet } from './components/TajweedInspectorSheet';
import { TajweedGuideModal } from './components/TajweedGuideModal';
import { AyahQuoteModal, ArabicFontChoice } from './components/AyahQuoteModal';
import { QuranSearchModal } from './components/QuranSearchModal';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  getStorageUsageBytes,
  idbDelete,
  idbDeletePrefix,
  idbGet,
  idbKeys,
  idbPut,
} from './utils/storage';

type TabIndex = 0 | 1 | 2 | 3 | 4;
type ListenLang = 0 | 1 | 2; // 0: Arabic, 1: Bangla, 2: English
type WordStatus = '' | 'ok' | 'bad';
type ReadViewMode = 'mushaf' | 'ayah_ar' | 'meaning';
type TeacherMarkKind = 'mistake' | 'focus' | 'done' | 'waqf';
type TeacherToolMode = 'inspect' | TeacherMarkKind | 'erase';

const RULE_UNDERLINE_STYLE: Record<TajweedRuleId, string> = {
  ghunnah: 'dotted',
  ikhfa: 'dotted',
  idgham_ghunnah: 'dotted',
  idgham_no_ghunnah: 'dashed',
  iqlab: 'dotted',
  qalqalah: 'double',
  madd_wajib: 'wavy',
  madd_asli: 'solid',
  tafkheem: 'solid',
  lam_allah: 'solid',
  silent: 'dashed',
};

const MARK_SYMBOL: Record<TeacherMarkKind, string> = {
  mistake: '✕',
  focus: '★',
  done: '✓',
  waqf: '⏸',
};

interface MediaItem {
  file: File;
  name: string;
  kind: 'a' | 'v';
}

interface PdfItem {
  id: string;
  t: string;
  cat: string;
  url?: string;
  file?: boolean;
  coverUrl?: string;
  coverFile?: boolean;
  builtIn?: boolean;
}

type AudioFilterPreset = 'all' | 'juz_amma' | 'last_10' | 'custom';

interface OfflineDownloadJob {
  status: 'idle' | 'running' | 'paused';
  mode: 'full' | 'filtered';
  includeText: boolean;
  includeAudio: boolean;
  reciterIndex: number;
  filterPreset: AudioFilterPreset;
  rangeStart: number;
  rangeEnd: number;
  completed: number;
  total: number;
  label: string;
}

interface HifzWordEntry {
  word: string;
  ayahIndex: number; // 0-based within current Surah
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5];
const SLEEP_PRESET_MINUTES = [2, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
const MEDIA_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];
const MEDIA_FITS: Array<'contain' | 'cover' | 'fill'> = ['contain', 'cover', 'fill'];
const MEDIA_FIT_LABELS = ['Fit', 'Crop', 'Stretch'];
const REPEAT_LABELS = ['Repeat: off', 'Repeat: one', 'Repeat: all'];
const PDF_CATEGORIES = ['All', '15-Line Hifz Quran', 'Books', 'Other'];
const PDF_STORAGE_KEY = 'zk_pdf';
const DL_JOB_STORAGE_KEY = 'zk_dl_job';
const HIFZ_AYAHS_PER_PAGE = 7;

const DEFAULT_HIFZUL_QURAN: PdfItem = {
  id: 'default-hifzul-quran',
  t: 'হিফজুল কোরআন',
  cat: '15-Line Hifz Quran',
  url: 'https://drive.google.com/file/d/12KyQctKSEYGeY495RMo9ee3yKUgG5qim/view?usp=drivesdk',
  coverUrl: PDF_COVER_PRESETS[0].url,
  builtIn: true,
};

const EMPTY_DL_JOB: OfflineDownloadJob = {
  status: 'idle',
  mode: 'full',
  includeText: true,
  includeAudio: true,
  reciterIndex: 0,
  filterPreset: 'all',
  rangeStart: 1,
  rangeEnd: 114,
  completed: 0,
  total: 228,
  label: '',
};

const BASE_WAVE_HEIGHTS = Array.from({ length: 40 }, (_, i) => 8 + ((i * 37) % 36));
const EQ_BAR_COUNT = 24;

const APP_VERSION = 'v2.4.0';

const getTourSteps = (lang: AppLang): Array<[TabIndex, string, string, string]> =>
  lang === 'bn'
    ? [
        [
          0,
          'M4 14v-2a8 8 0 0116 0v2M4 14h3v6H4zM17 14h3v6h-3z',
          'কুরআন তিলাওয়াত শুনুন',
          '১১৪টি সূরার যেকোনোটি বেছে নিন, ১০ জন ক্বারি থেকে নির্বাচন করুন, আরবি, বাংলা বা ইংরেজিতে শুনুন এবং অফলাইনে সেভ করুন।',
        ],
        [
          1,
          'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 19h15',
          'অর্থসহ কুরআন পড়ুন',
          'আরবি উসমানী টেক্সটের সাথে বাংলা ও ইংরেজি অর্থ পড়ুন। যেকোনো আয়াতের অডিও শুনতে বাটনে ট্যাপ করুন।',
        ],
        [
          2,
          'M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3zM6 11a6 6 0 0012 0M12 17v4',
          'হিফয মোড',
          'সঠিক শব্দ সবুজ ও ভুল শব্দ লাল রঙে দেখাবে। পরের শব্দ লুকিয়ে মুখস্থ পরীক্ষা করুন।',
        ],
        [
          3,
          'M3 6h7l2 2h9v11H3z',
          'নিজস্ব অডিও ও ভিডিও',
          'ফোনের যেকোনো অডিও/ভিডিও সোয়াইপ জেসচার, সাবটাইটেল, স্পিড, A–B রিপিট সহ চালান।',
        ],
        [
          4,
          'M4 4h12l4 4v12H4zM15 4v5h5M8 13h8M8 17h8',
          'কিতাব ও পিডিএফ',
          'গুগল ড্রাইভ লিংক বা ফোনের PDF কভার ছবিসহ সাজিয়ে রাখুন এবং অফলাইনে পড়ুন।',
        ],
        [
          0,
          'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
          'পূর্ণ অফলাইন ডাটা ও সেটিংস',
          'গাইডের পর সম্পূর্ণ ১১৪ সূরা একসাথে অফলাইন ডাউনলোড করতে পারবেন। এখন স্কিপ করলেও পরে উপরের সেটিংস (⚙) আইকন থেকে যেকোনো সময় সব ডাটা আবার ডাউনলোড, ভাষা ও থিম পরিবর্তন করতে পারবেন।',
        ],
      ]
    : [
        [
          0,
          'M4 14v-2a8 8 0 0116 0v2M4 14h3v6H4zM17 14h3v6h-3z',
          'Listen to the Quran',
          'Choose any of the 114 Surahs, pick a reciter, listen in Arabic, বাংলা or English, save for offline listening and set a sleep timer.',
        ],
        [
          1,
          'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 19h15',
          'Read with meaning',
          'Read any Surah in Arabic with Bengali and English meaning. Tap a language button to hear that ayah.',
        ],
        [
          2,
          'M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3zM6 11a6 6 0 0012 0M12 17v4',
          'Hifz mode',
          'Correct words turn green and mistakes turn red. Hide the next words to test your memory.',
        ],
        [
          3,
          'M3 6h7l2 2h9v11H3z',
          'Your music and videos',
          'Play audio and video from your phone with swipe gestures, subtitles, speed, A–B repeat and more.',
        ],
        [
          4,
          'M4 4h12l4 4v12H4zM15 4v5h5M8 13h8M8 17h8',
          'Books and PDFs',
          'Add your 15-line Hifz Quran and other books with a Google Drive link, set a highlighted cover picture, or save the PDF on your phone to open it offline.',
        ],
        [
          0,
          'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
          'Offline Pack & Settings',
          'Download all 114 Surahs right after this guide to run completely offline. Even if you skip now, you can open Settings (⚙) anytime later to download or refresh all offline data, change language, or switch themes.',
        ],
      ];

const getOverviewItems = (lang: AppLang): Array<[string, string]> =>
  lang === 'bn'
    ? [
        ['শুনুন', 'সম্পূর্ণ ১১৪ সূরা · ১০ জন ক্বারি · আরবি, বাংলা, ইংরেজি · অফলাইন সেভ · স্লিপ টাইমার'],
        ['পড়ুন', 'আরবি উসমানী ও বাংলা-ইংরেজি অর্থ · প্রতি আয়াতের তিলাওয়াত · মুতাশাবিহাত'],
        ['হিফয', 'ভয়েস চেক ও ট্যাপ হিফয · সঠিক শব্দ সবুজ, ভুল লাল · পরের শব্দ লুকানোর সুবিধা'],
        ['মিডিয়া', 'ফোনের অডিও/ভিডিও প্লেয়ার · সোয়াইপ জেসচার · সাবটাইটেল · A–B রিপিট · পপ-আউট'],
        ['কিতাব', '১৫-লাইন হিফয কুরআন PDF · গুগল ড্রাইভ লিংক · কভার ছবি · অফলাইন সংরক্ষণ'],
        ['অফলাইন ও সেটিংস', 'পূর্ণ অফলাইন প্যাকেজ ডাউনলোড (এখন স্কিপ করলেও পরে সেটিংস ⚙ থেকে ডাউনলোডযোগ্য) · ভাষা ও থিম'],
      ]
    : [
        ['Listen', 'All 114 Surahs · 10 reciters · Arabic, বাংলা, English · offline copy · sleep timer · speed'],
        ['Read', 'Complete Quran with Bengali & English meanings · tap to hear each ayah · similar verses'],
        ['Hifz', 'Live voice recognition & word check · green for correct, red for mistakes · hide next words'],
        ['Media', 'Music and video player · swipe gestures · subtitles · A–B repeat · pop-out · lock · bass and treble'],
        ['Books', '15-line Hifz Quran PDFs · Google Drive links · highlighted cover pictures · offline files'],
        ['Offline & Settings', 'Full 114-Surah offline downloader (skip anytime & re-download later in Settings ⚙) · Theme · Language'],
      ];

const BASE_URL = import.meta.env.BASE_URL || '/';
const BRAND_LOGO_LIGHT = `${BASE_URL}assets/brand/logo-light.webp`;
const BRAND_LOGO_DARK = `${BASE_URL}assets/brand/logo-dark.webp`;
const BRAND_TAGLINE_LIGHT = `${BASE_URL}assets/brand/tagline-light.webp`;
const BRAND_TAGLINE_DARK = `${BASE_URL}assets/brand/tagline-dark.webp`;

function Icon({ d }: { d: string }) {
  return (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function BrandLogo({ width }: { width: number }) {
  return (
    <span className="glow">
      <img
        className="glg lt"
        alt="ZIKRIFY"
        style={{ width }}
        src={BRAND_LOGO_LIGHT}
      />
      <img
        className="glg dk"
        alt="ZIKRIFY"
        style={{ width }}
        src={BRAND_LOGO_DARK}
      />
    </span>
  );
}

function fmtTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function toDrivePreviewUrl(url: string): string | null {
  const m1 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return `https://drive.google.com/file/d/${m1[1]}/preview`;
  const m2 = url.match(/drive\.google\.com\/(?:open|uc)\?id=([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/file/d/${m2[1]}/preview`;
  return null;
}

function toDriveDownloadUrl(url: string): string | null {
  const m1 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return `https://drive.google.com/uc?export=download&id=${m1[1]}`;
  const m2 = url.match(/drive\.google\.com\/(?:open|uc)\?id=([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/uc?export=download&id=${m2[1]}`;
  return null;
}

function buildSurahSubset(
  preset: AudioFilterPreset,
  rangeStart: number,
  rangeEnd: number
): number[] | undefined {
  if (preset === 'all') return undefined;
  if (preset === 'juz_amma') {
    return Array.from({ length: 114 - 78 + 1 }, (_, i) => 78 + i);
  }
  if (preset === 'last_10') {
    return Array.from({ length: 114 - 105 + 1 }, (_, i) => 105 + i);
  }
  const s = Math.max(1, Math.min(114, Math.min(rangeStart, rangeEnd)));
  const e = Math.max(1, Math.min(114, Math.max(rangeStart, rangeEnd)));
  return Array.from({ length: e - s + 1 }, (_, i) => s + i);
}

function shiftSrtToVtt(text: string, deltaSec: number): string {
  let out = text;
  if (!out.startsWith('WEBVTT')) {
    out = 'WEBVTT\n\n' + out.replace(/(\d+:\d+:\d+),(\d+)/g, '$1.$2');
  }
  return out.replace(/(\d+):(\d+):(\d+)\.(\d+)/g, (_m, h, mi, s, ms) => {
    const total = Math.max(0, +h * 3600 + +mi * 60 + +s + +ms / 1000 + deltaSec);
    const hh = String(Math.floor(total / 3600)).padStart(2, '0');
    const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const ss = (total % 60).toFixed(3).padStart(6, '0');
    return `${hh}:${mm}:${ss}`;
  });
}

function hasNativeVoice(langPrefix: string): boolean {
  try {
    if (!('speechSynthesis' in window)) return false;
    const voices = window.speechSynthesis.getVoices();
    return voices.some((v) => v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()));
  } catch {
    return false;
  }
}

export default function App() {
  const mainRef = useRef<HTMLElement | null>(null);
  const [tab, setTab] = useState<TabIndex>(0);

  // Theme (Light / Dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('zk-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name=theme-color]') as HTMLMetaElement | null;
    if (meta) {
      meta.content = theme === 'dark' ? '#15112A' : '#F6F2FF';
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('zk-theme', next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // App Interface Language ('en' | 'bn')
  const [appLang, setAppLang] = useState<AppLang>(() => {
    try {
      const saved = localStorage.getItem('zk_lang');
      if (saved === 'en' || saved === 'bn') return saved;
    } catch {
      // ignore
    }
    return 'en';
  });

  const t = COPY[appLang];
  const tourSteps = useMemo(() => getTourSteps(appLang), [appLang]);
  const overviewItems = useMemo(() => getOverviewItems(appLang), [appLang]);

  const changeAppLang = useCallback((lang: AppLang) => {
    setAppLang(lang);
    try {
      localStorage.setItem('zk_lang', lang);
    } catch {
      // ignore
    }
  }, []);

  // PWA Install & Online Status
  const isOnline = useOnlineStatus();
  const pwa = usePWAInstall();

  // Branded Splash Screen
  const [splashState, setSplashState] = useState<'visible' | 'out' | 'gone'>('visible');
  const [appEntered, setAppEntered] = useState(false);
  const splashEndedRef = useRef(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const toastTimerRef = useRef<number | null>(null);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastVisible(false), 2600);
  }, []);

  const goTab = useCallback((i: TabIndex) => {
    setTab(i);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, []);

  // Settings & Full/Filtered Offline Pack Downloader State (with Background Minimize + Pause/Resume)
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<'general' | 'about'>('general');
  const [offlinePromptOpen, setOfflinePromptOpen] = useState(false);
  const [dlSystemTab, setDlSystemTab] = useState<'full' | 'filtered'>('full');
  const [packIncludeText, setPackIncludeText] = useState(true);
  const [packIncludeAudio, setPackIncludeAudio] = useState(true);
  const [packReciterIdx, setPackReciterIdx] = useState(0);
  const [audioFilterPreset, setAudioFilterPreset] = useState<AudioFilterPreset>('juz_amma');
  const [filterStartSurah, setFilterStartSurah] = useState(1);
  const [filterEndSurah, setFilterEndSurah] = useState(114);
  const [dlJob, setDlJob] = useState<OfflineDownloadJob>(() => {
    try {
      const raw = localStorage.getItem(DL_JOB_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as OfflineDownloadJob;
        return {
          ...EMPTY_DL_JOB,
          ...parsed,
          // Always restore interrupted runs as paused so user can cleanly tap Resume
          status: parsed.status === 'running' ? 'paused' : parsed.status,
        };
      }
    } catch {
      // ignore
    }
    return EMPTY_DL_JOB;
  });
  const bulkDownloading = dlJob.status === 'running';
  const bulkAbortRef = useRef<AbortController | null>(null);
  const pauseRequestedRef = useRef(false);
  const latestDlJobRef = useRef<OfflineDownloadJob>(dlJob);
  latestDlJobRef.current = dlJob;

  const [offlineTextCount, setOfflineTextCount] = useState(1);
  const [offlineAudioCount, setOfflineAudioCount] = useState(0);
  const [storageBytes, setStorageBytes] = useState<number | null>(null);
  const [clearArmed, setClearArmed] = useState(false);

  const persistDlJob = useCallback((job: OfflineDownloadJob) => {
    latestDlJobRef.current = job;
    setDlJob(job);
    try {
      if (job.status === 'idle') {
        localStorage.removeItem(DL_JOB_STORAGE_KEY);
      } else {
        localStorage.setItem(DL_JOB_STORAGE_KEY, JSON.stringify(job));
      }
    } catch {
      // ignore
    }
  }, []);

  const refreshOfflineStats = useCallback(
    async (targetReciter = packReciterIdx) => {
      try {
        const [textKeys, audioKeys, bytes] = await Promise.all([
          idbKeys('surah:v2:'),
          idbKeys('audio:0:'),
          getStorageUsageBytes(),
        ]);
        const reciterAudioKeys = audioKeys.filter((k) => k.endsWith(`:${targetReciter}`));
        setOfflineTextCount(Math.max(1, Math.min(114, textKeys.length)));
        setOfflineAudioCount(Math.min(114, reciterAudioKeys.length));
        setStorageBytes(bytes);
      } catch {
        // ignore
      }
    },
    [packReciterIdx]
  );

  useEffect(() => {
    refreshOfflineStats(packReciterIdx);
  }, [packReciterIdx, refreshOfflineStats]);

  const runBulkOfflineDownload = useCallback(
    async (opts: {
      mode: 'full' | 'filtered';
      includeText: boolean;
      includeAudio: boolean;
      reciterIndex: number;
      filterPreset?: AudioFilterPreset;
      rangeStart?: number;
      rangeEnd?: number;
      force?: boolean;
    }) => {
      if (latestDlJobRef.current.status === 'running') return;
      if (!opts.includeText && !opts.includeAudio) {
        toast(appLang === 'bn' ? 'কমপক্ষে একটি অপশন নির্বাচন করুন' : 'Select at least one option');
        return;
      }

      const preset: AudioFilterPreset =
        opts.mode === 'full' ? 'all' : opts.filterPreset || 'juz_amma';
      const rStart = Math.max(1, Math.min(114, opts.rangeStart ?? 1));
      const rEnd = Math.max(1, Math.min(114, opts.rangeEnd ?? 114));
      const subset = opts.includeAudio ? buildSurahSubset(preset, rStart, rEnd) : undefined;
      const textTotal = opts.includeText ? 114 : 0;
      const audioTotal = opts.includeAudio ? (subset ? subset.length : 114) : 0;
      const combinedTotal = Math.max(1, textTotal + audioTotal);

      pauseRequestedRef.current = false;
      const ac = new AbortController();
      bulkAbortRef.current = ac;

      const initialJob: OfflineDownloadJob = {
        status: 'running',
        mode: opts.mode,
        includeText: opts.includeText,
        includeAudio: opts.includeAudio,
        reciterIndex: opts.reciterIndex,
        filterPreset: preset,
        rangeStart: rStart,
        rangeEnd: rEnd,
        completed: latestDlJobRef.current.status === 'paused' ? latestDlJobRef.current.completed : 0,
        total: combinedTotal,
        label:
          appLang === 'bn'
            ? 'ডাউনলোড প্রস্তুত হচ্ছে…'
            : 'Preparing offline download…',
      };
      persistDlJob(initialJob);

      const updateCombinedProgress = (offset: number, p: OfflineBulkProgress) => {
        const nextJob: OfflineDownloadJob = {
          ...latestDlJobRef.current,
          status: 'running',
          completed: Math.min(combinedTotal, offset + p.completed),
          total: combinedTotal,
          label: p.label,
        };
        persistDlJob(nextJob);
      };

      try {
        if (opts.includeText) {
          await downloadAllQuranText(
            (p) => updateCombinedProgress(0, p),
            ac.signal,
            opts.force
          );
        }
        if (opts.includeAudio) {
          const res = await downloadAllSurahAudio(
            opts.reciterIndex,
            (p) => updateCombinedProgress(textTotal, p),
            ac.signal,
            opts.force,
            subset
          );
          if (res.failed > 0 && res.saved === 0) {
            persistDlJob({
              ...latestDlJobRef.current,
              status: 'paused',
            });
            toast(
              appLang === 'bn'
                ? 'ইন্টারনেট সংযোগ পরীক্ষা করে Resume চাপুন'
                : 'Check connection and tap Resume'
            );
            return;
          }
        }

        try {
          localStorage.setItem('zk_offline_prompt_seen', '1');
        } catch {
          // ignore
        }
        persistDlJob(EMPTY_DL_JOB);
        await refreshOfflineStats(opts.reciterIndex);
        setOfflinePromptOpen(false);
        toast(
          appLang === 'bn'
            ? 'অফলাইন ডাটা ১০০% সম্পন্ন ও সংরক্ষিত হয়েছে!'
            : 'Offline package 100% downloaded & saved!'
        );
      } catch (err: any) {
        if (pauseRequestedRef.current || err?.name === 'AbortError') {
          persistDlJob({
            ...latestDlJobRef.current,
            status: 'paused',
          });
          await refreshOfflineStats(opts.reciterIndex);
          toast(
            appLang === 'bn'
              ? 'ডাউনলোড বিরতিতে আছে—পরে Resume করলে এখান থেকেই শুরু হবে'
              : 'Download paused—tap Resume to continue from here'
          );
        } else {
          persistDlJob({
            ...latestDlJobRef.current,
            status: 'paused',
          });
          toast(
            appLang === 'bn'
              ? 'সংযোগ বিচ্ছিন্ন হয়েছে—ইন্টারনেট পেলে Resume করুন'
              : 'Connection interrupted—tap Resume anytime'
          );
        }
      } finally {
        bulkAbortRef.current = null;
      }
    },
    [appLang, persistDlJob, refreshOfflineStats, toast]
  );

  const pauseBulkDownload = useCallback(() => {
    pauseRequestedRef.current = true;
    bulkAbortRef.current?.abort();
  }, []);

  const resumeBulkDownload = useCallback(() => {
    const job = latestDlJobRef.current;
    if (job.status !== 'paused') return;
    runBulkOfflineDownload({
      mode: job.mode,
      includeText: job.includeText,
      includeAudio: job.includeAudio,
      reciterIndex: job.reciterIndex,
      filterPreset: job.filterPreset,
      rangeStart: job.rangeStart,
      rangeEnd: job.rangeEnd,
      force: false,
    });
  }, [runBulkOfflineDownload]);

  const clearDlJob = useCallback(() => {
    pauseRequestedRef.current = false;
    bulkAbortRef.current?.abort();
    persistDlJob(EMPTY_DL_JOB);
  }, [persistDlJob]);

  const dismissOfflinePrompt = useCallback(() => {
    setOfflinePromptOpen(false);
    try {
      localStorage.setItem('zk_offline_prompt_seen', '1');
    } catch {
      // ignore
    }
    if (latestDlJobRef.current.status === 'running') {
      toast(
        appLang === 'bn'
          ? 'ব্যাকগ্রাউন্ডে ডাউনলোড চলতে থাকবে…'
          : 'Download continues in the background…'
      );
    }
  }, [appLang, toast]);

  const dismissSplash = useCallback(() => {
    if (splashEndedRef.current) return;
    splashEndedRef.current = true;
    setSplashState('out');
    setAppEntered(true);
    window.setTimeout(() => {
      setSplashState('gone');
    }, 800);
    // If tour was previously completed/skipped but offline pack prompt was never seen, show it right after splash
    try {
      if (localStorage.getItem('zk_tour') && !localStorage.getItem('zk_offline_prompt_seen')) {
        window.setTimeout(() => setOfflinePromptOpen(true), 500);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const tmr = window.setTimeout(dismissSplash, 3400);
    return () => window.clearTimeout(tmr);
  }, [dismissSplash]);

  // ---------------------------------------------------------------------------
  // COMPLETE QURAN (All 114 Surahs) — Persists last Surah & Reciter for Offline
  // ---------------------------------------------------------------------------
  const [surah, setSurah] = useState<SurahMeta>(() => {
    try {
      const savedNum = Number(localStorage.getItem('zk_last_surah'));
      if (Number.isFinite(savedNum) && savedNum >= 1 && savedNum <= 114) {
        return ALL_SURAHS[savedNum - 1] || DEFAULT_SURAH;
      }
    } catch {
      // ignore
    }
    return DEFAULT_SURAH;
  });
  const [ayahs, setAyahs] = useState<AyahItem[]>(FATIHAH_AYAHS);
  const [ayahsLoading, setAyahsLoading] = useState(false);
  const [surahSheetOpen, setSurahSheetOpen] = useState(false);
  const [surahQuery, setSurahQuery] = useState('');
  const [cachedAudioSurahs, setCachedAudioSurahs] = useState<Set<number>>(() => new Set());

  // ---------------------------------------------------------------------------
  // LISTEN TAB (Real audio + real offline IndexedDB + real Web Audio animation)
  // ---------------------------------------------------------------------------
  const listenAudioRef = useRef<HTMLAudioElement | null>(null);
  const englishAudioRef = useRef<HTMLAudioElement | null>(null);
  const banglaAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const eqBarsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const waveBarsRef = useRef<(HTMLElement | null)[]>([]);
  const auraRef = useRef<HTMLDivElement | null>(null);
  const animRafRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [pos, setPos] = useState(0);
  const [duration, setDuration] = useState(50);
  const [speedIdx, setSpeedIdx] = useState(1); // 1x
  const [sleepLeft, setSleepLeft] = useState(0);
  const [sleepSheetOpen, setSleepSheetOpen] = useState(false);
  const [customSleepHours, setCustomSleepHours] = useState('0');
  const [customSleepMins, setCustomSleepMins] = useState('15');
  const [reciterIdx, setReciterIdx] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('zk_last_reciter'));
      if (Number.isFinite(saved) && saved >= 0 && saved < RECITERS.length) return saved;
    } catch {
      // ignore
    }
    return 0;
  });
  const [listenLang, setListenLang] = useState<ListenLang>(0);
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [offlineBusy, setOfflineBusy] = useState(false);
  const activeObjectUrlRef = useRef<string | null>(null);
  const pendingSeekRef = useRef<number | null>(null);
  const banglaPlayingRef = useRef(false);
  const banglaAyahIdxRef = useRef(0);
  const banglaTimerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('zk_last_surah', String(surah.number));
    } catch {
      // ignore
    }
  }, [surah.number]);

  useEffect(() => {
    try {
      localStorage.setItem('zk_last_reciter', String(reciterIdx));
    } catch {
      // ignore
    }
  }, [reciterIdx]);

  useEffect(() => {
    const onSwOfflineReady = () => {
      toast(
        appLang === 'bn'
          ? 'অ্যাপটি সম্পূর্ণ অফলাইনে চালানোর জন্য প্রস্তুত হয়েছে!'
          : 'ZIKRIFY is synced and ready to open offline!'
      );
    };
    window.addEventListener('zk-offline-ready', onSwOfflineReady);
    return () => window.removeEventListener('zk-offline-ready', onSwOfflineReady);
  }, [appLang, toast]);

  const offlineKey = useMemo(
    () => `audio:${listenLang}:${surah.number}:${listenLang === 0 ? reciterIdx : 0}`,
    [listenLang, surah.number, reciterIdx]
  );

  useEffect(() => {
    let cancelled = false;
    idbGet<Blob>(offlineKey)
      .then((blob) => {
        if (!cancelled) setOfflineSaved(Boolean(blob));
      })
      .catch(() => {
        if (!cancelled) setOfflineSaved(false);
      });
    return () => {
      cancelled = true;
    };
  }, [offlineKey]);

  useEffect(() => {
    let cancelled = false;
    idbKeys('audio:0:')
      .then((keys) => {
        if (cancelled) return;
        const set = new Set<number>();
        const suffix = `:${reciterIdx}`;
        keys.forEach((k) => {
          if (k.endsWith(suffix)) {
            const parts = k.split(':');
            const n = Number(parts[2]);
            if (Number.isFinite(n)) set.add(n);
          }
        });
        setCachedAudioSurahs(set);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [reciterIdx, offlineSaved, offlineAudioCount, surahSheetOpen]);

  const stopBanglaPlayback = useCallback(() => {
    banglaPlayingRef.current = false;
    if (banglaTimerRef.current) {
      window.clearInterval(banglaTimerRef.current);
      banglaTimerRef.current = null;
    }
    if (banglaAudioRef.current) {
      banglaAudioRef.current.pause();
      banglaAudioRef.current.onended = null;
      banglaAudioRef.current.onerror = null;
    }
    try {
      window.speechSynthesis?.cancel();
    } catch {
      // ignore
    }
  }, []);

  const ensureListenAnalyser = useCallback((el: HTMLAudioElement) => {
    if (sourceNodeRef.current) return;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      const ctx = audioCtxRef.current || new AC();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaElementSource(el);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.82;
      src.connect(analyser);
      analyser.connect(ctx.destination);
      sourceNodeRef.current = src;
      analyserRef.current = analyser;
    } catch {
      // Fallback to harmonic animation if Web Audio cannot attach
    }
  }, []);

  const speakBanglaFromAyah = useCallback(
    (startIdx: number, rate: number, ayahList: AyahItem[] = ayahs) => {
      stopBanglaPlayback();
      if (!ayahList.length) return;
      banglaPlayingRef.current = true;
      banglaAyahIdxRef.current = startIdx;
      setIsPlaying(true);

      const estPerAyah = 6;
      const totalDur = ayahList.length * estPerAyah;
      setDuration(totalDur);
      setPos(startIdx * estPerAyah);

      const useNativeBn = hasNativeVoice('bn');

      const speakNext = (idx: number) => {
        if (!banglaPlayingRef.current) return;
        if (idx >= ayahList.length) {
          banglaPlayingRef.current = false;
          setIsPlaying(false);
          setPos(0);
          return;
        }
        banglaAyahIdxRef.current = idx;
        setPos(idx * estPerAyah);

        const text = ayahList[idx]?.bn || '';
        if (!text) {
          speakNext(idx + 1);
          return;
        }

        if (banglaTimerRef.current) window.clearInterval(banglaTimerRef.current);
        banglaTimerRef.current = window.setInterval(() => {
          if (!banglaPlayingRef.current) return;
          setPos((prev) => Math.min((idx + 0.92) * estPerAyah, prev + 0.25 * rate));
        }, 250);

        if (useNativeBn) {
          try {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'bn-BD';
            u.rate = rate;
            let advanced = false;
            const next = () => {
              if (advanced || !banglaPlayingRef.current) return;
              advanced = true;
              speakNext(idx + 1);
            };
            u.onend = next;
            u.onerror = next;
            window.speechSynthesis.speak(u);
            return;
          } catch {
            // fall through to audio TTS
          }
        }

        const bnAudio = banglaAudioRef.current;
        if (bnAudio) {
          bnAudio.src = getBanglaTtsUrl(text);
          bnAudio.playbackRate = rate;
          bnAudio.onended = () => {
            if (banglaPlayingRef.current) speakNext(idx + 1);
          };
          bnAudio.onerror = () => {
            if (banglaPlayingRef.current) {
              toast('Bengali audio requires internet on this device');
              banglaPlayingRef.current = false;
              setIsPlaying(false);
            }
          };
          bnAudio.load();
          bnAudio.play().catch(() => {
            banglaPlayingRef.current = false;
            setIsPlaying(false);
          });
        }
      };

      speakNext(startIdx);
    },
    [ayahs, stopBanglaPlayback, toast]
  );

  const loadAndPlayListen = useCallback(
    async (
      targetReciter: number,
      targetSurah: number,
      targetLang: ListenLang,
      autoPlay: boolean,
      overrideAyahs?: AyahItem[]
    ) => {
      const arEl = listenAudioRef.current;
      const enEl = englishAudioRef.current;
      stopBanglaPlayback();
      arEl?.pause();
      enEl?.pause();
      pendingSeekRef.current = null;

      if (targetLang === 1) {
        const list = overrideAyahs || ayahs;
        setDuration(list.length * 6);
        setPos(0);
        if (autoPlay) {
          speakBanglaFromAyah(0, SPEED_OPTIONS[speedIdx], list);
        } else {
          setIsPlaying(false);
        }
        return;
      }

      if (targetLang === 2) {
        if (!enEl) return;
        setIsLoadingAudio(true);
        try {
          enEl.src = `${ENGLISH_SURAH_BASE}${targetSurah}.mp3`;
          enEl.playbackRate = SPEED_OPTIONS[speedIdx];
          enEl.load();
          if (autoPlay) {
            await enEl.play();
            setIsPlaying(true);
          } else {
            setIsPlaying(false);
          }
        } catch {
          setIsPlaying(false);
          toast('Tap Play again or check your internet connection.');
        } finally {
          setIsLoadingAudio(false);
        }
        return;
      }

      if (!arEl) return;
      setIsLoadingAudio(true);

      try {
        if (activeObjectUrlRef.current) {
          URL.revokeObjectURL(activeObjectUrlRef.current);
          activeObjectUrlRef.current = null;
        }

        const key = `audio:${targetLang}:${targetSurah}:${targetReciter}`;
        let cachedBlob: Blob | undefined;
        try {
          cachedBlob = await idbGet<Blob>(key);
        } catch {
          cachedBlob = undefined;
        }

        arEl.crossOrigin = 'anonymous';
        if (cachedBlob) {
          const objUrl = URL.createObjectURL(cachedBlob);
          activeObjectUrlRef.current = objUrl;
          arEl.src = objUrl;
        } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
          arEl.removeAttribute('src');
          setIsPlaying(false);
          if (autoPlay) {
            toast(
              appLang === 'bn'
                ? 'এই সূরার অডিও অফলাইনে ডাউনলোড করা নেই — সেভ করা সূরা বেছে নিন।'
                : 'This Surah audio is not downloaded offline yet.'
            );
          }
          return;
        } else {
          arEl.src = getSurahAudioUrl(targetReciter, targetSurah);
        }

        arEl.playbackRate = SPEED_OPTIONS[speedIdx];
        arEl.load();

        if (autoPlay) {
          ensureListenAnalyser(arEl);
          if (audioCtxRef.current?.state === 'suspended') {
            audioCtxRef.current.resume().catch(() => {});
          }
          await arEl.play();
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }
      } catch {
        setIsPlaying(false);
        if (autoPlay) {
          toast(
            typeof navigator !== 'undefined' && !navigator.onLine
              ? appLang === 'bn'
                ? 'অফলাইন মোড: এই সূরাটি ডাউনলোড করা নেই।'
                : 'Offline mode: this Surah is not saved yet.'
              : 'Tap Play again or check your internet connection.'
          );
        }
      } finally {
        setIsLoadingAudio(false);
      }
    },
    [appLang, ayahs, ensureListenAnalyser, speakBanglaFromAyah, speedIdx, stopBanglaPlayback, toast]
  );

  // Select any of the 114 Surahs (Always syncs downloaded offline audio even if text wasn't cached)
  const selectSurah = useCallback(
    async (s: SurahMeta, shouldSyncListenAudio = true) => {
      setSurah(s);
      setSurahSheetOpen(false);
      setAyahsLoading(true);
      setActiveAyahIdx(null);
      setActiveAyahLang(null);
      let loadedList: AyahItem[] | undefined;
      try {
        loadedList = await fetchSurahAyahs(s.number);
        setAyahs(loadedList);
      } catch {
        if (tab === 1 || tab === 2 || listenLang === 1) {
          toast(
            appLang === 'bn'
              ? 'এই সূরার টেক্সট অফলাইনে সেভ করা নেই। সেটিংস থেকে টেক্সট ডাউনলোড করুন।'
              : 'Surah text not cached offline. Download text in Settings.'
          );
        }
      } finally {
        setAyahsLoading(false);
      }
      if (shouldSyncListenAudio) {
        loadAndPlayListen(reciterIdx, s.number, listenLang, isPlaying, loadedList);
      }
    },
    [appLang, isPlaying, listenLang, loadAndPlayListen, reciterIdx, tab, toast]
  );

  // Initial audio & persisted Surah text load (works 100% offline from IndexedDB)
  useEffect(() => {
    if (surah.number !== 1) {
      fetchSurahAyahs(surah.number)
        .then((list) => setAyahs(list))
        .catch(() => {});
    }
    loadAndPlayListen(reciterIdx, surah.number, listenLang, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen <audio> event bindings for both Arabic & English elements
  useEffect(() => {
    const els = [listenAudioRef.current, englishAudioRef.current].filter(
      Boolean
    ) as HTMLAudioElement[];
    if (!els.length) return;

    const cleanups = els.map((el, idx) => {
      const expectedLang: ListenLang = idx === 0 ? 0 : 2;
      const onLoaded = () => {
        if (listenLang !== expectedLang) return;
        if (Number.isFinite(el.duration) && el.duration > 0) {
          setDuration(el.duration);
        }
        if (pendingSeekRef.current !== null && Number.isFinite(el.duration)) {
          el.currentTime = Math.max(0, Math.min(el.duration, pendingSeekRef.current));
          pendingSeekRef.current = null;
        }
        el.playbackRate = SPEED_OPTIONS[speedIdx];
      };
      const onTime = () => {
        if (listenLang !== expectedLang) return;
        setPos(el.currentTime);
        if (Number.isFinite(el.duration) && el.duration > 0) {
          setDuration(el.duration);
        }
      };
      const onPlay = () => {
        if (listenLang === expectedLang) setIsPlaying(true);
      };
      const onPause = () => {
        if (listenLang === expectedLang) setIsPlaying(false);
      };
      const onEnded = () => {
        if (listenLang === expectedLang) {
          setIsPlaying(false);
          setPos(0);
        }
      };
      const onErr = () => {
        if (listenLang === expectedLang) {
          setIsLoadingAudio(false);
          setIsPlaying(false);
        }
      };

      el.addEventListener('loadedmetadata', onLoaded);
      el.addEventListener('timeupdate', onTime);
      el.addEventListener('play', onPlay);
      el.addEventListener('pause', onPause);
      el.addEventListener('ended', onEnded);
      el.addEventListener('error', onErr);
      return () => {
        el.removeEventListener('loadedmetadata', onLoaded);
        el.removeEventListener('timeupdate', onTime);
        el.removeEventListener('play', onPlay);
        el.removeEventListener('pause', onPause);
        el.removeEventListener('ended', onEnded);
        el.removeEventListener('error', onErr);
      };
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [listenLang, speedIdx]);

  // MediaSession lock screen controls
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `Surah ${surah.en}`,
        artist: RECITERS[reciterIdx]?.name || 'ZIKRIFY',
        album: 'ZIKRIFY Quran',
      });
    } catch {
      // ignore
    }
  }, [reciterIdx, surah.en]);

  // Sleep timer real countdown
  useEffect(() => {
    if (sleepLeft <= 0) return;
    const id = window.setInterval(() => {
      setSleepLeft((prev) => {
        if (prev <= 1) {
          listenAudioRef.current?.pause();
          englishAudioRef.current?.pause();
          stopBanglaPlayback();
          setIsPlaying(false);
          toast(
            appLang === 'bn'
              ? 'স্লিপ টাইমার শেষ হয়েছে। তিলাওয়াত বন্ধ করা হয়েছে।'
              : 'Sleep timer finished. Playback stopped.'
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [sleepLeft, stopBanglaPlayback, toast, appLang]);

  // Premium Audio Player Animation Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
      eqBarsRef.current.forEach((bar) => {
        if (bar) bar.style.height = '4px';
      });
      waveBarsRef.current.forEach((bar, i) => {
        if (bar) bar.style.height = `${BASE_WAVE_HEIGHTS[i]}px`;
      });
      if (auraRef.current) {
        auraRef.current.style.transform = 'scale(0.88)';
      }
      return;
    }

    const freqBuf = analyserRef.current
      ? new Uint8Array(analyserRef.current.frequencyBinCount)
      : null;

    let phase = 0;
    const renderFrame = () => {
      phase += 0.08 * SPEED_OPTIONS[speedIdx];
      let hasLiveAudio = false;
      if (analyserRef.current && freqBuf && listenLang === 0) {
        analyserRef.current.getByteFrequencyData(freqBuf);
        for (let i = 0; i < freqBuf.length; i++) {
          if (freqBuf[i] > 2) {
            hasLiveAudio = true;
            break;
          }
        }
      }

      let avgEnergy = 0;
      const half = EQ_BAR_COUNT / 2;

      for (let i = 0; i < EQ_BAR_COUNT; i++) {
        const distFromCenter = Math.abs(i - (half - 0.5)) / half;
        let level = 0;
        if (hasLiveAudio && freqBuf) {
          const bin = Math.min(freqBuf.length - 1, Math.floor(distFromCenter * 14));
          level = freqBuf[bin] / 255;
        } else {
          const w1 = Math.sin(phase * 2.1 + i * 0.55) * 0.5 + 0.5;
          const w2 = Math.cos(phase * 3.4 - i * 0.35) * 0.5 + 0.5;
          level = (0.28 + 0.58 * w1 * w2) * (1 - distFromCenter * 0.45);
        }
        avgEnergy += level;
        const barEl = eqBarsRef.current[i];
        if (barEl) {
          const px = Math.round(4 + level * 24);
          barEl.style.height = `${px}px`;
        }
      }

      avgEnergy /= EQ_BAR_COUNT;
      if (auraRef.current) {
        const scale = 0.94 + avgEnergy * 0.42;
        auraRef.current.style.transform = `scale(${scale.toFixed(3)})`;
      }

      const activeBars = Math.round((pos / Math.max(1, duration)) * 40);
      for (let i = 0; i < 40; i++) {
        const bar = waveBarsRef.current[i];
        if (!bar) continue;
        const base = BASE_WAVE_HEIGHTS[i];
        const nearHead = Math.abs(i - activeBars) <= 3;
        const pulse =
          nearHead || i < activeBars
            ? Math.sin(phase * 2.6 + i * 0.6) * (3.5 + avgEnergy * 7)
            : 0;
        bar.style.height = `${Math.max(6, Math.min(44, Math.round(base + pulse)))}px`;
      }

      animRafRef.current = requestAnimationFrame(renderFrame);
    };

    animRafRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
    };
  }, [duration, isPlaying, listenLang, pos, speedIdx]);

  const toggleListenPlay = useCallback(async () => {
    if (listenLang === 1) {
      if (isPlaying) {
        stopBanglaPlayback();
        setIsPlaying(false);
      } else {
        speakBanglaFromAyah(banglaAyahIdxRef.current || 0, SPEED_OPTIONS[speedIdx]);
      }
      return;
    }

    const el = listenLang === 2 ? englishAudioRef.current : listenAudioRef.current;
    if (!el) return;
    if (!el.src) {
      await loadAndPlayListen(reciterIdx, surah.number, listenLang, true);
      return;
    }
    if (el.paused) {
      if (listenLang === 0) {
        ensureListenAnalyser(el);
        if (audioCtxRef.current?.state === 'suspended') {
          audioCtxRef.current.resume().catch(() => {});
        }
      }
      el.play().catch(() => {
        loadAndPlayListen(reciterIdx, surah.number, listenLang, true);
      });
    } else {
      el.pause();
    }
  }, [
    ensureListenAnalyser,
    isPlaying,
    listenLang,
    loadAndPlayListen,
    reciterIdx,
    speakBanglaFromAyah,
    speedIdx,
    stopBanglaPlayback,
    surah.number,
  ]);

  const seekListen = useCallback(
    (newPos: number) => {
      const clamped = Math.max(0, Math.min(duration || 1, newPos));
      setPos(clamped);
      if (listenLang === 1) {
        const ayahIdx = Math.min(
          ayahs.length - 1,
          Math.max(0, Math.floor((clamped / Math.max(1, duration)) * ayahs.length))
        );
        if (isPlaying) {
          speakBanglaFromAyah(ayahIdx, SPEED_OPTIONS[speedIdx]);
        } else {
          banglaAyahIdxRef.current = ayahIdx;
        }
        return;
      }
      const activeEl = listenLang === 2 ? englishAudioRef.current : listenAudioRef.current;
      if (activeEl) {
        if (Number.isFinite(activeEl.duration) && activeEl.duration > 0) {
          activeEl.currentTime = Math.max(0, Math.min(activeEl.duration, clamped));
        } else {
          pendingSeekRef.current = clamped;
        }
      }
    },
    [ayahs.length, duration, isPlaying, listenLang, speakBanglaFromAyah, speedIdx]
  );

  const handleToggleOffline = useCallback(async () => {
    if (offlineBusy) return;
    if (listenLang === 1) {
      setOfflineBusy(true);
      try {
        await fetchSurahAyahs(surah.number);
        setOfflineSaved(true);
        toast('Surah text saved for offline reading');
      } catch {
        toast('Could not save offline text');
      } finally {
        setOfflineBusy(false);
      }
      return;
    }
    if (listenLang === 2) {
      toast('Switch to Arabic to save Qari audio offline');
      return;
    }
    if (offlineSaved) {
      await idbDelete(offlineKey).catch(() => {});
      setOfflineSaved(false);
      toast('Offline copy removed');
      return;
    }

    setOfflineBusy(true);
    toast('Downloading audio for offline listening…');
    try {
      const url = getSurahAudioUrl(reciterIdx, surah.number);
      const res = await fetch(url);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      await idbPut(offlineKey, blob);
      setOfflineSaved(true);
      toast('Saved for offline listening');
    } catch {
      toast('Could not download this audio for offline use');
    } finally {
      setOfflineBusy(false);
    }
  }, [listenLang, offlineBusy, offlineKey, offlineSaved, reciterIdx, surah.number, toast]);

  // ---------------------------------------------------------------------------
  // READ TAB (Real reciter ayah-by-ayah playback + Bangla audio + English + Tajweed Teaching)
  // ---------------------------------------------------------------------------
  const readAudioRef = useRef<HTMLAudioElement | null>(null);
  const [activeAyahIdx, setActiveAyahIdx] = useState<number | null>(null);
  const [activeAyahLang, setActiveAyahLang] = useState<ListenLang | null>(null);
  const [similarOpen, setSimilarOpen] = useState(false);

  const [readViewMode, setReadViewMode] = useState<ReadViewMode>(() => {
    try {
      const saved = localStorage.getItem('zk_read_mode');
      if (saved === 'mushaf' || saved === 'ayah_ar' || saved === 'meaning') return saved;
    } catch {
      // ignore
    }
    return 'meaning';
  });
  const [arabicFontSize, setArabicFontSize] = useState<number>(() => {
    try {
      const n = Number(localStorage.getItem('zk_ar_size'));
      if (Number.isFinite(n) && n >= 20 && n <= 44) return n;
    } catch {
      // ignore
    }
    return 27;
  });
  const [tajweedEnabled, setTajweedEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('zk_tajweed');
      return saved === null ? true : saved === '1';
    } catch {
      return true;
    }
  });
  const [showTajweedMarks, setShowTajweedMarks] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('zk_tj_marks');
      return saved === null ? true : saved === '1';
    } catch {
      return true;
    }
  });
  const [focusedRule, setFocusedRule] = useState<TajweedRuleId | null>(null);
  const [focusedMatchIdx, setFocusedMatchIdx] = useState<number>(0);
  const [teacherTool, setTeacherTool] = useState<TeacherToolMode>('inspect');
  const [spotlightWordKey, setSpotlightWordKey] = useState<string | null>(null);
  const [teacherMarks, setTeacherMarks] = useState<Record<string, TeacherMarkKind>>({});

  const [teachLang, setTeachLang] = useState<TeachLang>(() => {
    try {
      const saved = localStorage.getItem('zk_teach_lang');
      if (saved === 'en' || saved === 'bn' || saved === 'ar' || saved === 'ur') return saved;
    } catch {
      // ignore
    }
    return appLang === 'bn' ? 'bn' : 'en';
  });
  const [showEnSub, setShowEnSub] = useState<boolean>(true);
  const [tajweedGuideOpen, setTajweedGuideOpen] = useState<boolean>(false);
  const [inspectedWord, setInspectedWord] = useState<{
    ayahIdx: number;
    ayahNum: number;
    word: TajweedWord;
  } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`zk_tmarks:${surah.number}`);
      setTeacherMarks(raw ? (JSON.parse(raw) as Record<string, TeacherMarkKind>) : {});
    } catch {
      setTeacherMarks({});
    }
    setSpotlightWordKey(null);
    setFocusedMatchIdx(0);
  }, [surah.number]);

  const persistTeacherMarks = useCallback(
    (next: Record<string, TeacherMarkKind>) => {
      setTeacherMarks(next);
      try {
        if (Object.keys(next).length === 0) {
          localStorage.removeItem(`zk_tmarks:${surah.number}`);
        } else {
          localStorage.setItem(`zk_tmarks:${surah.number}`, JSON.stringify(next));
        }
      } catch {
        // ignore
      }
    },
    [surah.number]
  );

  const changeReadViewMode = useCallback((mode: ReadViewMode) => {
    setReadViewMode(mode);
    try {
      localStorage.setItem('zk_read_mode', mode);
    } catch {
      // ignore
    }
  }, []);

  const changeArabicFontSize = useCallback((delta: number) => {
    setArabicFontSize((prev) => {
      const next = Math.max(20, Math.min(44, prev + delta));
      try {
        localStorage.setItem('zk_ar_size', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const parsedAyahWords = useMemo(
    () => ayahs.map((a) => parseAyahTajweed(a.ar)),
    [ayahs]
  );
  const parsedBismillah = useMemo(() => parseAyahTajweed(BISMILLAH_AR), []);

  const surahRuleCounts = useMemo(() => {
    const counts: Partial<Record<TajweedRuleId, number>> = {};
    parsedAyahWords.forEach((words) => {
      words.forEach((w) => {
        w.rulesPresent.forEach((rule) => {
          counts[rule] = (counts[rule] || 0) + 1;
        });
      });
    });
    return counts;
  }, [parsedAyahWords]);

  const focusedMatches = useMemo(() => {
    if (!focusedRule) return [] as Array<{ wkey: string; ayahIdx: number; ayahNum: number; word: TajweedWord }>;
    const list: Array<{ wkey: string; ayahIdx: number; ayahNum: number; word: TajweedWord }> = [];
    parsedAyahWords.forEach((words, aIdx) => {
      words.forEach((w, wi) => {
        if (w.rulesPresent.includes(focusedRule)) {
          list.push({
            wkey: `${aIdx}-${wi}`,
            ayahIdx: aIdx,
            ayahNum: aIdx + 1,
            word: w,
          });
        }
      });
    });
    return list;
  }, [focusedRule, parsedAyahWords]);

  const jumpToFocusedMatch = useCallback(
    (nextIdx: number) => {
      if (!focusedMatches.length) return;
      const wrapped = ((nextIdx % focusedMatches.length) + focusedMatches.length) % focusedMatches.length;
      setFocusedMatchIdx(wrapped);
      const item = focusedMatches[wrapped];
      setSpotlightWordKey(item.wkey);
      window.setTimeout(() => {
        const el = document.querySelector(`[data-wkey="${item.wkey}"]`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 20);
    },
    [focusedMatches]
  );

  const handleReadWordClick = useCallback(
    (wkey: string, ayahIdx: number, ayahNum: number, word: TajweedWord) => {
      setSpotlightWordKey(wkey);
      if (teacherTool === 'inspect') {
        setInspectedWord({ ayahIdx, ayahNum, word });
        return;
      }
      if (teacherTool === 'erase') {
        if (teacherMarks[wkey]) {
          const next = { ...teacherMarks };
          delete next[wkey];
          persistTeacherMarks(next);
        }
        return;
      }
      const next = { ...teacherMarks };
      if (next[wkey] === teacherTool) {
        delete next[wkey];
      } else {
        next[wkey] = teacherTool;
      }
      persistTeacherMarks(next);
    },
    [persistTeacherMarks, teacherMarks, teacherTool]
  );

  const renderTajweedWord = useCallback(
    (w: TajweedWord, wkey: string, ayahIdx: number, ayahNum: number) => {
      const tmark = teacherMarks[wkey];
      const isFocusedMatch = Boolean(focusedRule && w.rulesPresent.includes(focusedRule));
      const isDimmed = Boolean(focusedRule && tajweedEnabled && !isFocusedMatch && !tmark);
      const isSpotlight = spotlightWordKey === wkey;
      const focusCol = focusedRule
        ? theme === 'dark'
          ? TAJWEED_RULES[focusedRule].colorDark
          : TAJWEED_RULES[focusedRule].colorLight
        : undefined;
      const focusBg = focusedRule
        ? theme === 'dark'
          ? TAJWEED_RULES[focusedRule].bgDark
          : TAJWEED_RULES[focusedRule].bgLight
        : undefined;

      return (
        <span
          key={wkey}
          data-wkey={wkey}
          className={`tj-word${tmark ? ` tmark-${tmark}` : ''}${
            isFocusedMatch && tajweedEnabled ? ' focused-match' : ''
          }${isDimmed ? ' dimmed' : ''}${isSpotlight ? ' spotlight' : ''}`}
          style={
            isFocusedMatch && tajweedEnabled && !tmark
              ? { background: focusBg, color: focusCol }
              : undefined
          }
          onClick={() => handleReadWordClick(wkey, ayahIdx, ayahNum, w)}
        >
          {tmark && <span className={`tj-w-badge ${tmark}`}>{MARK_SYMBOL[tmark]}</span>}
          {w.clusters.map((cl, ci) => {
            const matchesFocus = !focusedRule || cl.rule === focusedRule;
            const r = tajweedEnabled && cl.rule && matchesFocus ? TAJWEED_RULES[cl.rule] : null;
            const col = r ? (theme === 'dark' ? r.colorDark : r.colorLight) : undefined;
            const shouldMark = Boolean(r && (showTajweedMarks || focusedRule === cl.rule));
            const markCls = shouldMark && cl.rule ? `tj-cl-mark style-${RULE_UNDERLINE_STYLE[cl.rule]}` : '';
            return (
              <span
                key={ci}
                className={markCls || undefined}
                style={col ? { color: col, textDecorationColor: col } : undefined}
              >
                {cl.raw}
              </span>
            );
          })}
        </span>
      );
    },
    [
      focusedRule,
      handleReadWordClick,
      showTajweedMarks,
      spotlightWordKey,
      tajweedEnabled,
      teacherMarks,
      theme,
    ]
  );

  const teacherMarkCounts = useMemo(() => {
    const res: Record<TeacherMarkKind, number> = { mistake: 0, focus: 0, done: 0, waqf: 0 };
    Object.values(teacherMarks).forEach((m) => {
      res[m] = (res[m] || 0) + 1;
    });
    return res;
  }, [teacherMarks]);

  const totalTeacherMarks =
    teacherMarkCounts.mistake +
    teacherMarkCounts.focus +
    teacherMarkCounts.done +
    teacherMarkCounts.waqf;

  const updateTeachLang = useCallback((lng: TeachLang) => {
    setTeachLang(lng);
    try {
      localStorage.setItem('zk_teach_lang', lng);
    } catch {
      // ignore
    }
  }, []);

  const playAyahSnippet = useCallback(
    (idx: number, lang: ListenLang) => {
      const el = readAudioRef.current;
      if (activeAyahIdx === idx && activeAyahLang === lang) {
        el?.pause();
        try {
          window.speechSynthesis?.cancel();
        } catch {
          // ignore
        }
        setActiveAyahIdx(null);
        setActiveAyahLang(null);
        return;
      }

      try {
        window.speechSynthesis?.cancel();
      } catch {
        // ignore
      }
      if (el) {
        el.pause();
        el.onended = null;
        el.onerror = null;
      }

      setActiveAyahIdx(idx);
      setActiveAyahLang(lang);

      if (lang === 0) {
        if (!el) return;
        el.src = getAyahAudioUrl(reciterIdx, surah.number, idx + 1);
        el.onended = () => {
          setActiveAyahIdx(null);
          setActiveAyahLang(null);
        };
        el.onerror = () => {
          toast('Could not play ayah audio');
          setActiveAyahIdx(null);
          setActiveAyahLang(null);
        };
        el.load();
        el.play().catch(() => toast('Tap again to play audio'));
        return;
      }

      if (lang === 2 && el) {
        el.src = getEnglishAyahAudioUrl(surah.number, idx + 1);
        el.onended = () => {
          setActiveAyahIdx(null);
          setActiveAyahLang(null);
        };
        el.onerror = () => {
          try {
            const u = new SpeechSynthesisUtterance(ayahs[idx]?.en || '');
            u.lang = 'en-US';
            u.rate = 0.9;
            u.onend = () => {
              setActiveAyahIdx(null);
              setActiveAyahLang(null);
            };
            window.speechSynthesis.speak(u);
          } catch {
            setActiveAyahIdx(null);
            setActiveAyahLang(null);
          }
        };
        el.load();
        el.play().catch(() => {
          setActiveAyahIdx(null);
          setActiveAyahLang(null);
        });
        return;
      }

      // Bangla (lang === 1): native Bengali voice if installed, else translate_tts audio
      const bnText = ayahs[idx]?.bn || '';
      if (hasNativeVoice('bn')) {
        try {
          const u = new SpeechSynthesisUtterance(bnText);
          u.lang = 'bn-BD';
          u.rate = 0.9;
          u.onend = () => {
            setActiveAyahIdx(null);
            setActiveAyahLang(null);
          };
          u.onerror = () => {
            setActiveAyahIdx(null);
            setActiveAyahLang(null);
          };
          window.speechSynthesis.speak(u);
          return;
        } catch {
          // fallback below
        }
      }

      if (el && bnText) {
        el.src = getBanglaTtsUrl(bnText);
        el.onended = () => {
          setActiveAyahIdx(null);
          setActiveAyahLang(null);
        };
        el.onerror = () => {
          toast('Bengali voice unavailable offline on this device');
          setActiveAyahIdx(null);
          setActiveAyahLang(null);
        };
        el.load();
        el.play().catch(() => {
          setActiveAyahIdx(null);
          setActiveAyahLang(null);
        });
      }
    },
    [activeAyahIdx, activeAyahLang, ayahs, reciterIdx, surah.number, toast]
  );

  // ---------------------------------------------------------------------------
  // HIFZ MODE (Proper RTL word order + Full Quran pages + Real Qari + Voice check)
  // ---------------------------------------------------------------------------
  const [hifzPage, setHifzPage] = useState(0);
  const hifzTotalPages = Math.max(1, Math.ceil(ayahs.length / HIFZ_AYAHS_PER_PAGE));

  const hifzPageAyahs = useMemo(() => {
    const start = hifzPage * HIFZ_AYAHS_PER_PAGE;
    return ayahs.slice(start, start + HIFZ_AYAHS_PER_PAGE).map((a, offset) => ({
      ayahIndex: start + offset,
      tokens: tokenizeAyahForHifz(a.ar),
    }));
  }, [ayahs, hifzPage]);

  const hifzWords: HifzWordEntry[] = useMemo(
    () =>
      hifzPageAyahs.flatMap((group) =>
        group.tokens.map((word) => ({ word, ayahIndex: group.ayahIndex }))
      ),
    [hifzPageAyahs]
  );

  const [hifzStatusList, setHifzStatusList] = useState<WordStatus[]>([]);
  const [hifzIdx, setHifzIdx] = useState(0);
  const [hifzMistakes, setHifzMistakes] = useState(0);
  const [hifzActive, setHifzActive] = useState(false);
  const [hifzHideNext, setHifzHideNext] = useState(false);
  const [hifzMessage, setHifzMessage] = useState(
    'Press Start to recite with your microphone, or tap each word in order.'
  );
  const recognitionRef = useRef<any>(null);
  const hifzIdxRef = useRef(0);
  const hifzStatusRef = useRef<WordStatus[]>([]);

  useEffect(() => {
    hifzIdxRef.current = hifzIdx;
  }, [hifzIdx]);

  useEffect(() => {
    hifzStatusRef.current = hifzStatusList;
  }, [hifzStatusList]);

  const stopHifz = useCallback(() => {
    setHifzActive(false);
    try {
      recognitionRef.current?.stop?.();
    } catch {
      // ignore
    }
    recognitionRef.current = null;
  }, []);

  const resetHifzProgress = useCallback(() => {
    stopHifz();
    setHifzStatusList([]);
    setHifzIdx(0);
    setHifzMistakes(0);
    hifzIdxRef.current = 0;
    hifzStatusRef.current = [];
    setHifzMessage('Press Start to recite with your microphone, or tap each word in order.');
  }, [stopHifz]);

  useEffect(() => {
    setHifzPage(0);
    resetHifzProgress();
  }, [surah.number, resetHifzProgress]);

  const playHifzAyahAudio = useCallback(
    (ayahIndex: number) => {
      const el = readAudioRef.current;
      if (!el) return;
      el.pause();
      el.src = getAyahAudioUrl(reciterIdx, surah.number, ayahIndex + 1);
      el.onended = null;
      el.onerror = () => {
        try {
          window.speechSynthesis?.cancel();
          const u = new SpeechSynthesisUtterance(ayahs[ayahIndex]?.ar || '');
          u.lang = 'ar-SA';
          u.rate = 0.8;
          window.speechSynthesis.speak(u);
        } catch {
          // ignore
        }
      };
      el.load();
      el.play().catch(() => {});
    },
    [ayahs, reciterIdx, surah.number]
  );

  const handleHifzSpoken = useCallback(
    (transcript: string, isFinal: boolean) => {
      const spokenTokens = normalizeArabic(transcript).split(' ').filter(Boolean);
      if (!spokenTokens.length) return;

      let cur = hifzIdxRef.current;
      const nextStatus = [...hifzStatusRef.current];
      let mistakesAdded = 0;

      for (const tok of spokenTokens) {
        if (cur >= hifzWords.length) break;
        const expected = normalizeArabic(hifzWords[cur].word);
        const lookahead =
          cur + 1 < hifzWords.length ? normalizeArabic(hifzWords[cur + 1].word) : '';

        if (
          tok === expected ||
          (expected.length >= 3 && (tok.includes(expected) || expected.includes(tok)))
        ) {
          nextStatus[cur] = 'ok';
          cur++;
        } else if (
          isFinal &&
          lookahead &&
          (tok === lookahead || (lookahead.length >= 3 && tok.includes(lookahead)))
        ) {
          nextStatus[cur] = 'bad';
          nextStatus[cur + 1] = 'ok';
          mistakesAdded++;
          cur += 2;
        }
      }

      if (cur !== hifzIdxRef.current || mistakesAdded > 0) {
        hifzIdxRef.current = cur;
        hifzStatusRef.current = nextStatus;
        setHifzIdx(cur);
        setHifzStatusList(nextStatus);
        if (mistakesAdded > 0) {
          setHifzMistakes((m) => m + mistakesAdded);
          setHifzMessage('Mistake on the red word. Tap it to hear the correct recitation.');
        }
        if (cur >= hifzWords.length) {
          stopHifz();
          setHifzMessage('MashaAllah! Page complete.');
        }
      }
    },
    [hifzWords, stopHifz]
  );

  const startHifz = useCallback(() => {
    if (hifzActive) {
      stopHifz();
      setHifzMessage('Paused.');
      return;
    }

    if (hifzIdx >= hifzWords.length) {
      setHifzStatusList([]);
      setHifzIdx(0);
      setHifzMistakes(0);
      hifzIdxRef.current = 0;
      hifzStatusRef.current = [];
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setHifzActive(true);
      setHifzMessage(
        'Voice recognition is not supported in this browser. Tap each word in order as you recite.'
      );
      return;
    }

    try {
      const rec = new SR();
      rec.lang = 'ar-SA';
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (ev: any) => {
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const text = ev.results[i][0]?.transcript || '';
          handleHifzSpoken(text, Boolean(ev.results[i].isFinal));
        }
      };
      rec.onerror = (ev: any) => {
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
          stopHifz();
          setHifzMessage(
            'Microphone access blocked. Tap each word in order to check your memorization.'
          );
        }
      };
      rec.onend = () => {
        if (recognitionRef.current && hifzIdxRef.current < hifzWords.length) {
          try {
            rec.start();
          } catch {
            // ignore
          }
        }
      };
      recognitionRef.current = rec;
      rec.start();
      setHifzActive(true);
      setHifzMessage('Listening… Recite aloud in Arabic, or tap words as you recite.');
    } catch {
      setHifzActive(true);
      setHifzMessage('Tap each word in order as you recite from memory.');
    }
  }, [handleHifzSpoken, hifzActive, hifzIdx, hifzWords.length, stopHifz]);

  const handleHifzWordTap = useCallback(
    (k: number) => {
      const entry = hifzWords[k];
      if (!entry) return;
      const status = hifzStatusList[k] || '';

      if (status === 'bad') {
        playHifzAyahAudio(entry.ayahIndex);
        const next = [...hifzStatusList];
        next[k] = 'ok';
        setHifzStatusList(next);
        if (k + 1 > hifzIdx) setHifzIdx(k + 1);
        setHifzMessage('Playing ayah recitation. Word marked corrected.');
        return;
      }

      if (status === 'ok') {
        playHifzAyahAudio(entry.ayahIndex);
        return;
      }

      if (k === hifzIdx) {
        const next = [...hifzStatusList];
        next[k] = 'ok';
        setHifzStatusList(next);
        const nextIdx = k + 1;
        setHifzIdx(nextIdx);
        if (nextIdx >= hifzWords.length) {
          stopHifz();
          setHifzMessage('MashaAllah! Page complete.');
        }
      } else if (k > hifzIdx) {
        // User tapped a word further ahead — mark missed current word red and play ayah to help
        const next = [...hifzStatusList];
        next[hifzIdx] = 'bad';
        setHifzStatusList(next);
        setHifzMistakes((m) => m + 1);
        setHifzMessage('Missed the highlighted red word. Tap it to hear the recitation.');
      }
    },
    [hifzIdx, hifzStatusList, hifzWords, playHifzAyahAudio, stopHifz]
  );

  // ---------------------------------------------------------------------------
  // MEDIA TAB (Full local Audio/Video player + premium canvas visualizer)
  // ---------------------------------------------------------------------------
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const vizCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const vpRef = useRef<HTMLDivElement | null>(null);

  const [queue, setQueue] = useState<MediaItem[]>([]);
  const [queueIdx, setQueueIdx] = useState<number>(-1);
  const [queueFilter, setQueueFilter] = useState<'all' | 'a' | 'v'>('all');
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<0 | 1 | 2>(0);
  const [locked, setLocked] = useState(false);
  const [mediaSpeedIdx, setMediaSpeedIdx] = useState(2); // 1x
  const [fitIdx, setFitIdx] = useState(0);
  const [abMode, setAbMode] = useState<0 | 1 | 2>(0);
  const [abPointA, setAbPointA] = useState(0);
  const [abPointB, setAbPointB] = useState(0);
  const [mediaPlaying, setMediaPlaying] = useState(false);
  const [mediaTime, setMediaTime] = useState(0);
  const [mediaDur, setMediaDur] = useState(0);
  const [subText, setSubText] = useState('');
  const [subDelay, setSubDelay] = useState(0);
  const [bassGain, setBassGain] = useState(0);
  const [trebleGain, setTrebleGain] = useState(0);
  const [mediaSleepMin, setMediaSleepMin] = useState(0);
  const [hudMsg, setHudMsg] = useState('');
  const [hudVisible, setHudVisible] = useState(false);

  const hudTimerRef = useRef<number | null>(null);
  const mediaSleepTimerRef = useRef<number | null>(null);
  const mediaAudioInitRef = useRef(false);
  const mediaAcRef = useRef<AudioContext | null>(null);
  const mediaAnalyserRef = useRef<AnalyserNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
  const mediaObjectUrlRef = useRef<string | null>(null);
  const brightnessRef = useRef(1);
  const gestureRef = useRef<{
    x: number;
    y: number;
    t: number;
    vo: number;
    b: number;
    m: 's' | 'v' | 'b' | null;
    w: DOMRect;
    nt: number | null;
  } | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const tapTimerRef = useRef<number | null>(null);
  const lastTapRef = useRef(0);
  const heldRef = useRef(false);
  const lastSavedSecRef = useRef(-1);

  const showHud = useCallback((m: string) => {
    setHudMsg(m);
    setHudVisible(true);
    if (hudTimerRef.current) window.clearTimeout(hudTimerRef.current);
    hudTimerRef.current = window.setTimeout(() => setHudVisible(false), 1000);
  }, []);

  const ensureMediaAudio = useCallback(() => {
    const v = videoRef.current;
    if (!v || mediaAudioInitRef.current) return;
    mediaAudioInitRef.current = true;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ac = new AC();
      const s = ac.createMediaElementSource(v);
      const bs = ac.createBiquadFilter();
      bs.type = 'lowshelf';
      bs.frequency.value = 200;
      bs.gain.value = bassGain;
      const tr = ac.createBiquadFilter();
      tr.type = 'highshelf';
      tr.frequency.value = 3000;
      tr.gain.value = trebleGain;
      const an = ac.createAnalyser();
      an.fftSize = 64;
      s.connect(bs);
      bs.connect(tr);
      tr.connect(an);
      an.connect(ac.destination);
      mediaAcRef.current = ac;
      bassFilterRef.current = bs;
      trebleFilterRef.current = tr;
      mediaAnalyserRef.current = an;
    } catch {
      // ignore
    }
  }, [bassGain, trebleGain]);

  useEffect(() => {
    let raf = 0;
    const currentItem = queueIdx >= 0 ? queue[queueIdx] : null;
    const isAudioMode = currentItem?.kind === 'a';
    if (!isAudioMode || !mediaPlaying) return;

    const c = vizCanvasRef.current;
    const an = mediaAnalyserRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const data = an ? new Uint8Array(an.frequencyBinCount) : new Uint8Array(32);

    const drawViz = () => {
      if (an) an.getByteFrequencyData(data);
      const W = c.width;
      const H = c.height;
      ctx.fillStyle = '#15112A';
      ctx.fillRect(0, 0, W, H);

      const avg = data.reduce((a, b) => a + b, 0) / Math.max(1, data.length) / 255;
      const gradGlow = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, 130 + avg * 40);
      gradGlow.addColorStop(0, 'rgba(155, 130, 245, 0.32)');
      gradGlow.addColorStop(1, 'rgba(21, 17, 42, 0)');
      ctx.fillStyle = gradGlow;
      ctx.fillRect(0, 0, W, H);

      const bars = Math.min(28, data.length);
      const barW = (W - 40) / bars;
      const gradBar = ctx.createLinearGradient(0, 20, 0, H - 20);
      gradBar.addColorStop(0, '#EDE6FF');
      gradBar.addColorStop(0.5, '#9B82F5');
      gradBar.addColorStop(1, '#5F3FC9');
      ctx.fillStyle = gradBar;

      for (let i = 0; i < bars; i++) {
        const val = data[i] / 255;
        const h = Math.max(8, val * (H - 36));
        const x = 20 + i * barW + 2;
        const y = (H - h) / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, Math.max(3, barW - 4), h, 4);
        ctx.fill();
      }
      raf = requestAnimationFrame(drawViz);
    };
    raf = requestAnimationFrame(drawViz);
    return () => cancelAnimationFrame(raf);
  }, [mediaPlaying, queue, queueIdx]);

  const loadMediaTrack = useCallback(
    (idx: number, autoPlay: boolean) => {
      const v = videoRef.current;
      const item = queue[idx];
      if (!v || !item) return;

      if (mediaObjectUrlRef.current) {
        URL.revokeObjectURL(mediaObjectUrlRef.current);
      }
      const url = URL.createObjectURL(item.file);
      mediaObjectUrlRef.current = url;
      setQueueIdx(idx);
      setAbMode(0);
      setSubText('');
      v.querySelectorAll('track').forEach((t) => t.remove());
      v.src = url;
      v.load();

      if (autoPlay) {
        ensureMediaAudio();
        if (mediaAcRef.current?.state === 'suspended') {
          mediaAcRef.current.resume().catch(() => {});
        }
        v.play().catch(() => {});
      }
    },
    [ensureMediaAudio, queue]
  );

  const nextMedia = useCallback(() => {
    if (!queue.length) return;
    const nextIdx = shuffle ? Math.floor(Math.random() * queue.length) : queueIdx + 1;
    if (nextIdx >= queue.length) {
      if (repeatMode === 2) loadMediaTrack(0, true);
      return;
    }
    loadMediaTrack(nextIdx, true);
  }, [loadMediaTrack, queue.length, queueIdx, repeatMode, shuffle]);

  const prevMedia = useCallback(() => {
    const v = videoRef.current;
    if (v && v.currentTime > 3) {
      v.currentTime = 0;
      return;
    }
    loadMediaTrack(Math.max(0, queueIdx - 1), true);
  }, [loadMediaTrack, queueIdx]);

  const addMediaFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const added: MediaItem[] = [];
      Array.from(files).forEach((file) => {
        if (
          /^(audio|video)\//.test(file.type) ||
          /\.(mp3|m4a|aac|wav|ogg|opus|flac|mp4|mkv|webm|mov|3gp)$/i.test(file.name)
        ) {
          const isAudio =
            file.type.startsWith('audio') ||
            /\.(mp3|m4a|aac|wav|ogg|opus|flac)$/i.test(file.name);
          added.push({
            file,
            name: file.name.replace(/\.[^.]+$/, ''),
            kind: isAudio ? 'a' : 'v',
          });
        }
      });
      if (!added.length) return;
      setQueue((prev) => {
        const next = [...prev, ...added];
        if (queueIdx < 0 && next.length > 0) {
          setTimeout(() => {
            const v = videoRef.current;
            if (v && !v.src) {
              const first = next[0];
              const url = URL.createObjectURL(first.file);
              mediaObjectUrlRef.current = url;
              setQueueIdx(0);
              v.src = url;
              v.load();
            }
          }, 0);
        }
        return next;
      });
    },
    [queueIdx]
  );

  const applySubtitles = useCallback((raw: string, delay: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.querySelectorAll('track').forEach((x) => x.remove());
    if (!raw) return;
    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.default = true;
    track.src = URL.createObjectURL(new Blob([shiftSrtToVtt(raw, delay)], { type: 'text/vtt' }));
    v.append(track);
    if (track.track) track.track.mode = 'showing';
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setMediaPlaying(true);
    const onPause = () => setMediaPlaying(false);
    const onTime = () => {
      setMediaTime(v.currentTime);
      setMediaDur(v.duration || 0);
      if (abMode === 2 && v.currentTime >= abPointB) {
        v.currentTime = abPointA;
      }
      const sec = Math.floor(v.currentTime);
      const q = queue[queueIdx];
      if (q && sec !== lastSavedSecRef.current) {
        lastSavedSecRef.current = sec;
        try {
          localStorage.setItem(`zp:${q.file.name}${q.file.size}`, String(v.currentTime));
        } catch {
          // ignore
        }
      }
    };
    const onLoaded = () => {
      const q = queue[queueIdx];
      if (q) {
        try {
          const saved = Number(localStorage.getItem(`zp:${q.file.name}${q.file.size}`) || 0);
          if (saved > 5 && saved < v.duration - 5) {
            v.currentTime = saved;
            showHud(`Resumed at ${fmtTime(saved)}`);
          }
        } catch {
          // ignore
        }
      }
      v.playbackRate = MEDIA_SPEEDS[mediaSpeedIdx];
      setMediaDur(v.duration || 0);
    };
    const onEnded = () => {
      if (repeatMode === 1) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        nextMedia();
      }
    };
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onLoaded);
    v.addEventListener('ended', onEnded);
    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onLoaded);
      v.removeEventListener('ended', onEnded);
    };
  }, [abMode, abPointA, abPointB, mediaSpeedIdx, nextMedia, queue, queueIdx, repeatMode, showHud]);

  // ---------------------------------------------------------------------------
  // BOOKS & PDFs TAB (Default হিফজুল কোরআন + Fullscreen Reader + Offline Save)
  // ---------------------------------------------------------------------------
  const [pdfs, setPdfs] = useState<PdfItem[]>(() => {
    try {
      const saved: PdfItem[] = JSON.parse(localStorage.getItem(PDF_STORAGE_KEY) || '[]');
      const hasDefault = saved.some((x) => x.id === DEFAULT_HIFZUL_QURAN.id);
      if (hasDefault) {
        return saved.map((x) =>
          x.id === DEFAULT_HIFZUL_QURAN.id
            ? { ...DEFAULT_HIFZUL_QURAN, ...x, builtIn: true }
            : x
        );
      }
      return [DEFAULT_HIFZUL_QURAN, ...saved];
    } catch {
      return [DEFAULT_HIFZUL_QURAN];
    }
  });
  const [pdfCatFilter, setPdfCatFilter] = useState(0);
  const [pdfBlobUrls, setPdfBlobUrls] = useState<Record<string, string>>({});
  const [coverBlobUrls, setCoverBlobUrls] = useState<Record<string, string>>({});
  const [addPdfOpen, setAddPdfOpen] = useState(false);
  const [editCoverPdfId, setEditCoverPdfId] = useState<string | null>(null);
  const [activeReaderPdf, setActiveReaderPdf] = useState<PdfItem | null>(null);
  const [pdfCachingId, setPdfCachingId] = useState<string | null>(null);
  const [deleteArmedId, setDeleteArmedId] = useState<string | null>(null);

  const [newPdfTitle, setNewPdfTitle] = useState('');
  const [newPdfCat, setNewPdfCat] = useState(PDF_CATEGORIES[1]);
  const [newPdfDriveUrl, setNewPdfDriveUrl] = useState('');
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null);
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [newCoverPreview, setNewCoverPreview] = useState<string>('');

  const persistPdfs = useCallback(
    (list: PdfItem[]) => {
      setPdfs(list);
      try {
        localStorage.setItem(PDF_STORAGE_KEY, JSON.stringify(list));
      } catch {
        toast('Could not save the list');
      }
    },
    [toast]
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const nextPdfUrls: Record<string, string> = {};
      const nextCoverUrls: Record<string, string> = {};
      for (const p of pdfs) {
        if (p.file && !pdfBlobUrls[p.id]) {
          try {
            const b = await idbGet<Blob>(p.id);
            if (b) nextPdfUrls[p.id] = URL.createObjectURL(b);
          } catch {
            // ignore
          }
        }
        if (p.coverFile && !coverBlobUrls[p.id]) {
          try {
            const b = await idbGet<Blob>(`cover:${p.id}`);
            if (b) nextCoverUrls[p.id] = URL.createObjectURL(b);
          } catch {
            // ignore
          }
        }
      }
      if (!active) return;
      if (Object.keys(nextPdfUrls).length) {
        setPdfBlobUrls((prev) => ({ ...prev, ...nextPdfUrls }));
      }
      if (Object.keys(nextCoverUrls).length) {
        setCoverBlobUrls((prev) => ({ ...prev, ...nextCoverUrls }));
      }
    })();
    return () => {
      active = false;
    };
  }, [pdfs, pdfBlobUrls, coverBlobUrls]);

  const resetAddPdfForm = useCallback(() => {
    setNewPdfTitle('');
    setNewPdfCat(PDF_CATEGORIES[1]);
    setNewPdfDriveUrl('');
    setNewPdfFile(null);
    setNewCoverUrl('');
    setNewCoverFile(null);
    setNewCoverPreview('');
    setEditCoverPdfId(null);
  }, []);

  const handleSavePdf = useCallback(async () => {
    if (editCoverPdfId) {
      const target = pdfs.find((x) => x.id === editCoverPdfId);
      if (!target) return;
      const updated = { ...target };
      if (newCoverFile) {
        try {
          await idbPut(`cover:${target.id}`, newCoverFile);
          updated.coverFile = true;
          delete updated.coverUrl;
          setCoverBlobUrls((prev) => ({
            ...prev,
            [target.id]: URL.createObjectURL(newCoverFile),
          }));
        } catch {
          toast('Could not store the cover image');
          return;
        }
      } else if (newCoverUrl.trim()) {
        updated.coverUrl = newCoverUrl.trim();
        updated.coverFile = false;
      } else {
        delete updated.coverUrl;
        updated.coverFile = false;
      }
      persistPdfs(pdfs.map((x) => (x.id === target.id ? updated : x)));
      setAddPdfOpen(false);
      resetAddPdfForm();
      toast('Cover picture updated');
      return;
    }

    const t = newPdfTitle.trim();
    let u = newPdfDriveUrl.trim();
    if (u && !/^https?:\/\//i.test(u) && /\./.test(u)) {
      u = `https://${u}`;
    }

    if (!t) return toast('Enter a title');
    if (!newPdfFile && !/^https?:\/\//i.test(u)) {
      return toast('Paste a Drive link or choose a PDF');
    }

    const id = Date.now().toString(36);
    const item: PdfItem = { id, t, cat: newPdfCat };

    if (newPdfFile) {
      try {
        await idbPut(id, newPdfFile);
        item.file = true;
        setPdfBlobUrls((prev) => ({ ...prev, [id]: URL.createObjectURL(newPdfFile) }));
      } catch {
        return toast('Could not store the file on this device');
      }
    } else {
      item.url = u;
    }

    if (newCoverFile) {
      try {
        await idbPut(`cover:${id}`, newCoverFile);
        item.coverFile = true;
        setCoverBlobUrls((prev) => ({ ...prev, [id]: URL.createObjectURL(newCoverFile) }));
      } catch {
        // non-fatal
      }
    } else if (newCoverUrl.trim()) {
      let cu = newCoverUrl.trim();
      if (!/^https?:\/\//i.test(cu) && !cu.startsWith('data:') && /\./.test(cu)) {
        cu = `https://${cu}`;
      }
      item.coverUrl = cu;
    }

    persistPdfs([...pdfs, item]);
    setAddPdfOpen(false);
    setPdfCatFilter(0);
    resetAddPdfForm();
    toast('PDF added');
  }, [
    editCoverPdfId,
    newCoverFile,
    newCoverUrl,
    newPdfCat,
    newPdfDriveUrl,
    newPdfFile,
    newPdfTitle,
    pdfs,
    persistPdfs,
    resetAddPdfForm,
    toast,
  ]);

  const handleCachePdfOffline = useCallback(
    async (p: PdfItem) => {
      if (!p.url || pdfCachingId) return;
      const downloadUrl = toDriveDownloadUrl(p.url) || p.url;
      setPdfCachingId(p.id);
      toast(appLang === 'bn' ? 'অফলাইন পড়ার জন্য PDF সেভ হচ্ছে…' : 'Saving PDF for offline reading…');
      try {
        const res = await fetch(downloadUrl);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const blob = await res.blob();
        if (blob.size < 1024) throw new Error('Invalid PDF');
        await idbPut(p.id, blob);
        const objUrl = URL.createObjectURL(blob);
        setPdfBlobUrls((prev) => ({ ...prev, [p.id]: objUrl }));
        persistPdfs(pdfs.map((item) => (item.id === p.id ? { ...item, file: true } : item)));
        await refreshOfflineStats();
        toast(
          appLang === 'bn'
            ? `“${p.t}” অফলাইনে সেভ সম্পন্ন হয়েছে!`
            : `“${p.t}” saved for offline reading!`
        );
      } catch {
        toast(
          appLang === 'bn'
            ? 'ড্রাইভ থেকে সরাসরি অফলাইন সেভ করা যায়নি; অনলাইন মোডে পড়ুন'
            : 'Could not download Drive PDF offline; read online'
        );
      } finally {
        setPdfCachingId(null);
      }
    },
    [appLang, pdfCachingId, pdfs, persistPdfs, refreshOfflineStats, toast]
  );

  const handleDeletePdf = useCallback(
    (id: string) => {
      if (deleteArmedId !== id) {
        setDeleteArmedId(id);
        window.setTimeout(() => {
          setDeleteArmedId((cur) => (cur === id ? null : cur));
        }, 3000);
        return;
      }
      const target = pdfs.find((x) => x.id === id);
      if (target?.builtIn) return;
      persistPdfs(pdfs.filter((x) => x.id !== id));
      setDeleteArmedId(null);
      if (target?.file) idbDelete(id).catch(() => {});
      if (target?.coverFile) idbDelete(`cover:${id}`).catch(() => {});
    },
    [deleteArmedId, pdfs, persistPdfs]
  );

  // ---------------------------------------------------------------------------
  // GUIDE / TOUR
  // ---------------------------------------------------------------------------
  const [tourMode, setTourMode] = useState<'none' | 'welcome' | 'step' | 'overview'>(() => {
    try {
      return localStorage.getItem('zk_tour') ? 'none' : 'welcome';
    } catch {
      return 'welcome';
    }
  });
  const [tourStepIdx, setTourStepIdx] = useState(0);

  const closeTour = useCallback(() => {
    setTourMode('none');
    try {
      localStorage.setItem('zk_tour', '1');
    } catch {
      // ignore
    }
    goTab(0);
    // Show Full Offline Pack Downloader automatically after Guide (even when user skips!)
    try {
      if (!localStorage.getItem('zk_offline_prompt_seen')) {
        setPackReciterIdx(reciterIdx);
        setOfflinePromptOpen(true);
      }
    } catch {
      setOfflinePromptOpen(true);
    }
  }, [goTab, reciterIdx]);

  const startTourStep = useCallback(
    (idx: number) => {
      setTourStepIdx(idx);
      setTourMode('step');
      goTab(tourSteps[idx][0]);
    },
    [goTab, tourSteps]
  );

  const filteredSurahs = useMemo(() => {
    const q = surahQuery.trim().toLowerCase();
    if (!q) return ALL_SURAHS;
    return ALL_SURAHS.filter(
      (s) =>
        s.en.toLowerCase().includes(q) ||
        s.ar.includes(q) ||
        String(s.number) === q
    );
  }, [surahQuery]);

  const filteredPdfs = useMemo(
    () => pdfs.filter((p) => pdfCatFilter === 0 || p.cat === PDF_CATEGORIES[pdfCatFilter]),
    [pdfCatFilter, pdfs]
  );

  const currentMedia = queueIdx >= 0 ? queue[queueIdx] : null;
  const activeBarsCount = Math.round((pos / Math.max(1, duration)) * 40);
  const currentHifzAyah =
    hifzWords[Math.min(hifzIdx, Math.max(0, hifzWords.length - 1))]?.ayahIndex ??
    hifzPage * HIFZ_AYAHS_PER_PAGE;

  return (
    <>
      {splashState !== 'gone' && (
        <div
          id="splash"
          aria-hidden="true"
          className={splashState === 'out' ? 'out' : ''}
          onClick={dismissSplash}
        >
          <div className="spbox">
            <div className="spi">
              <img id="spwm" className="lt" alt="ZIKRIFY" src={BRAND_LOGO_LIGHT} />
              <img id="spwmd" className="dk" alt="ZIKRIFY" src={BRAND_LOGO_DARK} />
              <img
                id="sptg"
                className="lt"
                alt="Quran Audio Player"
                src={BRAND_TAGLINE_LIGHT}
              />
              <img
                id="sptgd"
                className="dk"
                alt="Quran Audio Player"
                src={BRAND_TAGLINE_DARK}
              />
            </div>
          </div>
          <div className="spbar">
            <i />
          </div>
        </div>
      )}

      <div className={`app${appEntered ? ' in' : ''}`}>
        {/* Hidden native audio elements for Listen (Arabic CORS, English plain, Bangla TTS) & Read */}
        <audio ref={listenAudioRef} preload="metadata" crossOrigin="anonymous" />
        <audio ref={englishAudioRef} preload="none" />
        <audio ref={banglaAudioRef} preload="none" />
        <audio ref={readAudioRef} preload="none" />

        {/* TOP NAVIGATION WITH THEME & COMPACT SETTINGS */}
        <nav>
          <button aria-current={tab === 0 ? 'page' : 'false'} onClick={() => goTab(0)}>
            <Icon d="M4 14v-2a8 8 0 0116 0v2M4 14h3v6H4zM17 14h3v6h-3z" />
            {t.nav[0]}
          </button>
          <button aria-current={tab === 1 ? 'page' : 'false'} onClick={() => goTab(1)}>
            <Icon d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 19h15" />
            {t.nav[1]}
          </button>
          <button aria-current={tab === 2 ? 'page' : 'false'} onClick={() => goTab(2)}>
            <Icon d="M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3zM6 11a6 6 0 0012 0M12 17v4" />
            {t.nav[2]}
          </button>
          <button aria-current={tab === 3 ? 'page' : 'false'} onClick={() => goTab(3)}>
            <Icon d="M3 6h7l2 2h9v11H3z" />
            {t.nav[3]}
          </button>
          <button aria-current={tab === 4 ? 'page' : 'false'} onClick={() => goTab(4)}>
            <Icon d="M4 4h12l4 4v12H4zM15 4v5h5M8 13h8M8 17h8" />
            {t.nav[4]}
          </button>
          <button
            className="th"
            id="thm"
            aria-label="Switch light or dark theme"
            onClick={toggleTheme}
          >
            <span id="thi">
              <Icon
                d={
                  theme === 'dark'
                    ? 'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'
                    : 'M21 13a9 9 0 11-10-10 7 7 0 0010 10z'
                }
              />
            </span>
            <span id="thl">{theme === 'dark' ? t.themeLight : t.themeDark}</span>
          </button>
          <button
            className="stg"
            id="stgb"
            aria-label={t.settingsBtn}
            onClick={() => {
              setPackReciterIdx(reciterIdx);
              refreshOfflineStats(reciterIdx);
              setSettingsSection('general');
              setSettingsOpen(true);
            }}
          >
            <Icon d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            <span>{t.settingsBtn}</span>
          </button>
        </nav>

        {/* FLOATING PERSISTENT BACKGROUND DOWNLOAD BAR */}
        {(dlJob.status === 'running' || dlJob.status === 'paused') && (
          <div className="dl-bar" role="region" aria-label={t.bgDownloadingLabel}>
            <div className="dl-bar-top">
              <div className="dl-bar-info">
                <b>
                  {dlJob.status === 'running' ? t.bgDownloadingLabel : t.pausedLabel} ·{' '}
                  {Math.round((dlJob.completed / Math.max(1, dlJob.total)) * 100)}%
                </b>
                <span>
                  {dlJob.label || RECITERS[dlJob.reciterIndex]?.name} ({dlJob.completed}/{dlJob.total})
                </span>
              </div>
              <div className="dl-bar-actions">
                {dlJob.status === 'running' ? (
                  <button className="dl-bar-btn pri" onClick={pauseBulkDownload}>
                    ⏸ {t.pauseBtn}
                  </button>
                ) : (
                  <button className="dl-bar-btn pri" onClick={resumeBulkDownload}>
                    ▶ {t.resumeBtn}
                  </button>
                )}
                <button
                  className="dl-bar-btn"
                  onClick={() => {
                    setSettingsSection('general');
                    setSettingsOpen(true);
                  }}
                >
                  ⚙
                </button>
                {dlJob.status === 'paused' && (
                  <button
                    className="dl-bar-btn"
                    aria-label={t.close}
                    onClick={clearDlJob}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <div className="pbar">
              <i
                style={{
                  width: `${Math.round((dlJob.completed / Math.max(1, dlJob.total)) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        <main ref={mainRef}>
        {!isOnline && (
          <div className="offline-pill" role="status">
            <span className="offline-dot" />
            <span>{t.offlineBanner}</span>
          </div>
        )}
        {/* TAB 0: LISTEN */}
        <section id="s0" hidden={tab !== 0}>
          <div className="hd">
            <b className="brand">ZIKRIFY</b>
            <button
              className="chip"
              style={{ minHeight: 34, padding: '0 12px', fontSize: 12 }}
              onClick={() => setSurahSheetOpen(true)}
            >
              {isLoadingAudio ? t.loadingText : `${surah.number}/114 ${t.surahsLabel} ▾`}
            </button>
            <button className="chip" id="hlp" onClick={() => setTourMode('welcome')}>
              {t.guideBtn}
            </button>
          </div>

          <div
            className={`arch${isPlaying ? ' playing' : ''}`}
            onClick={() => setSurahSheetOpen(true)}
            title="Tap to select from all 114 Surahs"
          >
            <div className="arch-aura" ref={auraRef} />
            <div className="arch-ring r1" />
            <div className="arch-ring r2" />
            <div className="arch-shimmer" />

            <div className="arch-content">
              <div className="ar" lang="ar" dir="rtl">
                {surah.ar}
              </div>
              <div className="bn">
                {surah.bn} · {toBengaliDigits(surah.ayahs)} আয়াত
              </div>
            </div>

            <div className="arch-eq" aria-hidden="true">
              {Array.from({ length: EQ_BAR_COUNT }).map((_, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    eqBarsRef.current[i] = el;
                  }}
                />
              ))}
            </div>
          </div>

          <div className="tc">
            <h2
              style={{ cursor: 'pointer' }}
              onClick={() => setSurahSheetOpen(true)}
              title="Tap to switch Surah"
            >
              Surah {surah.en}
            </h2>
            <div className="mut" id="rn">
              {listenLang === 0
                ? RECITERS[reciterIdx].name
                : listenLang === 1
                ? 'বাংলা অনুবাদ'
                : 'English · Ibrahim Walk'}
            </div>
          </div>

          <div
            className={`wave${isPlaying ? ' playing' : ''}`}
            id="wv"
            aria-label="Seek bar"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              seekListen(ratio * duration);
            }}
          >
            {BASE_WAVE_HEIGHTS.map((h, i) => (
              <i
                key={i}
                ref={(el) => {
                  waveBarsRef.current[i] = el;
                }}
                style={{ height: `${h}px` }}
                className={`${i < activeBarsCount ? 'd' : ''}${
                  i === activeBarsCount ? ' head' : ''
                }`}
              />
            ))}
          </div>

          <div className="tm">
            <span id="t1">{fmtTime(pos)}</span>
            <span id="t2">-{fmtTime(Math.max(0, duration - pos))}</span>
          </div>

          <div className="ctl">
            <button
              className="ib"
              id="bk"
              aria-label="Back 10 seconds"
              onClick={() => seekListen(pos - 10)}
            >
              <Icon d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
            </button>
            <button
              className={`ib play big${isPlaying ? ' playing' : ''}`}
              id="pp"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              onClick={toggleListenPlay}
            >
              <Icon d={isPlaying ? 'M8 5v14M16 5v14' : 'M8 5l11 7-11 7z'} />
            </button>
            <button
              className="ib"
              id="fw"
              aria-label="Forward 10 seconds"
              onClick={() => seekListen(pos + 10)}
            >
              <Icon d="M13 17l5-5-5-5M6 17l5-5-5-5" />
            </button>
          </div>

          <div className="rw">
            <button
              className="chip"
              id="sp"
              onClick={() => {
                const next = (speedIdx + 1) % SPEED_OPTIONS.length;
                setSpeedIdx(next);
                if (listenAudioRef.current) {
                  listenAudioRef.current.playbackRate = SPEED_OPTIONS[next];
                }
                if (englishAudioRef.current) {
                  englishAudioRef.current.playbackRate = SPEED_OPTIONS[next];
                }
                if (banglaAudioRef.current) {
                  banglaAudioRef.current.playbackRate = SPEED_OPTIONS[next];
                }
                if (listenLang === 1 && isPlaying) {
                  speakBanglaFromAyah(banglaAyahIdxRef.current, SPEED_OPTIONS[next]);
                }
              }}
            >
              Speed {SPEED_OPTIONS[speedIdx]}x
            </button>

            <button
              className="chip"
              id="sl"
              aria-pressed={sleepLeft > 0}
              onClick={() => setSleepSheetOpen(true)}
            >
              <Icon d="M21 13a9 9 0 11-10-10 7 7 0 0010 10z" />
              <span id="slt">
                {sleepLeft > 0
                  ? `${appLang === 'bn' ? 'স্লিপ' : 'Sleep'} ${
                      sleepLeft >= 3600
                        ? `${Math.floor(sleepLeft / 3600)}:${String(
                            Math.floor((sleepLeft % 3600) / 60)
                          ).padStart(2, '0')}:${String(sleepLeft % 60).padStart(2, '0')}`
                        : fmtTime(sleepLeft)
                    }`
                  : appLang === 'bn'
                  ? 'স্লিপ: বন্ধ'
                  : 'Sleep: off'}
              </span>
            </button>

            <button
              className="chip"
              id="off"
              role="switch"
              aria-checked={offlineSaved}
              onClick={handleToggleOffline}
            >
              {offlineBusy
                ? t.saving
                : offlineSaved
                ? t.offlineSaved
                : t.offlineOff}
            </button>
          </div>

          <p className="mut sm">{t.reciterLabel}</p>
          <div className="rg" id="rc">
            {RECITERS.map((r, i) => (
              <button
                key={r.name}
                className="rcd"
                aria-pressed={i === reciterIdx}
                onClick={() => {
                  setReciterIdx(i);
                  if (listenLang === 0) {
                    loadAndPlayListen(i, surah.number, 0, isPlaying);
                  } else {
                    setListenLang(0);
                    loadAndPlayListen(i, surah.number, 0, true);
                  }
                }}
              >
                <span className="av">{r.name[0]}</span>
                <span>{r.name}</span>
              </button>
            ))}
          </div>

          <p className="mut sm">{t.listenInLabel}</p>
          <div className="rw" id="md">
            {(['Arabic', 'বাংলা', 'English'] as const).map((label, i) => {
              const lang = i as ListenLang;
              return (
                <button
                  key={label}
                  className="chip"
                  aria-pressed={listenLang === lang}
                  onClick={() => {
                    setListenLang(lang);
                    toast(`Listening language: ${label}`);
                    loadAndPlayListen(reciterIdx, surah.number, lang, true);
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <p className="credit">Developed by Graphico Global · For MAHADUL FURQAN</p>
        </section>

        {/* TAB 1: READ */}
        <section id="s1" hidden={tab !== 1}>
          <div className="hd">
            <b>
              {surah.number}. {surah.en}
            </b>
            <button
              className="chip"
              style={{ minHeight: 36, padding: '0 12px', fontSize: 12 }}
              onClick={() => setSurahSheetOpen(true)}
            >
              114 Surahs ▾
            </button>
          </div>

          {/* Reading View Mode Switcher + Teacher Studio + Tajweed Markings */}
          <div className="tj-teach-bar">
            {/* 3 Reading View Modes: Pure Mushaf / Arabic-Only Ayah / With Meaning */}
            <div className="read-mode-seg" role="tablist" aria-label="Reading layout">
              <button
                type="button"
                role="tab"
                aria-selected={readViewMode === 'mushaf'}
                className={readViewMode === 'mushaf' ? 'on' : ''}
                onClick={() => changeReadViewMode('mushaf')}
              >
                {teachLang === 'bn'
                  ? 'মুসহাফ (অর্থহীন)'
                  : teachLang === 'ar'
                  ? 'مصحف متصل'
                  : teachLang === 'ur'
                  ? 'مصحف (بلا ترجمہ)'
                  : 'Mushaf (Pure)'}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={readViewMode === 'ayah_ar'}
                className={readViewMode === 'ayah_ar' ? 'on' : ''}
                onClick={() => changeReadViewMode('ayah_ar')}
              >
                {teachLang === 'bn'
                  ? 'শুধু আয়াত'
                  : teachLang === 'ar'
                  ? 'آيات فقط'
                  : teachLang === 'ur'
                  ? 'صرف آیات'
                  : 'Arabic Ayah'}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={readViewMode === 'meaning'}
                className={readViewMode === 'meaning' ? 'on' : ''}
                onClick={() => changeReadViewMode('meaning')}
              >
                {teachLang === 'bn'
                  ? 'অর্থসহ'
                  : teachLang === 'ar'
                  ? 'مع المعاني'
                  : teachLang === 'ur'
                  ? 'مع ترجمہ'
                  : 'With Meaning'}
              </button>
            </div>

            <div className="rw" style={{ marginTop: 0 }}>
              <button
                className="chip"
                style={{ minHeight: 34, fontSize: 11.5, padding: '0 10px' }}
                aria-pressed={tajweedEnabled}
                onClick={() => {
                  const next = !tajweedEnabled;
                  setTajweedEnabled(next);
                  if (!next) setFocusedRule(null);
                  try {
                    localStorage.setItem('zk_tajweed', next ? '1' : '0');
                  } catch {
                    // ignore
                  }
                }}
              >
                🎨{' '}
                {teachLang === 'bn'
                  ? 'তাজবীদ কালার'
                  : teachLang === 'ar'
                  ? 'ألوان التجويد'
                  : teachLang === 'ur'
                  ? 'تجوید رنگ'
                  : 'Tajweed Colors'}
              </button>

              {tajweedEnabled && (
                <button
                  className="chip"
                  style={{ minHeight: 34, fontSize: 11.5, padding: '0 10px' }}
                  aria-pressed={showTajweedMarks}
                  onClick={() => {
                    const next = !showTajweedMarks;
                    setShowTajweedMarks(next);
                    try {
                      localStorage.setItem('zk_tj_marks', next ? '1' : '0');
                    } catch {
                      // ignore
                    }
                  }}
                >
                  ✦{' '}
                  {teachLang === 'bn'
                    ? 'মার্ক ইন্ডিকেটর'
                    : teachLang === 'ar'
                    ? 'علامات التمييز'
                    : teachLang === 'ur'
                    ? 'تجوید نشانات'
                    : 'Rule Marks'}
                </button>
              )}

              <button
                className="chip on"
                style={{ minHeight: 34, fontSize: 11.5, padding: '0 10px' }}
                onClick={() => setTajweedGuideOpen(true)}
              >
                🎓{' '}
                {teachLang === 'bn'
                  ? 'কায়েদা ও মাখরাজ'
                  : teachLang === 'ar'
                  ? 'دليل التجويد'
                  : teachLang === 'ur'
                  ? 'مکمل گائیڈ'
                  : 'Qaida & Makhraj'}
              </button>
            </div>

            {/* 4-Language Switcher + English Student Subtitle Toggle */}
            <div className="rw" style={{ marginTop: 8 }}>
              {(['en', 'bn', 'ar', 'ur'] as TeachLang[]).map((lng) => (
                <button
                  key={lng}
                  className="chip"
                  style={{ minHeight: 28, padding: '0 9px', fontSize: 11 }}
                  aria-pressed={teachLang === lng}
                  onClick={() => updateTeachLang(lng)}
                >
                  {TEACH_LANG_LABELS[lng]}
                </button>
              ))}
              {teachLang !== 'en' && (
                <button
                  className="chip"
                  style={{ minHeight: 28, padding: '0 9px', fontSize: 11 }}
                  aria-pressed={showEnSub}
                  onClick={() => setShowEnSub((s) => !s)}
                >
                  {showEnSub ? '✓ EN Sub' : 'EN Sub'}
                </button>
              )}
            </div>

            {/* Teacher Marking Pen & Arabic Font Size Bar */}
            <div className="teacher-bar">
              <div className="teacher-bar-head">
                <b style={{ fontSize: 11.5, color: 'var(--softI)' }}>
                  {teachLang === 'bn'
                    ? 'টিচার পয়েন্টার ও মার্কিং টুল'
                    : teachLang === 'ar'
                    ? 'أدوات المعلّم والتمييز'
                    : teachLang === 'ur'
                    ? 'استاد کے نشانات و مارکنگ'
                    : 'Teacher Pointer & Marking'}
                </b>
                <div className="tj-font-ctrl" aria-label="Arabic font size">
                  <button
                    type="button"
                    aria-label="Decrease Arabic font size"
                    onClick={() => changeArabicFontSize(-2)}
                  >
                    A−
                  </button>
                  <span>{arabicFontSize}</span>
                  <button
                    type="button"
                    aria-label="Increase Arabic font size"
                    onClick={() => changeArabicFontSize(2)}
                  >
                    A+
                  </button>
                </div>
              </div>

              <div className="pen-row">
                <button
                  type="button"
                  className={`pen-btn${teacherTool === 'inspect' ? ' on' : ''}`}
                  onClick={() => setTeacherTool('inspect')}
                >
                  🔍{' '}
                  {teachLang === 'bn'
                    ? 'তাজবীদ দেখুন'
                    : teachLang === 'ar'
                    ? 'تحليل الكلمة'
                    : teachLang === 'ur'
                    ? 'تجوید دیکھیں'
                    : 'Inspect'}
                </button>
                <button
                  type="button"
                  className={`pen-btn mistake${teacherTool === 'mistake' ? ' on' : ''}`}
                  onClick={() => setTeacherTool('mistake')}
                >
                  ✕ {teachLang === 'bn' ? 'ভুল মার্ক' : teachLang === 'ar' ? 'خطأ' : teachLang === 'ur' ? 'غلطی' : 'Mistake'}
                </button>
                <button
                  type="button"
                  className={`pen-btn focus${teacherTool === 'focus' ? ' on' : ''}`}
                  onClick={() => setTeacherTool('focus')}
                >
                  ★ {teachLang === 'bn' ? 'চর্চা / তাজবীদ' : teachLang === 'ar' ? 'تمرين' : teachLang === 'ur' ? 'مشق' : 'Practice'}
                </button>
                <button
                  type="button"
                  className={`pen-btn done${teacherTool === 'done' ? ' on' : ''}`}
                  onClick={() => setTeacherTool('done')}
                >
                  ✓ {teachLang === 'bn' ? 'সঠিক' : teachLang === 'ar' ? 'ممتاز' : teachLang === 'ur' ? 'درست' : 'Good'}
                </button>
                <button
                  type="button"
                  className={`pen-btn waqf${teacherTool === 'waqf' ? ' on' : ''}`}
                  onClick={() => setTeacherTool('waqf')}
                >
                  ⏸ {teachLang === 'bn' ? 'থামুন / নোট' : teachLang === 'ar' ? 'وقف/ملاحظة' : teachLang === 'ur' ? 'وقف/نوٹ' : 'Waqf/Note'}
                </button>
                <button
                  type="button"
                  className={`pen-btn${teacherTool === 'erase' ? ' on' : ''}`}
                  onClick={() => setTeacherTool('erase')}
                >
                  ⌫ {teachLang === 'bn' ? 'মুছুন' : teachLang === 'ar' ? 'مسح' : teachLang === 'ur' ? 'مٹائیں' : 'Erase'}
                </button>
              </div>
            </div>

            <p className="mut sm" style={{ margin: '6px 0 0', fontSize: 11 }}>
              {teacherTool === 'inspect'
                ? teachLang === 'bn'
                  ? 'টিপস: যেকোনো আরবি শব্দে ট্যাপ করলে তাজবীদ, মাখরাজ ও সিফাত ভেসে উঠবে। নিচে কালার পিল চেপে নির্দিষ্ট নিয়ম সব আয়াতে মার্ক করুন।'
                  : teachLang === 'ar'
                  ? 'اضغط على أي كلمة لعرض التجويد والمخرج والصفات، أو اختر حكماً بالأسفل لتمييزه في كامل السورة.'
                  : teachLang === 'ur'
                  ? 'کسی بھی لفظ پر ٹیپ کر کے تجوید دیکھیں، یا نیچے کسی قاعدے کو منتخب کر کے پوری سورت میں نشان زد کریں۔'
                  : 'Tap any word to inspect Tajweed & Makhraj live, or tap a Tajweed rule pill below to mark every occurrence.'
                : teachLang === 'bn'
                ? 'মার্ক মোড চালু: যেকোনো আরবি শব্দে ট্যাপ করে ছাত্রের জন্য সরাসরি মার্ক করুন।'
                : teachLang === 'ar'
                ? 'وضع التعلّيم مفعّل: اضغط على أي كلمة لوضع العلامة المختارة.'
                : teachLang === 'ur'
                ? 'مارکنگ موڈ فعال ہے: کسی بھی لفظ پر ٹیپ کر کے نشان لگائیں۔'
                : 'Marking mode active: tap any Arabic word below to highlight & mark it for your student.'}
            </p>
          </div>

          {/* Interactive Tajweed Rule Filter & Highlighter Pills */}
          {tajweedEnabled && (
            <div className="tj-legend-row" aria-label="Tajweed Rule Indicators">
              <button
                type="button"
                className="tj-legend-pill"
                style={{
                  background: !focusedRule ? 'var(--pri)' : 'var(--card)',
                  color: !focusedRule ? 'var(--priI)' : 'var(--ink)',
                  borderColor: !focusedRule ? 'var(--pri)' : 'var(--line)',
                }}
                onClick={() => setFocusedRule(null)}
              >
                <span>
                  {teachLang === 'bn'
                    ? 'সব তাজবীদ'
                    : teachLang === 'ar'
                    ? 'جميع الأحكام'
                    : teachLang === 'ur'
                    ? 'تمام قواعد'
                    : 'All Rules'}
                </span>
              </button>
              {Object.values(TAJWEED_RULES).map((r) => {
                const count = surahRuleCounts[r.id] || 0;
                const col = theme === 'dark' ? r.colorDark : r.colorLight;
                const bg = theme === 'dark' ? r.bgDark : r.bgLight;
                const isSelected = focusedRule === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    className="tj-legend-pill"
                    style={{
                      background: isSelected ? col : bg,
                      color: isSelected ? '#fff' : col,
                      borderColor: col,
                      opacity: count === 0 && !isSelected ? 0.45 : 1,
                    }}
                    onClick={() => {
                      if (isSelected) {
                        setFocusedRule(null);
                      } else {
                        setFocusedRule(r.id);
                        setFocusedMatchIdx(0);
                        window.setTimeout(() => {
                          const firstWord = document.querySelector('.tj-word.focused-match');
                          firstWord?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 40);
                      }
                    }}
                  >
                    <i style={{ background: isSelected ? '#fff' : col }} />
                    <span>
                      {r.name[teachLang].split('(')[0].trim()} ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Focused Tajweed Rule Live Callout & Occurrence Stepper */}
          {tajweedEnabled && focusedRule && (
            <div
              className="tj-focus-card"
              style={{
                borderColor:
                  theme === 'dark'
                    ? TAJWEED_RULES[focusedRule].colorDark
                    : TAJWEED_RULES[focusedRule].colorLight,
              }}
            >
              <div className="top" style={{ gap: 8 }}>
                <b
                  style={{
                    fontSize: 14,
                    color:
                      theme === 'dark'
                        ? TAJWEED_RULES[focusedRule].colorDark
                        : TAJWEED_RULES[focusedRule].colorLight,
                  }}
                >
                  ✦ {TAJWEED_RULES[focusedRule].name[teachLang]}
                </b>
                <button
                  type="button"
                  className="dl-bar-btn"
                  onClick={() => setFocusedRule(null)}
                >
                  ✕
                </button>
              </div>
              {showEnSub && teachLang !== 'en' && (
                <div className="tj-en-sub">{TAJWEED_RULES[focusedRule].name.en}</div>
              )}
              <p style={{ margin: '4px 0 0', fontSize: 12.5, lineHeight: 1.5 }}>
                {TAJWEED_RULES[focusedRule].shortDesc[teachLang]}
              </p>
              {showEnSub && teachLang !== 'en' && (
                <p className="tj-en-p">{TAJWEED_RULES[focusedRule].shortDesc.en}</p>
              )}

              <div className="tj-focus-nav">
                <span className="mut" style={{ fontSize: 11.5, fontWeight: 700 }}>
                  {focusedMatches.length > 0
                    ? `${Math.min(focusedMatchIdx + 1, focusedMatches.length)} / ${
                        focusedMatches.length
                      } ${
                        teachLang === 'bn'
                          ? 'টি স্থানে পাওয়া গেছে'
                          : teachLang === 'ar'
                          ? 'مواضع في السورة'
                          : teachLang === 'ur'
                          ? 'مقامات'
                          : 'matches in Surah'
                      }`
                    : teachLang === 'bn'
                    ? 'এই সূরায় নেই'
                    : 'None in this Surah'}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {focusedMatches.length > 0 && (
                    <>
                      <button
                        type="button"
                        className="dl-bar-btn"
                        onClick={() => jumpToFocusedMatch(focusedMatchIdx - 1)}
                      >
                        ◀
                      </button>
                      <button
                        type="button"
                        className="dl-bar-btn pri"
                        onClick={() => jumpToFocusedMatch(focusedMatchIdx + 1)}
                      >
                        ▶
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="dl-bar-btn"
                    onClick={() => setTajweedGuideOpen(true)}
                  >
                    🎓
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Teacher Marks Summary Strip */}
          {totalTeacherMarks > 0 && (
            <div className="teacher-marks-summary">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <b>
                  {teachLang === 'bn'
                    ? 'মার্ক করা শব্দ:'
                    : teachLang === 'ar'
                    ? 'الكلمات المعلّمة:'
                    : teachLang === 'ur'
                    ? 'نشان زد الفاظ:'
                    : 'Marked Words:'}
                </b>
                {teacherMarkCounts.mistake > 0 && (
                  <span style={{ color: '#DC2626', fontWeight: 700 }}>
                    ✕ {teacherMarkCounts.mistake}
                  </span>
                )}
                {teacherMarkCounts.focus > 0 && (
                  <span style={{ color: '#D97706', fontWeight: 700 }}>
                    ★ {teacherMarkCounts.focus}
                  </span>
                )}
                {teacherMarkCounts.done > 0 && (
                  <span style={{ color: '#15803D', fontWeight: 700 }}>
                    ✓ {teacherMarkCounts.done}
                  </span>
                )}
                {teacherMarkCounts.waqf > 0 && (
                  <span style={{ color: '#2563EB', fontWeight: 700 }}>
                    ⏸ {teacherMarkCounts.waqf}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="dl-bar-btn"
                onClick={() => {
                  persistTeacherMarks({});
                  toast(
                    teachLang === 'bn'
                      ? 'এই সূরার সব মার্ক মুছে ফেলা হয়েছে'
                      : 'Cleared marks for this Surah'
                  );
                }}
              >
                {teachLang === 'bn' ? 'সব মার্ক মুছুন' : 'Clear All'}
              </button>
            </div>
          )}

          {ayahsLoading ? (
            <div className="card">
              <p className="mut" style={{ margin: 0 }}>
                Loading Surah {surah.en} ({surah.ayahs} ayahs)…
              </p>
            </div>
          ) : readViewMode === 'mushaf' ? (
            /* PURE MUSHAF VIEW: Continuous RTL Ayahs, No Translation, Clickable Ayah Markers & Teacher Marking */
            <div className="mushaf-card">
              <div className="mushaf-banner">
                <div className="ar" lang="ar" dir="rtl">
                  سُورَةُ {surah.ar}
                </div>
                <div className="sub">
                  {surah.number}. {surah.en} · {surah.bn} ·{' '}
                  {teachLang === 'bn'
                    ? `${toBengaliDigits(surah.ayahs)} আয়াত`
                    : `${surah.ayahs} Ayahs`}
                </div>
              </div>

              {surah.number !== 1 && surah.number !== 9 && (
                <div
                  className="mushaf-bism"
                  lang="ar"
                  dir="rtl"
                  style={{ fontSize: arabicFontSize }}
                >
                  {parsedBismillah.map((w, wi) => (
                    <React.Fragment key={wi}>
                      {renderTajweedWord(w, `bism-${wi}`, 0, 1)}
                      {wi < parsedBismillah.length - 1 ? ' ' : ''}
                    </React.Fragment>
                  ))}
                </div>
              )}

              <div
                className="mushaf-flow"
                lang="ar"
                dir="rtl"
                style={{ fontSize: arabicFontSize }}
              >
                {ayahs.map((_a, i) => {
                  const words = parsedAyahWords[i] || [];
                  const isPlayingThis = activeAyahIdx === i;
                  return (
                    <React.Fragment key={i}>
                      {words.map((w, wi) => (
                        <React.Fragment key={wi}>
                          {renderTajweedWord(w, `${i}-${wi}`, i, i + 1)}
                          {wi < words.length - 1 ? ' ' : ''}
                        </React.Fragment>
                      ))}
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={`Play Ayah ${i + 1}`}
                        title={
                          teachLang === 'bn'
                            ? `আয়াত ${i + 1} তিলাওয়াত শুনুন`
                            : `Listen to Ayah ${i + 1}`
                        }
                        className={`mushaf-ayah-sep${isPlayingThis ? ' playing' : ''}`}
                        onClick={() => playAyahSnippet(i, 0)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            playAyahSnippet(i, 0);
                          }
                        }}
                      >
                        ﴿{toArabicDigits(i + 1)}﴾
                      </span>{' '}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ) : (
            /* AYAH-BY-AYAH VIEW: 'ayah_ar' (Pure Arabic, No Meaning) OR 'meaning' (With Bangla + English) */
            <>
              {surah.number !== 1 && surah.number !== 9 && (
                <div className="card" style={{ textAlign: 'center' }}>
                  <div
                    className="ar ay"
                    lang="ar"
                    dir="rtl"
                    style={{ margin: 0, fontSize: arabicFontSize }}
                  >
                    {parsedBismillah.map((w, wi) => (
                      <React.Fragment key={wi}>
                        {renderTajweedWord(w, `bism-${wi}`, 0, 1)}
                        {wi < parsedBismillah.length - 1 ? ' ' : ''}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              <div id="ay">
                {ayahs.map((a, i) => {
                  const words = parsedAyahWords[i] || [];
                  const ayahRules = Array.from(
                    new Set(words.flatMap((w) => w.rulesPresent))
                  );
                  return (
                    <article
                      key={i}
                      className={`card${activeAyahIdx === i ? ' act' : ''}`}
                      id={`a${i}`}
                    >
                      <div className="top">
                        <span className="num">{i + 1}</span>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {surah.number === 1 && i === 1 && readViewMode === 'meaning' && (
                            <button
                              className="chip"
                              id="simb"
                              style={{ minHeight: 32, fontSize: 11.5 }}
                              onClick={() => setSimilarOpen(true)}
                            >
                              5 similar verses
                            </button>
                          )}
                          {readViewMode === 'ayah_ar' && (
                            <button
                              className="chip"
                              style={{ minHeight: 32, fontSize: 11.5, padding: '0 10px' }}
                              aria-pressed={activeAyahIdx === i && activeAyahLang === 0}
                              onClick={() => playAyahSnippet(i, 0)}
                            >
                              {activeAyahIdx === i && activeAyahLang === 0 ? '❚❚ عربي' : '▶ عربي'}
                            </button>
                          )}
                        </div>
                      </div>

                      <div
                        className="ar ay"
                        lang="ar"
                        dir="rtl"
                        style={{ fontSize: arabicFontSize }}
                      >
                        {words.map((w, wi) => (
                          <React.Fragment key={wi}>
                            {renderTajweedWord(w, `${i}-${wi}`, i, i + 1)}
                            {wi < words.length - 1 ? ' ' : ''}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Per-Ayah Explicit Tajweed Rule Indicators (tap any to highlight across Surah) */}
                      {tajweedEnabled && showTajweedMarks && ayahRules.length > 0 && (
                        <div className="tj-ayah-rules">
                          {ayahRules.map((rid) => {
                            const rm = TAJWEED_RULES[rid];
                            const col = theme === 'dark' ? rm.colorDark : rm.colorLight;
                            const bg = theme === 'dark' ? rm.bgDark : rm.bgLight;
                            const isAct = focusedRule === rid;
                            return (
                              <button
                                key={rid}
                                type="button"
                                className="tj-rule-tag"
                                style={{
                                  background: isAct ? col : bg,
                                  color: isAct ? '#fff' : col,
                                  borderColor: `${col}44`,
                                }}
                                onClick={() => {
                                  setFocusedRule(isAct ? null : rid);
                                  setFocusedMatchIdx(0);
                                }}
                              >
                                <i style={{ background: isAct ? '#fff' : col }} />
                                <span>{rm.name[teachLang].split('(')[0].trim()}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {readViewMode === 'meaning' && (
                        <>
                          <p className="bn" style={{ margin: '2px 0' }}>
                            {a.bn}
                          </p>
                          <p className="en" style={{ margin: '2px 0 8px' }}>
                            {a.en}
                          </p>
                          <div className="rw" style={{ margin: 0 }}>
                            <button
                              className="chip"
                              aria-pressed={activeAyahIdx === i && activeAyahLang === 0}
                              onClick={() => playAyahSnippet(i, 0)}
                            >
                              {activeAyahIdx === i && activeAyahLang === 0 ? '❚❚ عربي' : '▶ عربي'}
                            </button>
                            <button
                              className="chip"
                              aria-pressed={activeAyahIdx === i && activeAyahLang === 1}
                              onClick={() => playAyahSnippet(i, 1)}
                            >
                              {activeAyahIdx === i && activeAyahLang === 1 ? '❚❚ বাংলা' : '▶ বাংলা'}
                            </button>
                            <button
                              className="chip"
                              aria-pressed={activeAyahIdx === i && activeAyahLang === 2}
                              onClick={() => playAyahSnippet(i, 2)}
                            >
                              {activeAyahIdx === i && activeAyahLang === 2 ? '❚❚ EN' : '▶ EN'}
                            </button>
                          </div>
                        </>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {/* Quick Previous / Next Surah Navigation */}
          <div className="mushaf-nav">
            <button
              className="chip"
              disabled={surah.number <= 1}
              onClick={() => {
                if (surah.number > 1) {
                  selectSurah(ALL_SURAHS[surah.number - 2], false);
                  if (mainRef.current) mainRef.current.scrollTop = 0;
                }
              }}
            >
              ‹{' '}
              {surah.number > 1
                ? `${surah.number - 1}. ${ALL_SURAHS[surah.number - 2].en}`
                : teachLang === 'bn'
                ? 'আগের সূরা'
                : 'Prev Surah'}
            </button>
            <button
              className="chip on"
              disabled={surah.number >= 114}
              onClick={() => {
                if (surah.number < 114) {
                  selectSurah(ALL_SURAHS[surah.number], false);
                  if (mainRef.current) mainRef.current.scrollTop = 0;
                }
              }}
            >
              {surah.number < 114
                ? `${surah.number + 1}. ${ALL_SURAHS[surah.number].en}`
                : teachLang === 'bn'
                ? 'পরের সূরা'
                : 'Next Surah'}{' '}
              ›
            </button>
          </div>

          <p className="mut sm">
            Reciting with {RECITERS[reciterIdx].name}.{' '}
            {readViewMode === 'mushaf'
              ? teachLang === 'bn'
                ? 'আয়াত নম্বর ﴿١﴾ ট্যাপ করলে ওই আয়াতের তিলাওয়াত শুনতে পাবেন।'
                : 'Tap any Ayah number ﴿١﴾ to hear its recitation.'
              : 'Tap ▶ عربي on any ayah to hear the reciter’s audio.'}
          </p>
        </section>

        {/* TAB 2: HIFZ MODE */}
        <section id="s2" hidden={tab !== 2}>
          <div className="hd">
            <b>{t.hifzTitle}</b>
            <button
              className="chip"
              style={{ minHeight: 36, padding: '0 12px', fontSize: 12 }}
              onClick={() => setSurahSheetOpen(true)}
            >
              {surah.number}. {surah.en} ▾
            </button>
          </div>

          <div className="card st">
            <div>
              <b id="c1" style={{ color: 'var(--ok)' }}>
                {hifzStatusList.filter((x) => x === 'ok').length}
              </b>
              <span className="mut sm">{t.correct}</span>
            </div>
            <div>
              <b id="c2" style={{ color: 'var(--bad)' }}>
                {hifzMistakes}
              </b>
              <span className="mut sm">{t.mistakes}</span>
            </div>
          </div>

          {hifzTotalPages > 1 && (
            <div className="rw" style={{ marginTop: 0, marginBottom: 10 }}>
              <button
                className="chip"
                disabled={hifzPage === 0}
                onClick={() => {
                  setHifzPage((p) => Math.max(0, p - 1));
                  resetHifzProgress();
                }}
              >
                Prev Ayahs
              </button>
              <span className="chip" style={{ pointerEvents: 'none' }}>
                Ayahs {hifzPage * HIFZ_AYAHS_PER_PAGE + 1}–
                {Math.min(ayahs.length, (hifzPage + 1) * HIFZ_AYAHS_PER_PAGE)}
              </span>
              <button
                className="chip"
                disabled={hifzPage >= hifzTotalPages - 1}
                onClick={() => {
                  setHifzPage((p) => Math.min(hifzTotalPages - 1, p + 1));
                  resetHifzProgress();
                }}
              >
                Next Ayahs
              </button>
            </div>
          )}

          <div className={`card${hifzHideNext ? ' blur' : ''}`} id="hw" dir="rtl" lang="ar">
            {ayahsLoading ? (
              <span className="mut">Loading Surah…</span>
            ) : (
              (() => {
                let globalWordIdx = 0;
                return hifzPageAyahs.map((group) => (
                  <React.Fragment key={group.ayahIndex}>
                    {group.tokens.map((word) => {
                      const k = globalWordIdx++;
                      return (
                        <button
                          key={k}
                          className={`w ${hifzStatusList[k] || ''}`}
                          onClick={() => handleHifzWordTap(k)}
                        >
                          {word}
                        </button>
                      );
                    })}
                    <span className="hifz-ayah-num">
                      ﴿{toArabicDigits(group.ayahIndex + 1)}﴾
                    </span>
                  </React.Fragment>
                ));
              })()
            )}
          </div>

          <div className="lg">
            <span style={{ background: 'var(--okb)', color: 'var(--ok)' }}>{t.correct}</span>
            <span style={{ background: 'var(--badb)', color: 'var(--bad)' }}>{t.mistakes}</span>
            <span style={{ background: 'var(--soft)', color: 'var(--mut)' }}>{t.pending}</span>
          </div>

          <p className="mut" id="hm" role="status">
            {hifzMessage}
          </p>

          <div className="rw">
            <button className="chip on" id="hs" onClick={startHifz}>
              {hifzActive ? t.pause : t.start}
            </button>
            <button className="chip" id="hr2" onClick={resetHifzProgress}>
              {t.reset}
            </button>
            <button
              className="chip"
              id="hd2"
              aria-pressed={hifzHideNext}
              onClick={() => setHifzHideNext((v) => !v)}
            >
              {t.hideNext}
            </button>
            <button
              className="chip"
              onClick={() => {
                playHifzAyahAudio(currentHifzAyah);
                toast(`Playing Ayah ${currentHifzAyah + 1}`);
              }}
            >
              ▶ {t.listenAyah} {currentHifzAyah + 1}
            </button>
          </div>

          <p className="mut sm">
            Recite aloud in Arabic when Start is active, or tap each word right-to-left to verify.
          </p>
        </section>

        {/* TAB 3: MEDIA */}
        <section id="s3" hidden={tab !== 3}>
          <div className="hd">
            <b>{t.mediaTitle}</b>
            <span className="mut">{t.mediaSub}</span>
          </div>

          <div className="card">
            <p style={{ margin: 0 }}>
              Pick audio or video from your phone. A browser can only open the files you choose;
              automatic scanning of the whole phone needs the Android app.
            </p>
            <div className="rw">
              <label className="chip on" htmlFor="fi">
                Add files
              </label>
              <label className="chip" htmlFor="fd">
                Add folder
              </label>
              <label className="chip" htmlFor="sf">
                Subtitle (.srt/.vtt)
              </label>
            </div>
            <input
              id="fi"
              type="file"
              accept="audio/*,video/*"
              multiple
              onChange={(e) => {
                addMediaFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <input
              id="fd"
              type="file"
              {...({ webkitdirectory: '', directory: '' } as any)}
              multiple
              onChange={(e) => {
                addMediaFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <input
              id="sf"
              type="file"
              accept=".srt,.vtt"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (!f) return;
                const txt = await f.text();
                setSubText(txt);
                setSubDelay(0);
                applySubtitles(txt, 0);
                toast('Subtitle added');
              }}
            />
          </div>

          <div className={`vp${locked ? ' lkd' : ''}`} id="vp" ref={vpRef}>
            <div
              className="stage"
              id="sg"
              ref={stageRef}
              onPointerDown={(e) => {
                if (locked || (e.target as HTMLElement).closest('#lkb')) return;
                const v = videoRef.current;
                const sg = stageRef.current;
                if (!v || !sg) return;
                gestureRef.current = {
                  x: e.clientX,
                  y: e.clientY,
                  t: v.currentTime,
                  vo: v.volume,
                  b: brightnessRef.current,
                  m: null,
                  w: sg.getBoundingClientRect(),
                  nt: null,
                };
                try {
                  sg.setPointerCapture(e.pointerId);
                } catch {
                  // ignore
                }
                if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
                holdTimerRef.current = window.setTimeout(() => {
                  if (gestureRef.current && !gestureRef.current.m && !v.paused) {
                    v.playbackRate = 2;
                    heldRef.current = true;
                    showHud('2x speed');
                  }
                }, 500);
              }}
              onPointerMove={(e) => {
                const g = gestureRef.current;
                const v = videoRef.current;
                if (!g || !v) return;
                const dx = e.clientX - g.x;
                const dy = e.clientY - g.y;
                if (!g.m && Math.max(Math.abs(dx), Math.abs(dy)) > 14) {
                  if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
                  g.m =
                    Math.abs(dx) > Math.abs(dy)
                      ? 's'
                      : g.x - g.w.left < g.w.width / 2
                      ? 'b'
                      : 'v';
                }
                if (g.m === 's') {
                  g.nt = Math.max(0, Math.min(v.duration || 0, g.t + (dx / g.w.width) * 90));
                  showHud(fmtTime(g.nt));
                } else if (g.m === 'v') {
                  v.volume = Math.max(0, Math.min(1, g.vo - dy / 180));
                  showHud(`Volume ${Math.round(v.volume * 100)}%`);
                } else if (g.m === 'b') {
                  brightnessRef.current = Math.max(0.3, Math.min(1.6, g.b - dy / 180));
                  v.style.filter = `brightness(${brightnessRef.current})`;
                  showHud(`Brightness ${Math.round(brightnessRef.current * 100)}%`);
                }
              }}
              onPointerUp={() => {
                if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
                const g = gestureRef.current;
                const v = videoRef.current;
                gestureRef.current = null;
                if (!g || !v) return;
                if (heldRef.current) {
                  heldRef.current = false;
                  v.playbackRate = MEDIA_SPEEDS[mediaSpeedIdx];
                  return;
                }
                if (g.m === 's') {
                  if (g.nt !== null) v.currentTime = g.nt;
                  return;
                }
                if (g.m) return;
                const now = Date.now();
                if (now - lastTapRef.current < 320) {
                  if (tapTimerRef.current) window.clearTimeout(tapTimerRef.current);
                  lastTapRef.current = 0;
                  const isLeft = g.x - g.w.left < g.w.width / 2;
                  v.currentTime = Math.max(
                    0,
                    Math.min(v.duration || 0, v.currentTime + (isLeft ? -10 : 10))
                  );
                  showHud(isLeft ? '-10s' : '+10s');
                } else {
                  lastTapRef.current = now;
                  tapTimerRef.current = window.setTimeout(() => {
                    if (v.paused) {
                      ensureMediaAudio();
                      v.play().catch(() => {});
                    } else {
                      v.pause();
                    }
                  }, 320);
                }
              }}
              onPointerCancel={() => {
                if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
                gestureRef.current = null;
                if (heldRef.current && videoRef.current) {
                  heldRef.current = false;
                  videoRef.current.playbackRate = MEDIA_SPEEDS[mediaSpeedIdx];
                }
              }}
            >
              <video
                id="vd"
                ref={videoRef}
                playsInline
                style={{
                  objectFit: MEDIA_FITS[fitIdx],
                  visibility: currentMedia?.kind === 'a' ? 'hidden' : 'visible',
                }}
              />
              <canvas
                id="viz"
                ref={vizCanvasRef}
                width={320}
                height={180}
                style={{ display: currentMedia?.kind === 'a' ? 'block' : 'none' }}
              />
              <div className="hud" id="hud" hidden={!hudVisible}>
                {hudMsg}
              </div>
              <button
                className="ib lk"
                id="lkb"
                aria-label="Lock controls"
                aria-pressed={locked}
                onClick={() => {
                  const next = !locked;
                  setLocked(next);
                  showHud(next ? 'Controls locked' : 'Controls unlocked');
                }}
              >
                <Icon d="M6 11h12v9H6zM8 11V8a4 4 0 018 0v3" />
              </button>
            </div>

            <div className="ctrl">
              <div id="vt" style={{ fontWeight: 600, marginBottom: 4 }}>
                {currentMedia ? currentMedia.name : 'Nothing playing'}
              </div>
              <input
                type="range"
                id="seek"
                min={0}
                max={1000}
                value={mediaDur ? Math.round((mediaTime / mediaDur) * 1000) : 0}
                aria-label="Seek"
                onChange={(e) => {
                  const v = videoRef.current;
                  if (v && v.duration) {
                    v.currentTime = (Number(e.target.value) / 1000) * v.duration;
                  }
                }}
              />
              <div className="tm">
                <span id="m1">{fmtTime(mediaTime)}</span>
                <span id="m2">{fmtTime(mediaDur)}</span>
              </div>

              <div className="ctl" style={{ gap: 12 }}>
                <button className="ib" id="mp" aria-label="Previous" onClick={prevMedia}>
                  <Icon d="M6 5v14M18 5L8 12l10 7z" />
                </button>
                <button
                  className="ib"
                  id="mb"
                  aria-label="Back 10 seconds"
                  onClick={() => {
                    const v = videoRef.current;
                    if (v) v.currentTime = Math.max(0, v.currentTime - 10);
                  }}
                >
                  <Icon d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
                </button>
                <button
                  className={`ib play big${mediaPlaying ? ' playing' : ''}`}
                  id="mpl"
                  aria-label={mediaPlaying ? 'Pause' : 'Play'}
                  onClick={() => {
                    const v = videoRef.current;
                    if (!v) return;
                    if (v.paused) {
                      ensureMediaAudio();
                      if (mediaAcRef.current?.state === 'suspended') {
                        mediaAcRef.current.resume().catch(() => {});
                      }
                      v.play().catch(() => {});
                    } else {
                      v.pause();
                    }
                  }}
                >
                  <Icon d={mediaPlaying ? 'M8 5v14M16 5v14' : 'M8 5l11 7-11 7z'} />
                </button>
                <button
                  className="ib"
                  id="mf"
                  aria-label="Forward 10 seconds"
                  onClick={() => {
                    const v = videoRef.current;
                    if (v) v.currentTime = Math.min(v.duration || 0, v.currentTime + 10);
                  }}
                >
                  <Icon d="M13 17l5-5-5-5M6 17l5-5-5-5" />
                </button>
                <button className="ib" id="mn" aria-label="Next" onClick={nextMedia}>
                  <Icon d="M18 5v14M6 5l10 7-10 7z" />
                </button>
              </div>

              <div className="rw">
                <button
                  className="chip"
                  id="bShuf"
                  aria-pressed={shuffle}
                  onClick={() => setShuffle((s) => !s)}
                >
                  Shuffle
                </button>
                <button
                  className="chip"
                  id="bRep"
                  onClick={() => setRepeatMode((r) => ((r + 1) % 3) as 0 | 1 | 2)}
                >
                  {REPEAT_LABELS[repeatMode]}
                </button>
                <button
                  className="chip"
                  id="bSpd"
                  onClick={() => {
                    const next = (mediaSpeedIdx + 1) % MEDIA_SPEEDS.length;
                    setMediaSpeedIdx(next);
                    if (videoRef.current) videoRef.current.playbackRate = MEDIA_SPEEDS[next];
                  }}
                >
                  Speed {MEDIA_SPEEDS[mediaSpeedIdx]}x
                </button>
                <button
                  className="chip"
                  id="bFit"
                  onClick={() => setFitIdx((f) => (f + 1) % MEDIA_FITS.length)}
                >
                  {MEDIA_FIT_LABELS[fitIdx]}
                </button>
                <button
                  className="chip"
                  id="bAB"
                  onClick={() => {
                    const v = videoRef.current;
                    if (!v) return;
                    const next = ((abMode + 1) % 3) as 0 | 1 | 2;
                    if (next === 1) {
                      setAbPointA(v.currentTime);
                      setAbMode(1);
                    } else if (next === 2) {
                      if (v.currentTime <= abPointA + 1) {
                        setAbMode(0);
                        toast('Pick point B after point A');
                      } else {
                        setAbPointB(v.currentTime);
                        setAbMode(2);
                      }
                    } else {
                      setAbMode(0);
                    }
                  }}
                >
                  {abMode === 1
                    ? `A at ${fmtTime(abPointA)}`
                    : abMode === 2
                    ? 'Looping A–B'
                    : 'A–B'}
                </button>
                <button
                  className="chip"
                  id="bCC"
                  onClick={() => {
                    const t = videoRef.current?.textTracks?.[0];
                    if (t) t.mode = t.mode === 'showing' ? 'hidden' : 'showing';
                    else toast('Add a subtitle file first');
                  }}
                >
                  Subtitle on/off
                </button>
                <button
                  className="chip"
                  id="bSm"
                  onClick={() => {
                    if (!subText) return toast('Add a subtitle file first');
                    const d = subDelay - 0.5;
                    setSubDelay(d);
                    applySubtitles(subText, d);
                    toast(`Subtitle delay ${d.toFixed(1)}s`);
                  }}
                >
                  Sub −0.5s
                </button>
                <button
                  className="chip"
                  id="bSp"
                  onClick={() => {
                    if (!subText) return toast('Add a subtitle file first');
                    const d = subDelay + 0.5;
                    setSubDelay(d);
                    applySubtitles(subText, d);
                    toast(`Subtitle delay ${d.toFixed(1)}s`);
                  }}
                >
                  Sub +0.5s
                </button>
                <button
                  className="chip"
                  id="bPip"
                  onClick={() => {
                    const v = videoRef.current;
                    if (v && document.pictureInPictureEnabled && v.requestPictureInPicture) {
                      document.pictureInPictureElement
                        ? document.exitPictureInPicture()
                        : v
                            .requestPictureInPicture()
                            .catch(() => toast('Pop-out is not available for this file'));
                    } else {
                      toast('Pop-out is not supported in this browser');
                    }
                  }}
                >
                  Pop-out
                </button>
                <button
                  className="chip"
                  id="bFs"
                  onClick={() => {
                    const p = vpRef.current;
                    if (!p) return;
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                    } else if (p.requestFullscreen) {
                      p.requestFullscreen()
                        .then(() => {
                          try {
                            (screen.orientation as any)?.lock?.('landscape')?.catch(() => {});
                          } catch {
                            // ignore
                          }
                        })
                        .catch(() => toast('Fullscreen is not available'));
                    } else {
                      toast('Fullscreen is not supported in this browser');
                    }
                  }}
                >
                  Fullscreen
                </button>
                <button
                  className="chip"
                  id="bSlp"
                  onClick={() => {
                    if (mediaSleepTimerRef.current) window.clearTimeout(mediaSleepTimerRef.current);
                    const opts = [0, 15, 30, 60];
                    const next = opts[(opts.indexOf(mediaSleepMin) + 1) % opts.length];
                    setMediaSleepMin(next);
                    if (next > 0) {
                      mediaSleepTimerRef.current = window.setTimeout(() => {
                        videoRef.current?.pause();
                        setMediaSleepMin(0);
                        toast('Sleep timer finished. Playback stopped.');
                      }, next * 60000);
                    }
                  }}
                >
                  {mediaSleepMin ? `Sleep: ${mediaSleepMin} min` : 'Sleep: off'}
                </button>
              </div>

              <div className="eq">
                <label>
                  Bass
                  <input
                    type="range"
                    id="eb"
                    min={-10}
                    max={10}
                    value={bassGain}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBassGain(val);
                      if (bassFilterRef.current) bassFilterRef.current.gain.value = val;
                    }}
                  />
                </label>
                <label>
                  Treble
                  <input
                    type="range"
                    id="et"
                    min={-10}
                    max={10}
                    value={trebleGain}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTrebleGain(val);
                      if (trebleFilterRef.current) trebleFilterRef.current.gain.value = val;
                    }}
                  />
                </label>
              </div>

              <p className="mut sm" style={{ margin: '8px 0 0' }}>
                Swipe the picture: sideways to seek, left side up/down for brightness, right side
                up/down for volume. Double-tap left or right for 10 seconds. Hold to play at 2x.
              </p>
            </div>
          </div>

          <div className="rw" id="qf" style={{ marginTop: 0 }}>
            {(
              [
                ['all', 'All'],
                ['a', 'Music'],
                ['v', 'Video'],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                className="chip"
                aria-pressed={queueFilter === val}
                onClick={() => setQueueFilter(val)}
              >
                {label}
              </button>
            ))}
          </div>

          <div id="fl">
            {queue.length === 0 ? (
              <span className="mut">No files yet. Tap “Add files”.</span>
            ) : (
              queue.map((q, i) => {
                if (queueFilter !== 'all' && q.kind !== queueFilter) return null;
                return (
                  <button
                    key={`${q.name}-${i}`}
                    className="chip"
                    aria-pressed={i === queueIdx}
                    onClick={() => loadMediaTrack(i, true)}
                  >
                    {(q.kind === 'a' ? '♪ ' : '▶ ') + q.name}
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* TAB 4: BOOKS & PDFs */}
        <section id="s4" hidden={tab !== 4}>
          <div className="hd">
            <b>{t.booksTitle}</b>
            <span className="mut">কিতাব ও পিডিএফ</span>
          </div>

          <div className="rw sc" id="pfl" style={{ margin: '0 0 10px' }}>
            {PDF_CATEGORIES.map((c, i) => (
              <button
                key={c}
                className="chip"
                aria-pressed={i === pdfCatFilter}
                onClick={() => setPdfCatFilter(i)}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            className="chip on"
            id="padd"
            onClick={() => {
              resetAddPdfForm();
              setAddPdfOpen(true);
            }}
          >
            {t.addPdf}
          </button>

          <div id="plist" style={{ marginTop: 12 }}>
            {filteredPdfs.length === 0 ? (
              <p className="mut">
                No PDFs here yet. Tap “Add PDF” to add your 15-line Hifz Quran or any other book.
              </p>
            ) : (
              filteredPdfs.map((p) => {
                const localBlobUrl = p.file ? pdfBlobUrls[p.id] : undefined;
                const href = localBlobUrl || p.url;
                const coverSrc = p.coverFile ? coverBlobUrls[p.id] : p.coverUrl;
                const isDriveUrl = Boolean(p.url && /drive\.google\.com/i.test(p.url));

                return (
                  <div className="card" key={p.id}>
                    {coverSrc && (
                      <button
                        type="button"
                        className="pdf-cover-link"
                        style={{ width: '100%', padding: 0, cursor: 'pointer' }}
                        onClick={() => setActiveReaderPdf(p)}
                      >
                        <img className="pdf-cover-img" src={coverSrc} alt={p.t} />
                        <div className="pdf-cover-glow" />
                      </button>
                    )}

                    <b>{p.t}</b>
                    <div className="mut sm" style={{ margin: '2px 0 0' }}>
                      {p.cat} · {p.file ? t.pdfOfflineReady : t.driveLinkOnline}
                    </div>

                    <div className="rw">
                      <button
                        className="chip on"
                        onClick={() => setActiveReaderPdf(p)}
                      >
                        📖 {t.readBookBtn}
                      </button>
                      {p.url && !p.file && (
                        <button
                          className="chip"
                          disabled={pdfCachingId === p.id}
                          onClick={() => handleCachePdfOffline(p)}
                        >
                          {pdfCachingId === p.id ? t.savingPdfOffline : `⬇ ${t.savePdfOfflineBtn}`}
                        </button>
                      )}
                      {href && !isDriveUrl && !p.file && (
                        <a
                          className="chip"
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open Link
                        </a>
                      )}
                      <button
                        className="chip"
                        onClick={() => {
                          resetAddPdfForm();
                          setEditCoverPdfId(p.id);
                          setNewCoverUrl(p.coverUrl || '');
                          setNewCoverPreview(coverSrc || '');
                          setAddPdfOpen(true);
                        }}
                      >
                        {coverSrc ? 'Edit Cover' : 'Add Picture'}
                      </button>
                      {!p.builtIn && (
                        <button className="chip" onClick={() => handleDeletePdf(p.id)}>
                          {deleteArmedId === p.id ? 'Tap again to delete' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <p className="mut sm">
            {appLang === 'bn'
              ? 'কিতাব পড়তে “পড়ুন (কিতাব)” চাপলে সম্পূর্ণ স্ক্রিনে বই মোড (পৃষ্ঠা উল্টিয়ে) বা স্ক্রল মোডে পড়তে পারবেন। গুগল ড্রাইভের ফাইলও “অফলাইনে সেভ” করে ইন্টারনেট ছাড়া পড়া যাবে।'
              : 'Tap “Read Kitab” for fullscreen Book Mode (page flip) or Vertical Scroll reading. You can also save Drive PDFs offline inside ZIKRIFY.'}
          </p>
        </section>
      </main>

      {/* BOTTOM SHEETS (#sh) */}
      {(similarOpen ||
        addPdfOpen ||
        surahSheetOpen ||
        settingsOpen ||
        offlinePromptOpen ||
        sleepSheetOpen) && (
        <div
          id="sh"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSimilarOpen(false);
              setAddPdfOpen(false);
              setSurahSheetOpen(false);
              setSettingsOpen(false);
              setSleepSheetOpen(false);
              dismissOfflinePrompt();
            }
          }}
        >
          {sleepSheetOpen && (
            <div className="sheet">
              <div className="top">
                <h2 style={{ fontSize: 18 }}>
                  {appLang === 'bn' ? 'স্লিপ টাইমার' : 'Sleep Timer'}
                </h2>
                <button className="chip" onClick={() => setSleepSheetOpen(false)}>
                  {t.close}
                </button>
              </div>
              <p className="mut sm">
                {appLang === 'bn'
                  ? '২ মিনিট থেকে ১ ঘণ্টা পর্যন্ত প্রিসেট বেছে নিন অথবা নিজের মতো সময় সেট করুন।'
                  : 'Choose a preset from 2 min to 1 hour, or set your own custom duration.'}
              </p>

              {sleepLeft > 0 && (
                <div
                  className="card"
                  style={{
                    background: 'var(--soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div className="mut" style={{ fontSize: 11.5 }}>
                      {appLang === 'bn' ? 'সক্রিয় টাইমার' : 'Active countdown'}
                    </div>
                    <b style={{ fontSize: 20, color: 'var(--pri)' }}>
                      {sleepLeft >= 3600
                        ? `${Math.floor(sleepLeft / 3600)}:${String(
                            Math.floor((sleepLeft % 3600) / 60)
                          ).padStart(2, '0')}:${String(sleepLeft % 60).padStart(2, '0')}`
                        : fmtTime(sleepLeft)}
                    </b>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="chip"
                      onClick={() => {
                        setSleepLeft((prev) => prev + 300);
                        toast(
                          appLang === 'bn' ? '+৫ মিনিট বাড়ানো হয়েছে' : '+5 minutes added'
                        );
                      }}
                    >
                      +5m
                    </button>
                    <button
                      className="chip"
                      onClick={() => {
                        setSleepLeft(0);
                        toast(
                          appLang === 'bn'
                            ? 'স্লিপ টাইমার বন্ধ করা হয়েছে'
                            : 'Sleep timer turned off'
                        );
                      }}
                    >
                      {appLang === 'bn' ? 'বন্ধ করুন' : 'Turn Off'}
                    </button>
                  </div>
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <button
                  className="chip"
                  aria-pressed={sleepLeft === 0}
                  style={{ justifyContent: 'center', padding: '0 8px' }}
                  onClick={() => {
                    setSleepLeft(0);
                    setSleepSheetOpen(false);
                    toast(
                      appLang === 'bn' ? 'স্লিপ টাইমার বন্ধ করা হয়েছে' : 'Sleep timer off'
                    );
                  }}
                >
                  {appLang === 'bn' ? 'বন্ধ' : 'Off'}
                </button>
                {SLEEP_PRESET_MINUTES.map((mins) => {
                  const secs = mins * 60;
                  const active = sleepLeft > 0 && Math.ceil(sleepLeft / 60) === mins;
                  return (
                    <button
                      key={mins}
                      className="chip"
                      aria-pressed={active}
                      style={{ justifyContent: 'center', padding: '0 8px' }}
                      onClick={() => {
                        setSleepLeft(secs);
                        setSleepSheetOpen(false);
                        toast(
                          appLang === 'bn'
                            ? `${
                                mins === 60 ? '১ ঘণ্টা' : `${toBengaliDigits(mins)} মিনিট`
                              } পর তিলাওয়াত বন্ধ হবে`
                            : `Playback stops in ${mins === 60 ? '1 hour' : `${mins} minutes`}`
                        );
                      }}
                    >
                      {mins === 60
                        ? appLang === 'bn'
                          ? '১ ঘণ্টা'
                          : '1 hr'
                        : appLang === 'bn'
                        ? `${toBengaliDigits(mins)} মি.`
                        : `${mins}m`}
                    </button>
                  );
                })}
              </div>

              <div className="card" style={{ marginBottom: 4 }}>
                <b style={{ fontSize: 13.5, display: 'block', marginBottom: 8 }}>
                  {appLang === 'bn' ? 'নিজের মতো সময় নির্ধারণ করুন' : 'Custom Time'}
                </b>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <label className="range-field">
                    <span>{appLang === 'bn' ? 'ঘণ্টা (Hours)' : 'Hours'}</span>
                    <input
                      type="number"
                      min={0}
                      max={12}
                      value={customSleepHours}
                      onChange={(e) => setCustomSleepHours(e.target.value)}
                    />
                  </label>
                  <label className="range-field">
                    <span>{appLang === 'bn' ? 'মিনিট (Minutes)' : 'Minutes'}</span>
                    <input
                      type="number"
                      min={0}
                      max={300}
                      value={customSleepMins}
                      onChange={(e) => setCustomSleepMins(e.target.value)}
                    />
                  </label>
                </div>
                <button
                  className="btn2 bq"
                  style={{ width: '100%' }}
                  onClick={() => {
                    const h = Math.max(0, Math.min(12, parseInt(customSleepHours || '0', 10) || 0));
                    const m = Math.max(0, Math.min(300, parseInt(customSleepMins || '0', 10) || 0));
                    const totalMins = h * 60 + m;
                    if (totalMins <= 0) {
                      toast(
                        appLang === 'bn'
                          ? 'কমপক্ষে ১ মিনিট নির্ধারণ করুন'
                          : 'Please enter at least 1 minute'
                      );
                      return;
                    }
                    setSleepLeft(totalMins * 60);
                    setSleepSheetOpen(false);
                    toast(
                      appLang === 'bn'
                        ? `${
                            h > 0 ? `${toBengaliDigits(h)} ঘণ্টা ` : ''
                          }${m > 0 ? `${toBengaliDigits(m)} মিনিট ` : ''}পর তিলাওয়াত বন্ধ হবে`
                        : `Playback stops in ${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m` : ''}`.trim()
                    );
                  }}
                >
                  {appLang === 'bn' ? 'কাস্টম টাইমার সেট করুন' : 'Set Custom Timer'}
                </button>
              </div>
            </div>
          )}

          {similarOpen && (
            <div className="sheet">
              <div className="top">
                <h2 style={{ fontSize: 18 }}>Similar verses</h2>
                <button className="chip" onClick={() => setSimilarOpen(false)}>
                  Close
                </button>
              </div>
              <p className="mut sm">
                Al-Fatihah 1:2 · 5 found. Differences are highlighted.
              </p>
              {SIMILAR_VERSES.map((x) => (
                <div className="card" key={x[0]}>
                  <div className="top">
                    <b>{x[0]}</b>
                    <span className="mut sm">{x[3]}</span>
                  </div>
                  <div className="ar ay" lang="ar" dir="rtl" style={{ fontSize: 24 }}>
                    <span className="d">{x[1]}</span> {x[2]}
                  </div>
                </div>
              ))}
              <p className="mut sm">
                Verify mutashabihat nuances with an experienced hafiz.
              </p>
            </div>
          )}

          {addPdfOpen && (
            <div className="sheet">
              <div className="top">
                <h2 style={{ fontSize: 18 }}>
                  {editCoverPdfId ? 'Set Cover Picture' : 'Add PDF'}
                </h2>
                <button
                  className="chip"
                  onClick={() => {
                    setAddPdfOpen(false);
                    resetAddPdfForm();
                  }}
                >
                  Close
                </button>
              </div>
              <div className="fm" style={{ marginTop: 12 }}>
                {!editCoverPdfId && (
                  <>
                    <input
                      type="text"
                      id="pt1"
                      placeholder="Title, e.g. Hifz Quran Part 1"
                      aria-label="Title"
                      value={newPdfTitle}
                      onChange={(e) => setNewPdfTitle(e.target.value)}
                    />
                    <select
                      id="pc1"
                      aria-label="Category"
                      value={newPdfCat}
                      onChange={(e) => setNewPdfCat(e.target.value)}
                    >
                      {PDF_CATEGORIES.slice(1).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      type="url"
                      id="pu"
                      placeholder="Google Drive link (https://…)"
                      aria-label="Google Drive link"
                      value={newPdfDriveUrl}
                      onChange={(e) => setNewPdfDriveUrl(e.target.value)}
                    />
                    <div className="mut sm" style={{ textAlign: 'center', margin: 0 }}>
                      or
                    </div>
                    <label className="chip" htmlFor="pfi">
                      {newPdfFile
                        ? newPdfFile.name
                        : 'Choose a PDF from your phone (works offline)'}
                    </label>
                    <input
                      type="file"
                      id="pfi"
                      accept="application/pdf,.pdf"
                      onChange={(e) => {
                        setNewPdfFile(e.target.files?.[0] || null);
                        e.target.value = '';
                      }}
                    />
                  </>
                )}

                <p className="mut sm" style={{ margin: '4px 0 0' }}>
                  Cover picture (highlighted above the Open button)
                </p>

                {newCoverPreview && (
                  <div className="pdf-cover-link" style={{ marginBottom: 4 }}>
                    <img
                      className="pdf-cover-img"
                      style={{ height: 128 }}
                      src={newCoverPreview}
                      alt="Cover preview"
                    />
                  </div>
                )}

                <div className="rw" style={{ marginTop: 0 }}>
                  <label className="chip" htmlFor="pci">
                    {newCoverFile ? newCoverFile.name : 'Choose cover picture'}
                  </label>
                  <input
                    type="file"
                    id="pci"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      e.target.value = '';
                      setNewCoverFile(f);
                      if (f) {
                        setNewCoverUrl('');
                        setNewCoverPreview(URL.createObjectURL(f));
                      }
                    }}
                  />
                  {PDF_COVER_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      className="chip"
                      aria-pressed={newCoverUrl === preset.url}
                      onClick={() => {
                        setNewCoverFile(null);
                        setNewCoverUrl(preset.url);
                        setNewCoverPreview(preset.url);
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                  {newCoverPreview && (
                    <button
                      type="button"
                      className="chip"
                      onClick={() => {
                        setNewCoverFile(null);
                        setNewCoverUrl('');
                        setNewCoverPreview('');
                      }}
                    >
                      Remove picture
                    </button>
                  )}
                </div>

                <input
                  type="url"
                  placeholder="Or paste cover image URL (https://…)"
                  aria-label="Cover image URL"
                  value={newCoverUrl.startsWith('data:') ? '' : newCoverUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewCoverFile(null);
                    setNewCoverUrl(val);
                    setNewCoverPreview(val);
                  }}
                />

                <button
                  className="chip on"
                  id="psv"
                  style={{ justifyContent: 'center' }}
                  onClick={handleSavePdf}
                >
                  Save
                </button>
                {!editCoverPdfId && (
                  <p className="mut sm" style={{ margin: 0 }}>
                    In Google Drive, set sharing to “Anyone with the link” before you copy the link.
                  </p>
                )}
              </div>
            </div>
          )}

          {surahSheetOpen && (
            <div className="sheet">
              <div className="top">
                <h2 style={{ fontSize: 18 }}>Al-Quran · 114 Surahs</h2>
                <button className="chip" onClick={() => setSurahSheetOpen(false)}>
                  Close
                </button>
              </div>
              <div className="fm" style={{ marginTop: 10 }}>
                <input
                  type="text"
                  placeholder="Search Surah name or number (1–114)…"
                  value={surahQuery}
                  onChange={(e) => setSurahQuery(e.target.value)}
                />
              </div>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredSurahs.map((s) => {
                  const isSavedOffline = cachedAudioSurahs.has(s.number);
                  return (
                    <button
                      key={s.number}
                      className={`rcd${s.number === surah.number ? ' on' : ''}`}
                      aria-pressed={s.number === surah.number}
                      onClick={() => selectSurah(s, true)}
                    >
                      <span className="av">{s.number}</span>
                      <span style={{ flex: 1 }}>
                        Surah {s.en} ({s.ayahs} ayahs)
                        {isSavedOffline && (
                          <span
                            style={{
                              display: 'inline-block',
                              marginLeft: 6,
                              fontSize: 10.5,
                              fontWeight: 700,
                              color: s.number === surah.number ? 'inherit' : 'var(--ok)',
                            }}
                          >
                            ✓ Offline
                          </span>
                        )}
                      </span>
                      <span className="ar" lang="ar" dir="rtl" style={{ fontSize: 20 }}>
                        {s.ar}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {settingsOpen && (
            <div className="sheet">
              <div className="top">
                <h2 style={{ fontSize: 18 }}>{t.settingsTitle}</h2>
                <button
                  className="chip"
                  onClick={() => {
                    setSettingsOpen(false);
                    if (bulkDownloading) {
                      toast(
                        appLang === 'bn'
                          ? 'ব্যাকগ্রাউন্ডে ডাউনলোড চলতে থাকবে…'
                          : 'Download continues in the background…'
                      );
                    }
                  }}
                >
                  {bulkDownloading ? (appLang === 'bn' ? 'মিনিমাইজ' : 'Minimize') : t.close}
                </button>
              </div>

              <div className="seg" role="tablist">
                <button
                  role="tab"
                  aria-selected={settingsSection === 'general'}
                  className={settingsSection === 'general' ? 'on' : ''}
                  onClick={() => setSettingsSection('general')}
                >
                  {t.tabGeneral}
                </button>
                <button
                  role="tab"
                  aria-selected={settingsSection === 'about'}
                  className={settingsSection === 'about' ? 'on' : ''}
                  onClick={() => setSettingsSection('about')}
                >
                  {t.tabAbout}
                </button>
              </div>

              {settingsSection === 'general' ? (
                <div>
                  {/* Theme Appearance */}
                  <div className="card">
                    <b>{t.appearanceTitle}</b>
                    <div className="rw">
                      <button
                        className="chip"
                        aria-pressed={theme === 'light'}
                        onClick={() => {
                          if (theme !== 'light') toggleTheme();
                        }}
                      >
                        ☀ {t.themeLight}
                      </button>
                      <button
                        className="chip"
                        aria-pressed={theme === 'dark'}
                        onClick={() => {
                          if (theme !== 'dark') toggleTheme();
                        }}
                      >
                        ☾ {t.themeDark}
                      </button>
                    </div>
                  </div>

                  {/* Language Switcher */}
                  <div className="card">
                    <b>{t.languageTitle}</b>
                    <div className="rw">
                      <button
                        className="chip"
                        aria-pressed={appLang === 'en'}
                        onClick={() => changeAppLang('en')}
                      >
                        English
                      </button>
                      <button
                        className="chip"
                        aria-pressed={appLang === 'bn'}
                        onClick={() => changeAppLang('bn')}
                      >
                        বাংলা
                      </button>
                    </div>
                  </div>

                  {/* Offline Data Manager: Dual Systems + Pause/Resume + Background */}
                  <div className="card">
                    <b>{t.offlineManagerTitle}</b>
                    <div className="stat-grid">
                      <div className="stat-box">
                        <b>{offlineTextCount} / 114</b>
                        <span>{t.textCoverage}</span>
                      </div>
                      <div className="stat-box">
                        <b>{offlineAudioCount} / 114</b>
                        <span>
                          {t.audioCoverage} ({RECITERS[packReciterIdx].name.split(' ')[0]})
                        </span>
                      </div>
                    </div>
                    {storageBytes !== null && (
                      <div className="mut sm" style={{ marginBottom: 4 }}>
                        {t.storageUsed}: {(storageBytes / (1024 * 1024)).toFixed(1)} MB
                      </div>
                    )}

                    {/* Active or Paused Job Progress Panel */}
                    {(dlJob.status === 'running' || dlJob.status === 'paused') && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: 12,
                          borderRadius: 16,
                          background: 'var(--bg)',
                          border: '1px solid var(--line)',
                        }}
                      >
                        <div className="tm">
                          <b>
                            {dlJob.status === 'running' ? t.bgDownloadingLabel : t.pausedLabel}
                          </b>
                          <b>{Math.round((dlJob.completed / Math.max(1, dlJob.total)) * 100)}%</b>
                        </div>
                        <div className="mut" style={{ fontSize: 11.5, marginTop: 2 }}>
                          {dlJob.label} ({dlJob.completed}/{dlJob.total})
                        </div>
                        <div className="pbar">
                          <i
                            style={{
                              width: `${Math.round(
                                (dlJob.completed / Math.max(1, dlJob.total)) * 100
                              )}%`,
                            }}
                          />
                        </div>
                        <div className="rw" style={{ marginTop: 8 }}>
                          {dlJob.status === 'running' ? (
                            <>
                              <button className="chip on" onClick={pauseBulkDownload}>
                                ⏸ {t.pauseBtn}
                              </button>
                              <button
                                className="chip"
                                onClick={() => {
                                  setSettingsOpen(false);
                                  toast(
                                    appLang === 'bn'
                                      ? 'ব্যাকগ্রাউন্ডে ডাউনলোড চলতে থাকবে…'
                                      : 'Download continues in background…'
                                  );
                                }}
                              >
                                {t.minimizeBgBtn}
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="chip on" onClick={resumeBulkDownload}>
                                ▶ {t.resumeBtn}
                              </button>
                              <button className="chip" onClick={clearDlJob}>
                                {appLang === 'bn' ? 'বাতিল' : 'Discard'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="fm" style={{ marginTop: 10 }}>
                      <select
                        aria-label={t.reciterLabel}
                        value={packReciterIdx}
                        disabled={bulkDownloading}
                        onChange={(e) => setPackReciterIdx(Number(e.target.value))}
                      >
                        {RECITERS.map((r, idx) => (
                          <option key={r.name} value={idx}>
                            {t.reciterLabel}: {r.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Two Offline Download Systems */}
                    <div className="seg" style={{ marginTop: 10 }}>
                      <button
                        className={dlSystemTab === 'full' ? 'on' : ''}
                        onClick={() => setDlSystemTab('full')}
                      >
                        {appLang === 'bn' ? '১. পূর্ণ সফটওয়্যার' : '1. Full Software'}
                      </button>
                      <button
                        className={dlSystemTab === 'filtered' ? 'on' : ''}
                        onClick={() => setDlSystemTab('filtered')}
                      >
                        {appLang === 'bn' ? '২. ফিল্টার তিলাওয়াত' : '2. Filter Audio'}
                      </button>
                    </div>

                    {dlSystemTab === 'full' ? (
                      <div>
                        <p className="mut sm" style={{ marginTop: 0 }}>
                          {t.sys1Desc}
                        </p>
                        <div className="rw">
                          <button
                            className="chip on"
                            disabled={bulkDownloading}
                            onClick={() =>
                              runBulkOfflineDownload({
                                mode: 'full',
                                includeText: true,
                                includeAudio: true,
                                reciterIndex: packReciterIdx,
                                force: false,
                              })
                            }
                          >
                            {t.downloadFullPack}
                          </button>
                          <button
                            className="chip"
                            disabled={bulkDownloading}
                            onClick={() =>
                              runBulkOfflineDownload({
                                mode: 'full',
                                includeText: true,
                                includeAudio: false,
                                reciterIndex: packReciterIdx,
                                force: false,
                              })
                            }
                          >
                            {appLang === 'bn' ? 'শুধু টেক্সট (১১৪ সূরা)' : 'Text Only (114)'}
                          </button>
                          <button
                            className="chip"
                            disabled={bulkDownloading}
                            onClick={() =>
                              runBulkOfflineDownload({
                                mode: 'full',
                                includeText: true,
                                includeAudio: true,
                                reciterIndex: packReciterIdx,
                                force: true,
                              })
                            }
                          >
                            {t.redownloadFresh}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="mut sm" style={{ marginTop: 0 }}>
                          {t.sys2Desc}
                        </p>
                        <div className="rw" style={{ marginTop: 4 }}>
                          {(
                            [
                              ['all', appLang === 'bn' ? 'সব ১১৪ সূরা' : 'All 114'],
                              ['juz_amma', appLang === 'bn' ? 'আমপারা (৭৮–১১৪)' : 'Juz Amma (78–114)'],
                              ['last_10', appLang === 'bn' ? 'শেষ ১০ সূরা' : 'Last 10 (105–114)'],
                              ['custom', appLang === 'bn' ? 'কাস্টম রেঞ্জ' : 'Custom Range'],
                            ] as const
                          ).map(([id, label]) => (
                            <button
                              key={id}
                              className="chip"
                              aria-pressed={audioFilterPreset === id}
                              disabled={bulkDownloading}
                              onClick={() => setAudioFilterPreset(id)}
                            >
                              {label}
                            </button>
                          ))}
                        </div>

                        {audioFilterPreset === 'custom' && (
                          <div className="range-pair">
                            <div className="range-field">
                              <label>{appLang === 'bn' ? 'শুরু সূরা (১–১১৪)' : 'From Surah (1–114)'}</label>
                              <input
                                type="number"
                                min={1}
                                max={114}
                                value={filterStartSurah}
                                disabled={bulkDownloading}
                                onChange={(e) => setFilterStartSurah(Number(e.target.value) || 1)}
                              />
                            </div>
                            <div className="range-field">
                              <label>{appLang === 'bn' ? 'শেষ সূরা (১–১১৪)' : 'To Surah (1–114)'}</label>
                              <input
                                type="number"
                                min={1}
                                max={114}
                                value={filterEndSurah}
                                disabled={bulkDownloading}
                                onChange={(e) => setFilterEndSurah(Number(e.target.value) || 114)}
                              />
                            </div>
                          </div>
                        )}

                        <div className="rw">
                          <button
                            className="chip on"
                            disabled={bulkDownloading}
                            onClick={() =>
                              runBulkOfflineDownload({
                                mode: 'filtered',
                                includeText: false,
                                includeAudio: true,
                                reciterIndex: packReciterIdx,
                                filterPreset: audioFilterPreset,
                                rangeStart: filterStartSurah,
                                rangeEnd: filterEndSurah,
                                force: false,
                              })
                            }
                          >
                            {appLang === 'bn' ? 'ফিল্টারকৃত তিলাওয়াত ডাউনলোড' : 'Download Filtered Audio'}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="rw" style={{ marginTop: 10 }}>
                      <button
                        className="chip"
                        disabled={bulkDownloading}
                        onClick={async () => {
                          if (!clearArmed) {
                            setClearArmed(true);
                            window.setTimeout(() => setClearArmed(false), 3000);
                            return;
                          }
                          setClearArmed(false);
                          await idbDeletePrefix('audio:').catch(() => {});
                          await refreshOfflineStats(packReciterIdx);
                          toast(
                            appLang === 'bn'
                              ? 'অফলাইন অডিও ক্যাশ মুছে ফেলা হয়েছে'
                              : 'Offline audio cache cleared'
                          );
                        }}
                      >
                        {clearArmed ? t.tapAgainClear : t.clearOffline}
                      </button>
                    </div>
                  </div>

                  {/* PWA Install & Guide Replay */}
                  <div className="card">
                    <b>{t.installAppTitle}</b>
                    <div className="rw">
                      {!pwa.isInstalled && pwa.isInstallable && (
                        <button
                          className="chip on"
                          onClick={async () => {
                            const ok = await pwa.install();
                            if (ok) {
                              toast(
                                appLang === 'bn'
                                  ? 'ZIKRIFY ইনস্টল সম্পন্ন হয়েছে!'
                                  : 'ZIKRIFY installed!'
                              );
                            }
                          }}
                        >
                          {t.installAppBtn}
                        </button>
                      )}
                      <button
                        className="chip"
                        onClick={() => {
                          setSettingsOpen(false);
                          setTourMode('welcome');
                        }}
                      >
                        {t.replayGuide}
                      </button>
                      <button
                        className="chip"
                        onClick={() => {
                          setSettingsOpen(false);
                          setOfflinePromptOpen(true);
                        }}
                      >
                        {t.openOfflinePrompt}
                      </button>
                    </div>
                    {!pwa.isInstalled && pwa.isIOS && (
                      <p className="mut sm" style={{ marginBottom: 0 }}>
                        {t.iosInstallTip}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="about-hero">
                    <BrandLogo width={160} />
                    <div className="mut sm" style={{ margin: '8px 0 0' }}>
                      Quran Audio Player · Read · Hifz · Media · Kitab
                    </div>
                  </div>

                  <div className="card">
                    <div className="about-kv">
                      <span>{t.aboutVersion}</span>
                      <b>{APP_VERSION}</b>
                    </div>
                    <div className="about-kv">
                      <span>{t.aboutDedicatedTo}</span>
                      <b>MAHADUL FURQAN</b>
                    </div>
                    <div className="about-kv">
                      <span>{t.aboutDevelopedBy}</span>
                      <b>Graphico Global</b>
                    </div>
                  </div>

                  <div className="card">
                    <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65 }}>{t.aboutSummary}</p>
                    <div className="rw">
                      <button
                        className="chip on"
                        onClick={() => {
                          setSettingsOpen(false);
                          setTourMode('welcome');
                        }}
                      >
                        {t.replayGuide}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {offlinePromptOpen && (
            <div className="sheet">
              <div className="top">
                <h2 style={{ fontSize: 18 }}>{t.offlineModalTitle}</h2>
                <button className="chip" onClick={dismissOfflinePrompt}>
                  {bulkDownloading ? (appLang === 'bn' ? 'মিনিমাইজ' : 'Minimize') : t.close}
                </button>
              </div>
              <p className="mut" style={{ margin: '8px 0 10px', fontSize: 13 }}>
                {t.offlineModalDesc}
              </p>

              {/* System 1 / System 2 Switcher */}
              <div className="seg" style={{ margin: '8px 0 10px' }}>
                <button
                  className={dlSystemTab === 'full' ? 'on' : ''}
                  onClick={() => setDlSystemTab('full')}
                >
                  {appLang === 'bn' ? '১. পূর্ণ সফটওয়্যার' : '1. Full App Pack'}
                </button>
                <button
                  className={dlSystemTab === 'filtered' ? 'on' : ''}
                  onClick={() => setDlSystemTab('filtered')}
                >
                  {appLang === 'bn' ? '২. ফিল্টার তিলাওয়াত' : '2. Filtered Audio'}
                </button>
              </div>

              <div className="fm">
                {dlSystemTab === 'full' ? (
                  <>
                    <label className={`opt-row${packIncludeText ? ' on' : ''}`}>
                      <input
                        type="checkbox"
                        checked={packIncludeText}
                        disabled={bulkDownloading}
                        onChange={(e) => setPackIncludeText(e.target.checked)}
                      />
                      <div>
                        <b style={{ display: 'block', fontSize: 14 }}>{t.optTextTitle}</b>
                        <span className="mut" style={{ fontSize: 12 }}>
                          {t.optTextSub}
                        </span>
                      </div>
                    </label>

                    <label className={`opt-row${packIncludeAudio ? ' on' : ''}`}>
                      <input
                        type="checkbox"
                        checked={packIncludeAudio}
                        disabled={bulkDownloading}
                        onChange={(e) => setPackIncludeAudio(e.target.checked)}
                      />
                      <div style={{ flex: 1 }}>
                        <b style={{ display: 'block', fontSize: 14 }}>{t.optAudioTitle}</b>
                        <span className="mut" style={{ fontSize: 12 }}>
                          {t.optAudioSub}
                        </span>
                      </div>
                    </label>
                  </>
                ) : (
                  <div className="card" style={{ margin: 0 }}>
                    <b style={{ fontSize: 13.5 }}>{t.sys2Title}</b>
                    <p className="mut sm" style={{ marginTop: 4 }}>
                      {t.sys2Desc}
                    </p>
                    <div className="rw" style={{ marginTop: 6 }}>
                      {(
                        [
                          ['all', appLang === 'bn' ? 'সব ১১৪' : 'All 114'],
                          ['juz_amma', appLang === 'bn' ? 'আমপারা (৭৮–১১৪)' : 'Juz Amma (78–114)'],
                          ['last_10', appLang === 'bn' ? 'শেষ ১০ সূরা' : 'Last 10 (105–114)'],
                          ['custom', appLang === 'bn' ? 'কাস্টম' : 'Custom'],
                        ] as const
                      ).map(([id, label]) => (
                        <button
                          key={id}
                          className="chip"
                          aria-pressed={audioFilterPreset === id}
                          disabled={bulkDownloading}
                          onClick={() => setAudioFilterPreset(id)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {audioFilterPreset === 'custom' && (
                      <div className="range-pair">
                        <div className="range-field">
                          <label>{appLang === 'bn' ? 'শুরু সূরা' : 'From Surah'}</label>
                          <input
                            type="number"
                            min={1}
                            max={114}
                            value={filterStartSurah}
                            disabled={bulkDownloading}
                            onChange={(e) => setFilterStartSurah(Number(e.target.value) || 1)}
                          />
                        </div>
                        <div className="range-field">
                          <label>{appLang === 'bn' ? 'শেষ সূরা' : 'To Surah'}</label>
                          <input
                            type="number"
                            min={1}
                            max={114}
                            value={filterEndSurah}
                            disabled={bulkDownloading}
                            onChange={(e) => setFilterEndSurah(Number(e.target.value) || 114)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(dlSystemTab === 'filtered' || packIncludeAudio) && (
                  <select
                    aria-label={t.reciterLabel}
                    value={packReciterIdx}
                    disabled={bulkDownloading}
                    onChange={(e) => setPackReciterIdx(Number(e.target.value))}
                  >
                    {RECITERS.map((r, idx) => (
                      <option key={r.name} value={idx}>
                        {t.reciterLabel}: {r.name}
                      </option>
                    ))}
                  </select>
                )}

                {(dlJob.status === 'running' || dlJob.status === 'paused') ? (
                  <div className="card" style={{ margin: 0 }}>
                    <div className="tm">
                      <span>{dlJob.label}</span>
                      <span>
                        {Math.round((dlJob.completed / Math.max(1, dlJob.total)) * 100)}%
                      </span>
                    </div>
                    <div className="pbar">
                      <i
                        style={{
                          width: `${Math.round(
                            (dlJob.completed / Math.max(1, dlJob.total)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="rw" style={{ marginTop: 8 }}>
                      {dlJob.status === 'running' ? (
                        <>
                          <button className="chip on" onClick={pauseBulkDownload}>
                            ⏸ {t.pauseBtn}
                          </button>
                          <button className="chip" onClick={dismissOfflinePrompt}>
                            {t.minimizeBgBtn}
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="chip on" onClick={resumeBulkDownload}>
                            ▶ {t.resumeBtn}
                          </button>
                          <button className="chip" onClick={clearDlJob}>
                            {appLang === 'bn' ? 'বাতিল' : 'Discard'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      className="btn2 bq"
                      onClick={() =>
                        dlSystemTab === 'full'
                          ? runBulkOfflineDownload({
                              mode: 'full',
                              includeText: packIncludeText,
                              includeAudio: packIncludeAudio,
                              reciterIndex: packReciterIdx,
                            })
                          : runBulkOfflineDownload({
                              mode: 'filtered',
                              includeText: false,
                              includeAudio: true,
                              reciterIndex: packReciterIdx,
                              filterPreset: audioFilterPreset,
                              rangeStart: filterStartSurah,
                              rangeEnd: filterEndSurah,
                            })
                      }
                    >
                      {t.downloadNowBtn}
                    </button>
                    <button className="btn2 bg" onClick={dismissOfflinePrompt}>
                      {t.skipForNowBtn}
                    </button>
                  </>
                )}
              </div>

              <p className="mut sm" style={{ marginBottom: 0 }}>
                {t.offlineLaterNote}
              </p>
            </div>
          )}
        </div>
      )}

      {/* GUIDE / ONBOARDING TOUR (#tour) */}
      <div
        id="tour"
        role="dialog"
        aria-modal="true"
        aria-label="ZIKRIFY guide"
        hidden={tourMode === 'none'}
        className={
          tourMode === 'welcome' ? 'full' : tourMode === 'overview' ? 'page' : ''
        }
      >
        {tourMode === 'welcome' && (
          <div className="wl">
            <div className="wlc">
              <img alt="ZIKRIFY" src={BRAND_LOGO_LIGHT} />
              <img
                alt="Quran Audio Player"
                src={BRAND_TAGLINE_LIGHT}
                style={{ width: '92%' }}
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '6px 0 0' }}>
                {appLang === 'bn'
                  ? 'এক জায়গায় কুরআন শুনুন, অর্থসহ পড়ুন এবং হিফয করুন।'
                  : 'Listen, read and memorize the Quran in one place.'}
              </p>
            </div>
            <button className="btn2 bp" onClick={() => startTourStep(0)}>
              {appLang === 'bn' ? 'সংক্ষিপ্ত গাইড দেখুন' : 'Take a quick tour'}
            </button>
            <button className="btn2 bs" onClick={() => setTourMode('overview')}>
              {appLang === 'bn' ? 'ভিতরে কী কী আছে দেখুন' : 'See everything inside'}
            </button>
            <button
              className="btn2 bs"
              style={{ background: 'none', boxShadow: 'none' }}
              onClick={closeTour}
            >
              {appLang === 'bn' ? 'স্কিপ করুন' : 'Skip'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, margin: '6px 0 0' }}>
              Developed by Graphico Global · For MAHADUL FURQAN
            </p>
          </div>
        )}

        {tourMode === 'step' && (
          <div className="tb">
            <div className="tbh">
              <BrandLogo width={96} />
              <div className="dots">
                {tourSteps.map((_, k) => (
                  <i key={k} className={k === tourStepIdx ? 'on' : ''} />
                ))}
              </div>
            </div>
            <div className="tic">
              <Icon d={tourSteps[tourStepIdx][1]} />
            </div>
            <h2>{tourSteps[tourStepIdx][2]}</h2>
            <p>{tourSteps[tourStepIdx][3]}</p>
            <div className="row2">
              <button className="btn2 bg" onClick={closeTour}>
                {appLang === 'bn' ? 'স্কিপ' : 'Skip'}
              </button>
              <span className="sp" />
              {tourStepIdx > 0 && (
                <button
                  className="btn2 bg"
                  onClick={() => startTourStep(tourStepIdx - 1)}
                >
                  {appLang === 'bn' ? 'পিছনে' : 'Back'}
                </button>
              )}
              <button
                className="btn2 bq"
                onClick={() =>
                  tourStepIdx >= tourSteps.length - 1
                    ? closeTour()
                    : startTourStep(tourStepIdx + 1)
                }
              >
                {tourStepIdx === tourSteps.length - 1
                  ? appLang === 'bn'
                    ? 'শুরু করুন'
                    : 'Start'
                  : appLang === 'bn'
                  ? 'পরবর্তী'
                  : 'Next'}
              </button>
            </div>
          </div>
        )}

        {tourMode === 'overview' && (
          <div className="pg">
            <div className="ovh" style={{ textAlign: 'center' }}>
              <BrandLogo width={170} />
              <h2 style={{ marginTop: 8, fontSize: 18 }}>
                {appLang === 'bn' ? 'ZIKRIFY-তে যা যা রয়েছে' : 'What’s inside ZIKRIFY'}
              </h2>
            </div>
            <div className="ovb">
              {overviewItems.map((o, k) => (
                <div className="card" key={o[0]}>
                  <div className="row2">
                    <span
                      className="tic"
                      style={{ width: 40, height: 40, borderRadius: 14 }}
                    >
                      <Icon d={tourSteps[k][1]} />
                    </span>
                    <b>{o[0]}</b>
                  </div>
                  <p className="mut" style={{ margin: '8px 0 0' }}>
                    {o[1]}
                  </p>
                </div>
              ))}
            </div>
            <div className="ovf">
              <button className="btn2 bg" onClick={() => startTourStep(0)}>
                {appLang === 'bn' ? 'গাইড দেখুন' : 'Take the tour'}
              </button>
              <button
                className="btn2 bq"
                style={{ flex: 1 }}
                onClick={closeTour}
              >
                {appLang === 'bn' ? 'ZIKRIFY শুরু করুন' : 'Start ZIKRIFY'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FULLSCREEN KITAB / PDF READER (Book Mode + Vertical Scroll) */}
      {activeReaderPdf && (
        <PdfReader
          id={activeReaderPdf.id}
          title={activeReaderPdf.t}
          pdfUrl={
            pdfBlobUrls[activeReaderPdf.id] ||
            (activeReaderPdf.url
              ? toDriveDownloadUrl(activeReaderPdf.url) || activeReaderPdf.url
              : undefined)
          }
          fallbackIframeUrl={
            activeReaderPdf.url
              ? toDrivePreviewUrl(activeReaderPdf.url) || activeReaderPdf.url
              : null
          }
          defaultRtl={activeReaderPdf.cat === '15-Line Hifz Quran' || /কোরআন|কুরআন|quran/i.test(activeReaderPdf.t)}
          appLang={appLang}
          isOfflineCached={Boolean(activeReaderPdf.file)}
          cachingOffline={pdfCachingId === activeReaderPdf.id}
          onSaveOffline={
            activeReaderPdf.url && !activeReaderPdf.file
              ? () => handleCachePdfOffline(activeReaderPdf)
              : undefined
          }
          onClose={() => setActiveReaderPdf(null)}
        />
      )}

      {/* WORD / LETTER TAJWEED, MAKHRAJ & SIFAT LIVE INSPECTOR */}
      {inspectedWord && (
        <TajweedInspectorSheet
          word={inspectedWord.word}
          ayahNumber={inspectedWord.ayahNum}
          surahName={`${surah.number}. ${surah.en}`}
          theme={theme}
          teachLang={teachLang}
          showEnSubtitle={showEnSub}
          onChangeTeachLang={updateTeachLang}
          onToggleEnSubtitle={() => setShowEnSub((s) => !s)}
          onPlayAyah={() => playAyahSnippet(inspectedWord.ayahIdx, 0)}
          onOpenFullGuide={() => {
            setInspectedWord(null);
            setTajweedGuideOpen(true);
          }}
          onClose={() => setInspectedWord(null)}
        />
      )}

      {/* COMPLETE 4-LANGUAGE TAJWEED, QAIDA, 17 MAKHARIJ & SIFAT ENCYCLOPEDIA */}
      {tajweedGuideOpen && (
        <TajweedGuideModal
          theme={theme}
          teachLang={teachLang}
          showEnSubtitle={showEnSub}
          onChangeTeachLang={updateTeachLang}
          onToggleEnSubtitle={() => setShowEnSub((s) => !s)}
          onClose={() => setTajweedGuideOpen(false)}
        />
      )}

      {/* TOAST (#ts) */}
      <div id="ts" hidden={!toastVisible} role="status">
        {toastMsg}
      </div>
    </div>
    </>
  );
}
