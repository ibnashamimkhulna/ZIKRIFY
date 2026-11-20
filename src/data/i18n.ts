export type AppLang = 'en' | 'bn';

export interface CopyDict {
  nav: [string, string, string, string, string];
  themeLight: string;
  themeDark: string;
  settingsBtn: string;
  guideBtn: string;
  reciterLabel: string;
  listenInLabel: string;
  offlineSaved: string;
  offlineOff: string;
  saving: string;
  surahsLabel: string;
  loadingText: string;
  hifzTitle: string;
  correct: string;
  mistakes: string;
  pending: string;
  start: string;
  pause: string;
  reset: string;
  hideNext: string;
  listenAyah: string;
  mediaTitle: string;
  mediaSub: string;
  booksTitle: string;
  addPdf: string;
  // Offline full pack modal
  offlineModalTitle: string;
  offlineModalDesc: string;
  offlineLaterNote: string;
  optTextTitle: string;
  optTextSub: string;
  optAudioTitle: string;
  optAudioSub: string;
  downloadNowBtn: string;
  downloadingBtn: string;
  skipForNowBtn: string;
  cancelDownloadBtn: string;
  minimizeBgBtn: string;
  pauseBtn: string;
  resumeBtn: string;
  pausedLabel: string;
  bgDownloadingLabel: string;
  sys1Title: string;
  sys1Desc: string;
  sys2Title: string;
  sys2Desc: string;
  // Books & PDFs
  readBookBtn: string;
  savePdfOfflineBtn: string;
  savingPdfOffline: string;
  pdfOfflineReady: string;
  driveLinkOnline: string;
  // Settings & About
  settingsTitle: string;
  tabGeneral: string;
  tabAbout: string;
  appearanceTitle: string;
  languageTitle: string;
  offlineManagerTitle: string;
  textCoverage: string;
  audioCoverage: string;
  storageUsed: string;
  downloadFullPack: string;
  redownloadFresh: string;
  clearOffline: string;
  tapAgainClear: string;
  installAppTitle: string;
  installAppBtn: string;
  iosInstallTip: string;
  replayGuide: string;
  openOfflinePrompt: string;
  aboutDedicatedTo: string;
  aboutDevelopedBy: string;
  aboutVersion: string;
  aboutSummary: string;
  close: string;
  offlineBanner: string;
}

export const COPY: Record<AppLang, CopyDict> = {
  en: {
    nav: ['Listen', 'Read', 'Hifz', 'Media', 'Books'],
    themeLight: 'Light',
    themeDark: 'Dark',
    settingsBtn: 'Settings',
    guideBtn: 'Guide',
    reciterLabel: 'Reciter',
    listenInLabel: 'Listen in',
    offlineSaved: 'Offline: saved',
    offlineOff: 'Offline: off',
    saving: 'Saving…',
    surahsLabel: 'Surahs',
    loadingText: 'Loading…',
    hifzTitle: 'Hifz Mode',
    correct: 'Correct',
    mistakes: 'Mistakes',
    pending: 'Pending',
    start: 'Start',
    pause: 'Pause',
    reset: 'Reset',
    hideNext: 'Hide next words',
    listenAyah: 'Listen Ayah',
    mediaTitle: 'Media',
    mediaSub: 'Music · Video',
    booksTitle: 'Books & PDFs',
    addPdf: '+ Add PDF',
    offlineModalTitle: 'Download Offline Data',
    offlineModalDesc:
      'Download once so ZIKRIFY works smoothly without internet. You can minimize anytime—downloads continue in the background.',
    offlineLaterNote:
      'Closing or minimizing keeps the download running in background. Pause & Resume anytime from the top bar or Settings (⚙).',
    optTextTitle: 'Complete Quran Text & Meanings (114 Surahs)',
    optTextSub: 'Arabic Uthmani, বাংলা & English (~4.5 MB · Fast)',
    optAudioTitle: 'Selected Reciter Audio MP3s',
    optAudioSub: 'Full 114 Surahs or filtered range for chosen Qari',
    downloadNowBtn: 'Start Offline Download',
    downloadingBtn: 'Downloading…',
    skipForNowBtn: 'Close / Skip for Now',
    cancelDownloadBtn: 'Pause & Keep Progress',
    minimizeBgBtn: 'Minimize (Keep in Background)',
    pauseBtn: 'Pause',
    resumeBtn: 'Resume',
    pausedLabel: 'Download Paused',
    bgDownloadingLabel: 'Background Download',
    sys1Title: 'System 1 · Full Software Offline Pack',
    sys1Desc: 'Download all 114 Surahs text + selected Qari 114 MP3s for complete offline use.',
    sys2Title: 'System 2 · Filtered Recitation Download',
    sys2Desc: 'Filter by Juz Amma, Last 10 Surahs, or any custom Surah range & Qari.',
    readBookBtn: 'Read Kitab',
    savePdfOfflineBtn: 'Save Offline',
    savingPdfOffline: 'Saving PDF…',
    pdfOfflineReady: 'Saved Offline (Works without internet)',
    driveLinkOnline: 'Google Drive · Tap Read or Save Offline',
    settingsTitle: 'Settings',
    tabGeneral: 'Settings',
    tabAbout: 'About',
    appearanceTitle: 'Theme Appearance',
    languageTitle: 'App Language',
    offlineManagerTitle: 'Offline Data Manager',
    textCoverage: 'Quran Text (114 Surahs)',
    audioCoverage: 'Reciter Audio',
    storageUsed: 'Device Storage Used',
    downloadFullPack: 'Download Full 114 Pack',
    redownloadFresh: 'Re-download All Fresh',
    clearOffline: 'Clear Cached Audio',
    tapAgainClear: 'Tap again to clear',
    installAppTitle: 'Install ZIKRIFY App',
    installAppBtn: 'Install for Offline Launch',
    iosInstallTip: 'On iPhone/iPad: tap Share → “Add to Home Screen” for offline launch.',
    replayGuide: 'Replay Guide & Tutorial',
    openOfflinePrompt: 'Open Offline Download Wizard',
    aboutDedicatedTo: 'Dedicated For',
    aboutDevelopedBy: 'Developed By',
    aboutVersion: 'App Version',
    aboutSummary:
      'ZIKRIFY brings together full Quran audio from 10 world-renowned Qaris, Arabic Uthmani reading with Bengali & English meanings, interactive Hifz memorization mode, local audio/video player, and Hifz PDF library — engineered for seamless offline use.',
    close: 'Close',
    offlineBanner: 'Offline mode · Using saved Quran data',
  },
  bn: {
    nav: ['শুনুন', 'পড়ুন', 'হিফয', 'মিডিয়া', 'কিতাব'],
    themeLight: 'লাইট',
    themeDark: 'ডার্ক',
    settingsBtn: 'সেটিংস',
    guideBtn: 'গাইড',
    reciterLabel: 'ক্বারি নির্বাচন',
    listenInLabel: 'যে ভাষায় শুনবেন',
    offlineSaved: 'অফলাইন: সেভড',
    offlineOff: 'অফলাইন: বন্ধ',
    saving: 'সেভ হচ্ছে…',
    surahsLabel: 'সূরা',
    loadingText: 'লোড হচ্ছে…',
    hifzTitle: 'হিফয মোড',
    correct: 'সঠিক',
    mistakes: 'ভুল',
    pending: 'বাকি',
    start: 'শুরু',
    pause: 'বিরতি',
    reset: 'রিসেট',
    hideNext: 'পরের শব্দ লুকান',
    listenAyah: 'আয়াত শুনুন',
    mediaTitle: 'মিডিয়া প্লেয়ার',
    mediaSub: 'অডিও · ভিডিও',
    booksTitle: 'কিতাব ও পিডিএফ',
    addPdf: '+ পিডিএফ যোগ করুন',
    offlineModalTitle: 'অফলাইনে পূর্ণাঙ্গ ব্যবহারের জন্য ফাইল ডাউনলোড',
    offlineModalDesc:
      'একবার ডাউনলোড শুরু করে এই পপ-আপটি মিনিমাইজ বা বন্ধ করে দিলেও ব্যাকগ্রাউন্ডে ডাউনলোড চলতে থাকবে। যখন খুশি Pause বা Resume করতে পারবেন।',
    offlineLaterNote:
      'মিনিমাইজ বা বন্ধ করলে ডাউনলোড বন্ধ হবে না—ব্যাকগ্রাউন্ডে চলতে থাকবে। উপরের বার বা সেটিংস (⚙) থেকে নিয়ন্ত্রণ করুন।',
    optTextTitle: 'সম্পূর্ণ কুরআন টেক্সট ও অর্থ (১১৪ সূরা)',
    optTextSub: 'আরবি উসমানী, বাংলা ও ইংরেজি অনুবাদ (~৪.৫ মেগাবাইট · দ্রুত)',
    optAudioTitle: 'নির্বাচিত ক্বারির অডিও তিলাওয়াত',
    optAudioSub: 'সব ১১৪ সূরা বা নির্দিষ্ট সূরা ফিল্টার করে অফলাইনে সেভ',
    downloadNowBtn: 'অফলাইন ডাউনলোড শুরু করুন',
    downloadingBtn: 'ডাউনলোড চলছে…',
    skipForNowBtn: 'বন্ধ করুন / পরে',
    cancelDownloadBtn: 'বিরতি দিন (যতটুকু হয়েছে থাকবে)',
    minimizeBgBtn: 'মিনিমাইজ করুন (ব্যাকগ্রাউন্ডে চলুক)',
    pauseBtn: 'বিরতি',
    resumeBtn: 'আবার শুরু',
    pausedLabel: 'ডাউনলোড বিরতিতে আছে',
    bgDownloadingLabel: 'ব্যাকগ্রাউন্ডে ডাউনলোড হচ্ছে',
    sys1Title: 'সিস্টেম ১ · পূর্ণাঙ্গ সফটওয়্যার অফলাইন প্যাকেজ',
    sys1Desc: 'পুরো সফটওয়্যার অফলাইনে চালাতে সব ১১৪ সূরা টেক্সট ও নির্বাচিত ক্বারির ১১৪ সূরা অডিও একসাথে।',
    sys2Title: 'সিস্টেম ২ · ফিল্টারিং তিলাওয়াত ডাউনলোড',
    sys2Desc: 'যেকোনো ক্বারির জন্য আমপারা, শেষ ১০ সূরা অথবা কাস্টম সূরা রেঞ্জ বেছে ডাউনলোড করুন।',
    readBookBtn: 'পড়ুন (কিতাব)',
    savePdfOfflineBtn: 'অফলাইনে সেভ',
    savingPdfOffline: 'সেভ হচ্ছে…',
    pdfOfflineReady: 'অফলাইনে সেভড (ইন্টারনেট ছাড়াই চলবে)',
    driveLinkOnline: 'গুগল ড্রাইভ · সরাসরি পড়ুন বা অফলাইনে সেভ করুন',
    settingsTitle: 'সেটিংস',
    tabGeneral: 'সেটিংস',
    tabAbout: 'সফটওয়্যার পরিচিতি',
    appearanceTitle: 'থিম পরিবর্তন',
    languageTitle: 'অ্যাপের ভাষা (Language)',
    offlineManagerTitle: 'অফলাইন ডাটা ম্যানেজার',
    textCoverage: 'কুরআন টেক্সট (১১৪ সূরা)',
    audioCoverage: 'ক্বারি অডিও সেভ',
    storageUsed: 'স্টোরেজ ব্যবহৃত',
    downloadFullPack: 'সম্পূর্ণ ১১৪ সূরা প্যাকেজ ডাউনলোড',
    redownloadFresh: 'নতুন করে সব ডাটা ডাউনলোড',
    clearOffline: 'অডিও ক্যাশ মুছুন',
    tapAgainClear: 'নিশ্চিত করতে আবার চাপুন',
    installAppTitle: 'অ্যাপ ইনস্টল করুন (অফলাইন)',
    installAppBtn: 'ডিভাইসে ইনস্টল করুন',
    iosInstallTip: 'iPhone/iPad-এ: Safari Share বাটন চাপুন → “Add to Home Screen” নির্বাচন করুন।',
    replayGuide: 'টিউটোরিয়াল / গাইড আবার দেখুন',
    openOfflinePrompt: 'অফলাইন ডাউনলোড উইজার্ড খুলুন',
    aboutDedicatedTo: 'যাদের জন্য নির্মিত',
    aboutDevelopedBy: 'ডেভেলপমেন্ট ও নির্মাতা',
    aboutVersion: 'সফটওয়্যার ভার্সন',
    aboutSummary:
      'ZIKRIFY-তে রয়েছে ১০ জন বিশ্ববরেণ্য ক্বারির কণ্ঠে পূর্ণ কুরআন তিলাওয়াত, আরবি উসমানী ও বাংলা-ইংরেজি অর্থসহ পড়া, লাইভ ভয়েস ও ট্যাপ হিফয মোড, নিজস্ব মিডিয়া প্লেয়ার এবং হিফয পিডিএফ লাইব্রেরি—সম্পূর্ণ অফলাইনে চালানোর সুবিধাসহ।',
    close: 'বন্ধ করুন',
    offlineBanner: 'অফলাইন মোড · সেভ করা কুরআন ডাটা চলছে',
  },
};
