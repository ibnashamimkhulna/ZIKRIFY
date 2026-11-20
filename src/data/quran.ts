import { idbGet, idbKeys, idbPut } from '../utils/storage';

export interface AyahItem {
  ar: string;
  bn: string;
  en: string;
}

export interface Reciter {
  name: string;
  surahBase: string;
  ayahBase: string;
  resolveSurahUrl?: (surahNumber: number) => string;
}

export interface SurahMeta {
  number: number;
  ar: string;
  en: string;
  bn: string;
  ayahs: number;
}

export const RECITERS: Reciter[] = [
  {
    name: 'Mishary Alafasy',
    surahBase: 'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/',
    ayahBase: 'https://everyayah.com/data/Alafasy_128kbps/',
  },
  {
    name: 'Abdul Basit',
    surahBase: 'https://download.quranicaudio.com/quran/abdul_basit_murattal/',
    ayahBase: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/',
  },
  {
    name: 'As-Sudais',
    surahBase: 'https://download.quranicaudio.com/quran/abdurrahmaan_as-sudays/',
    ayahBase: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/',
  },
  {
    name: 'Maher Al-Muaiqly',
    surahBase: 'https://download.quranicaudio.com/quran/maher_256/',
    ayahBase: 'https://everyayah.com/data/MaherAlMuaiqly128kbps/',
  },
  {
    name: 'Saad Al-Ghamdi',
    surahBase: 'https://download.quranicaudio.com/quran/sa3d_al-ghaamidi/complete/',
    ayahBase: 'https://everyayah.com/data/Ghamadi_40kbps/',
  },
  {
    name: 'Al-Minshawi',
    surahBase: 'https://download.quranicaudio.com/quran/muhammad_siddeeq_al-minshaawee/',
    ayahBase: 'https://everyayah.com/data/Minshawy_Murattal_128kbps/',
  },
  {
    name: 'Ahmad Al-Nufais',
    surahBase: 'https://cdn.mp3quran.net/audio/ahmad-nufais/r1/',
    ayahBase: 'https://everyayah.com/data/Alafasy_128kbps/',
  },
  {
    name: 'Badr Al-Turki',
    surahBase: 'https://cdn.mp3quran.net/audio/badr-turki/r1/',
    ayahBase: 'https://everyayah.com/data/Alafasy_128kbps/',
  },
  {
    name: 'Abdul Badi Ghaylan',
    surahBase: 'https://cdn.mp3quran.net/audio/abdulbadi-ghailan/r1/',
    ayahBase: 'https://everyayah.com/data/Alafasy_128kbps/',
  },
  {
    name: 'Abdul Aziz Shukri',
    surahBase: 'https://media.way2quran.com/abdulaziz-shukri/warsh-an-nafi/',
    ayahBase: 'https://everyayah.com/data/Alafasy_128kbps/',
    resolveSurahUrl: (surahNumber: number) => {
      const n = String(surahNumber).padStart(3, '0');
      const hafsSet = new Set([1, 23, 29, 30, 31, 32, 33, 35, 36, 37, 38, 39, 41, 50]);
      if (hafsSet.has(surahNumber)) {
        return `https://media.way2quran.com/abdulaziz-shukri/hafs-an-asim/${n}.mp3`;
      }
      if (surahNumber >= 41 && surahNumber <= 114) {
        return `https://media.way2quran.com/abdulaziz-shukri/warsh-an-nafi/${n}.mp3`;
      }
      // Seamless 30-Juz fallback for surahs not publicly recorded by Sheikh Abdul Aziz Shukri
      return `https://cdn.mp3quran.net/audio/abdulbadi-ghailan/r1/${n}.mp3`;
    },
  },
];

export const ENGLISH_AYAH_BASE =
  'https://everyayah.com/data/English/Sahih_Intnl_Ibrahim_Walk_192kbps/';

export const ENGLISH_SURAH_BASE =
  'https://cdn.islamic.network/quran/audio-surah/128/en.misharyrashidalafasyenglishtranslationsaheehibrahimwalk/';

export const BISMILLAH_AR = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';

export const FATIHAH_AYAHS: AyahItem[] = [
  {
    ar: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    bn: 'শুরু করছি আল্লাহর নামে, যিনি পরম করুণাময়, অতি দয়ালু।',
    en: 'In the name of Allah, the Most Gracious, the Most Merciful.',
  },
  {
    ar: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
    bn: 'সমস্ত প্রশংসা আল্লাহর, যিনি সকল জগতের প্রতিপালক।',
    en: 'All praise is for Allah, Lord of all worlds.',
  },
  {
    ar: 'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    bn: 'পরম করুণাময়, অতি দয়ালু।',
    en: 'The Most Gracious, the Most Merciful.',
  },
  {
    ar: 'مَـٰلِكِ يَوْمِ ٱلدِّينِ',
    bn: 'যিনি প্রতিদান দিবসের মালিক।',
    en: 'Master of the Day of Judgment.',
  },
  {
    ar: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    bn: 'আমরা কেবল আপনারই ইবাদত করি এবং কেবল আপনারই কাছে সাহায্য চাই।',
    en: 'You alone we worship, and You alone we ask for help.',
  },
  {
    ar: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
    bn: 'আমাদের সরল পথ দেখান।',
    en: 'Guide us to the straight path.',
  },
  {
    ar: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
    bn: 'তাদের পথ, যাদের আপনি অনুগ্রহ করেছেন; তাদের নয়, যারা ক্রোধে পতিত এবং যারা পথভ্রষ্ট।',
    en: 'The path of those You have blessed, not of those who earned anger or went astray.',
  },
];

export const SIMILAR_VERSES: [string, string, string, string][] = [
  [
    'Al-An’am 6:45',
    'فَقُطِعَ دَابِرُ ٱلْقَوْمِ ٱلَّذِينَ ظَلَمُوا۟ ۚ وَ',
    'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
    'Extra وَ',
  ],
  [
    'Yunus 10:10',
    'دَعْوَىٰهُمْ فِيهَا سُبْحَٰنَكَ ٱللَّهُمَّ وَتَحِيَّتُهُمْ فِيهَا سَلَٰمٌۭ ۚ وَءَاخِرُ دَعْوَىٰهُمْ أَنِ',
    'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
    'Different start',
  ],
  [
    'Az-Zumar 39:75',
    'وَتَرَى ٱلْمَلَٰٓئِكَةَ حَآفِّينَ مِنْ حَوْلِ ٱلْعَرْشِ يُسَبِّحُونَ بِحَمْدِ رَبِّهِمْ ۖ وَقُضِىَ بَيْنَهُم بِٱلْحَقِّ وَقِيلَ',
    'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
    'Different start',
  ],
  [
    'As-Saffat 37:182',
    'وَ',
    'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
    'Surah ending',
  ],
  [
    'Ghafir 40:65',
    'هُوَ ٱلْحَىُّ لَآ إِلَٰهَ إِلَّا هُوَ فَٱدْعُوهُ مُخْلِصِينَ لَهُ ٱلدِّينَ ۗ',
    'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
    'Different start',
  ],
];

const COMPACT_SURAHS: Array<[number, string, string, number]> = [
  [1, 'ٱلْفَاتِحَةِ', 'Al-Fatihah', 7],
  [2, 'البَقَرَةِ', 'Al-Baqarah', 286],
  [3, 'آلِ عِمۡرَانَ', 'Aal-i-Imraan', 200],
  [4, 'النِّسَاءِ', 'An-Nisaa', 176],
  [5, 'المَائـِدَةِ', 'Al-Ma’idah', 120],
  [6, 'الأَنۡعَامِ', 'Al-An’am', 165],
  [7, 'الأَعۡرَافِ', 'Al-A’raf', 206],
  [8, 'الأَنفَالِ', 'Al-Anfal', 75],
  [9, 'التَّوۡبَةِ', 'At-Tawbah', 129],
  [10, 'يُونُسَ', 'Yunus', 109],
  [11, 'هُودٍ', 'Hud', 123],
  [12, 'يُوسُفَ', 'Yusuf', 111],
  [13, 'الرَّعۡدِ', 'Ar-Ra’d', 43],
  [14, 'إِبۡرَاهِيمَ', 'Ibrahim', 52],
  [15, 'الحِجۡرِ', 'Al-Hijr', 99],
  [16, 'النَّحۡلِ', 'An-Nahl', 128],
  [17, 'الإِسۡرَاءِ', 'Al-Isra', 111],
  [18, 'الكَهۡفِ', 'Al-Kahf', 110],
  [19, 'مَرۡيَمَ', 'Maryam', 98],
  [20, 'طه', 'Ta-Ha', 135],
  [21, 'الأَنبِيَاءِ', 'Al-Anbiya', 112],
  [22, 'الحَجِّ', 'Al-Hajj', 78],
  [23, 'المُؤۡمِنُونَ', 'Al-Mu’minun', 118],
  [24, 'النُّورِ', 'An-Nur', 64],
  [25, 'الفُرۡقَانِ', 'Al-Furqan', 77],
  [26, 'الشُّعَرَاءِ', 'Ash-Shu’ara', 227],
  [27, 'النَّمۡلِ', 'An-Naml', 93],
  [28, 'القَصَصِ', 'Al-Qasas', 88],
  [29, 'العَنكَبُوتِ', 'Al-Ankabut', 69],
  [30, 'الرُّومِ', 'Ar-Rum', 60],
  [31, 'لُقۡمَانَ', 'Luqman', 34],
  [32, 'السَّجۡدَةِ', 'As-Sajdah', 30],
  [33, 'الأَحۡزَابِ', 'Al-Ahzab', 73],
  [34, 'سَبَإٍ', 'Saba', 54],
  [35, 'فَاطِرٍ', 'Fatir', 45],
  [36, 'يسٓ', 'Ya-Sin', 83],
  [37, 'الصَّافَّاتِ', 'As-Saffat', 182],
  [38, 'صٓ', 'Sad', 88],
  [39, 'الزُّمَرِ', 'Az-Zumar', 75],
  [40, 'غَافِرٍ', 'Ghafir', 85],
  [41, 'فُصِّلَتۡ', 'Fussilat', 54],
  [42, 'الشُّورَىٰ', 'Ash-Shura', 53],
  [43, 'الزُّخۡرُفِ', 'Az-Zukhruf', 89],
  [44, 'الدُّخَانِ', 'Ad-Dukhan', 59],
  [45, 'الجَاثِيَةِ', 'Al-Jathiyah', 37],
  [46, 'الأَحۡقَافِ', 'Al-Ahqaf', 35],
  [47, 'مُحَمَّدٍ', 'Muhammad', 38],
  [48, 'الفَتۡحِ', 'Al-Fath', 29],
  [49, 'الحُجُرَاتِ', 'Al-Hujurat', 18],
  [50, 'قٓ', 'Qaf', 45],
  [51, 'الذَّارِيَاتِ', 'Adh-Dhariyat', 60],
  [52, 'الطُّورِ', 'At-Tur', 49],
  [53, 'النَّجۡمِ', 'An-Najm', 62],
  [54, 'القَمَرِ', 'Al-Qamar', 55],
  [55, 'الرَّحۡمَٰن', 'Ar-Rahman', 78],
  [56, 'الوَاقِعَةِ', 'Al-Waqi’ah', 96],
  [57, 'الحَدِيدِ', 'Al-Hadid', 29],
  [58, 'المُجَادلَةِ', 'Al-Mujadilah', 22],
  [59, 'الحَشۡرِ', 'Al-Hashr', 24],
  [60, 'المُمۡتَحنَةِ', 'Al-Mumtahanah', 13],
  [61, 'الصَّفِّ', 'As-Saff', 14],
  [62, 'الجُمُعَةِ', 'Al-Jumu’ah', 11],
  [63, 'المُنَافِقُونَ', 'Al-Munafiqun', 11],
  [64, 'التَّغَابُنِ', 'At-Taghabun', 18],
  [65, 'الطَّلَاقِ', 'At-Talaq', 12],
  [66, 'التَّحۡرِيمِ', 'At-Tahrim', 12],
  [67, 'المُلۡكِ', 'Al-Mulk', 30],
  [68, 'القَلَمِ', 'Al-Qalam', 52],
  [69, 'الحَاقَّةِ', 'Al-Haqqah', 52],
  [70, 'المَعَارِجِ', 'Al-Ma’arij', 44],
  [71, 'نُوحٍ', 'Nuh', 28],
  [72, 'الجِنِّ', 'Al-Jinn', 28],
  [73, 'المُزَّمِّلِ', 'Al-Muzzammil', 20],
  [74, 'المُدَّثِّرِ', 'Al-Muddaththir', 56],
  [75, 'القِيَامَةِ', 'Al-Qiyamah', 40],
  [76, 'الإِنسَانِ', 'Al-Insan', 31],
  [77, 'المُرۡسَلَاتِ', 'Al-Mursalat', 50],
  [78, 'النَّبَإِ', 'An-Naba', 40],
  [79, 'النَّازِعَاتِ', 'An-Nazi’at', 46],
  [80, 'عَبَسَ', 'Abasa', 42],
  [81, 'التَّكۡوِيرِ', 'At-Takwir', 29],
  [82, 'الانفِطَارِ', 'Al-Infitar', 19],
  [83, 'المُطَفِّفِينَ', 'Al-Mutaffifin', 36],
  [84, 'الانشِقَاقِ', 'Al-Inshiqaq', 25],
  [85, 'البُرُوجِ', 'Al-Buruj', 22],
  [86, 'الطَّارِقِ', 'At-Tariq', 17],
  [87, 'الأَعۡلَىٰ', 'Al-A’la', 19],
  [88, 'الغَاشِيَةِ', 'Al-Ghashiyah', 26],
  [89, 'الفَجۡرِ', 'Al-Fajr', 30],
  [90, 'البَلَدِ', 'Al-Balad', 20],
  [91, 'الشَّمۡسِ', 'Ash-Shams', 15],
  [92, 'اللَّيۡلِ', 'Al-Layl', 21],
  [93, 'الضُّحَىٰ', 'Ad-Duha', 11],
  [94, 'الشَّرۡحِ', 'Ash-Sharh', 8],
  [95, 'التِّينِ', 'At-Tin', 8],
  [96, 'العَلَقِ', 'Al-Alaq', 19],
  [97, 'القَدۡرِ', 'Al-Qadr', 5],
  [98, 'البَيِّنَةِ', 'Al-Bayyinah', 8],
  [99, 'الزَّلۡزَلَةِ', 'Az-Zalzalah', 8],
  [100, 'العَادِيَاتِ', 'Al-Adiyat', 11],
  [101, 'القَارِعَةِ', 'Al-Qari’ah', 11],
  [102, 'التَّكَاثُرِ', 'At-Takathur', 8],
  [103, 'العَصۡرِ', 'Al-Asr', 3],
  [104, 'الهُمَزَةِ', 'Al-Humazah', 9],
  [105, 'الفِيلِ', 'Al-Fil', 5],
  [106, 'قُرَيۡشٍ', 'Quraysh', 4],
  [107, 'المَاعُونِ', 'Al-Ma’un', 7],
  [108, 'الكَوۡثَرِ', 'Al-Kawthar', 3],
  [109, 'الكَافِرُونَ', 'Al-Kafirun', 6],
  [110, 'النَّصۡرِ', 'An-Nasr', 3],
  [111, 'المَسَدِ', 'Al-Masad', 5],
  [112, 'الإِخۡلَاصِ', 'Al-Ikhlas', 4],
  [113, 'الفَلَقِ', 'Al-Falaq', 5],
  [114, 'النَّاسِ', 'An-Nas', 6],
];

export const ALL_SURAHS: SurahMeta[] = COMPACT_SURAHS.map(([number, ar, en, ayahs]) => ({
  number,
  ar: number === 1 ? 'الفاتحة' : ar,
  en,
  bn: number === 1 ? 'সূরা আল-ফাতিহা' : `সূরা ${en}`,
  ayahs,
}));

export const DEFAULT_SURAH: SurahMeta = ALL_SURAHS[0];

export const pad3 = (n: number): string => String(n).padStart(3, '0');

export const getSurahAudioUrl = (reciterIndex: number, surahNumber: number): string => {
  const r = RECITERS[reciterIndex] || RECITERS[0];
  if (r.resolveSurahUrl) return r.resolveSurahUrl(surahNumber);
  return `${r.surahBase}${pad3(surahNumber)}.mp3`;
};

export const getAyahAudioUrl = (
  reciterIndex: number,
  surahNumber: number,
  ayahNumber: number
): string => {
  const r = RECITERS[reciterIndex] || RECITERS[0];
  return `${r.ayahBase}${pad3(surahNumber)}${pad3(ayahNumber)}.mp3`;
};

export const getEnglishAyahAudioUrl = (surahNumber: number, ayahNumber: number): string => {
  return `${ENGLISH_AYAH_BASE}${pad3(surahNumber)}${pad3(ayahNumber)}.mp3`;
};

export const getBanglaTtsUrl = (text: string): string => {
  const trimmed = text.replace(/\s+/g, ' ').trim().slice(0, 180);
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=bn&q=${encodeURIComponent(
    trimmed
  )}`;
};

export const toBengaliDigits = (n: number): string =>
  String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

export const toArabicDigits = (n: number): string =>
  String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

export function normalizeArabic(text: string): string {
  return text
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\uFEFF]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\u0621-\u064A\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeAyahForHifz(arabicText: string): string[] {
  const rawTokens = arabicText.trim().split(/\s+/).filter(Boolean);
  const tokens: string[] = [];
  const markOnlyRe = /^[\u06D6-\u06ED\u06DE\u06E9]+$/;
  for (const tok of rawTokens) {
    if (markOnlyRe.test(tok)) {
      if (tokens.length > 0) {
        tokens[tokens.length - 1] = `${tokens[tokens.length - 1]} ${tok}`;
      }
    } else {
      tokens.push(tok);
    }
  }
  return tokens;
}

function stripPrependedBismillah(text: string): string {
  // api.alquran.cloud prepends Bismillah to Ayah 1 of Surahs 2..114 (except Surah 9).
  const cleaned = text.replace(/^\uFEFF/, '').trim();
  const prefixes = [
    'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ',
    'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ',
    'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ',
  ];
  for (const p of prefixes) {
    if (cleaned.startsWith(p)) {
      return cleaned.slice(p.length).trim();
    }
  }
  // Fallback: match first 4 words if normalized text starts with Bismillah
  const parts = cleaned.split(/\s+/);
  if (parts.length > 4 && normalizeArabic(parts.slice(0, 4).join(' ')) === 'بسم الله الرحمن الرحيم') {
    return parts.slice(4).join(' ').trim();
  }
  return cleaned;
}

export async function fetchSurahAyahs(surahNumber: number): Promise<AyahItem[]> {
  if (surahNumber === 1) return FATIHAH_AYAHS;
  const idbKey = `surah:v2:${surahNumber}`;
  try {
    const cachedIdb = await idbGet<AyahItem[]>(idbKey);
    if (Array.isArray(cachedIdb) && cachedIdb.length > 0) return cachedIdb;
  } catch {
    // ignore
  }
  const cacheKey = `zk_surah_v2_${surahNumber}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as AyahItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        idbPut(idbKey, parsed).catch(() => {});
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  const res = await fetch(
    `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,bn.bengali,en.sahih`
  );
  if (!res.ok) throw new Error('Failed to load surah ayahs');
  const json = await res.json();
  const [arEd, bnEd, enEd] = json.data || [];
  const items: AyahItem[] = (arEd?.ayahs || []).map((a: any, idx: number) => {
    let arText = String(a.text || '').replace(/^\uFEFF/, '').trim();
    if (idx === 0 && surahNumber !== 1 && surahNumber !== 9) {
      arText = stripPrependedBismillah(arText);
    }
    return {
      ar: arText,
      bn: String(bnEd?.ayahs?.[idx]?.text || ''),
      en: String(enEd?.ayahs?.[idx]?.text || ''),
    };
  });
  idbPut(idbKey, items).catch(() => {});
  return items;
}

export interface OfflineBulkProgress {
  phase: 'text' | 'audio';
  completed: number;
  total: number;
  label: string;
  bytes: number;
}

export async function downloadAllQuranText(
  onProgress?: (p: OfflineBulkProgress) => void,
  signal?: AbortSignal,
  forceRefresh = false
): Promise<number> {
  if (!forceRefresh) {
    const existing = await idbKeys('surah:v2:').catch(() => []);
    if (existing.length >= 114) {
      onProgress?.({
        phase: 'text',
        completed: 114,
        total: 114,
        label: 'All 114 Surahs text already saved',
        bytes: 0,
      });
      return 114;
    }
  }

  onProgress?.({
    phase: 'text',
    completed: 0,
    total: 114,
    label: 'Fetching complete Arabic, বাংলা & English Quran…',
    bytes: 0,
  });

  const [arRes, bnRes, enRes] = await Promise.all([
    fetch('https://api.alquran.cloud/v1/quran/quran-uthmani', { signal }),
    fetch('https://api.alquran.cloud/v1/quran/bn.bengali', { signal }),
    fetch('https://api.alquran.cloud/v1/quran/en.sahih', { signal }),
  ]);

  if (!arRes.ok || !bnRes.ok || !enRes.ok) {
    throw new Error('Failed to fetch complete Quran text');
  }

  const [arJson, bnJson, enJson] = await Promise.all([
    arRes.json(),
    bnRes.json(),
    enRes.json(),
  ]);

  const arSurahs = arJson?.data?.surahs || [];
  const bnSurahs = bnJson?.data?.surahs || [];
  const enSurahs = enJson?.data?.surahs || [];

  await idbPut('surah:v2:1', FATIHAH_AYAHS);

  let savedCount = 1;
  for (let s = 1; s < arSurahs.length; s++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const surahNum = Number(arSurahs[s]?.number || s + 1);
    const arAyahs = arSurahs[s]?.ayahs || [];
    const bnAyahs = bnSurahs[s]?.ayahs || [];
    const enAyahs = enSurahs[s]?.ayahs || [];

    const items: AyahItem[] =
      surahNum === 1
        ? FATIHAH_AYAHS
        : arAyahs.map((a: any, idx: number) => {
            let arText = String(a.text || '').replace(/^\uFEFF/, '').trim();
            if (idx === 0 && surahNum !== 1 && surahNum !== 9) {
              arText = stripPrependedBismillah(arText);
            }
            return {
              ar: arText,
              bn: String(bnAyahs[idx]?.text || ''),
              en: String(enAyahs[idx]?.text || ''),
            };
          });

    await idbPut(`surah:v2:${surahNum}`, items);
    savedCount++;
    if (savedCount % 6 === 0 || savedCount === 114) {
      onProgress?.({
        phase: 'text',
        completed: savedCount,
        total: 114,
        label: `Saving Surah ${surahNum}/114…`,
        bytes: 0,
      });
    }
  }
  return savedCount;
}

export async function downloadAllSurahAudio(
  reciterIndex: number,
  onProgress?: (p: OfflineBulkProgress) => void,
  signal?: AbortSignal,
  forceRefresh = false,
  surahSubset?: number[]
): Promise<{ saved: number; failed: number; bytes: number }> {
  const existingKeys = forceRefresh
    ? new Set<string>()
    : new Set(await idbKeys(`audio:0:`).catch(() => []));

  const surahNumbers =
    surahSubset && surahSubset.length > 0
      ? surahSubset
      : ALL_SURAHS.map((s) => s.number);

  let completed = 0;
  let failed = 0;
  let totalBytes = 0;
  const totalCount = surahNumbers.length;
  let cursor = 0;

  const worker = async () => {
    while (cursor < surahNumbers.length) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const surahNum = surahNumbers[cursor++];
      const key = `audio:0:${surahNum}:${reciterIndex}`;
      const meta = ALL_SURAHS[surahNum - 1];

      if (!forceRefresh && existingKeys.has(key)) {
        completed++;
        onProgress?.({
          phase: 'audio',
          completed,
          total: totalCount,
          label: `${meta.en} (${completed}/${totalCount})`,
          bytes: totalBytes,
        });
        continue;
      }

      try {
        const res = await fetch(getSurahAudioUrl(reciterIndex, surahNum), { signal });
        if (!res.ok) throw new Error('Audio fetch failed');
        const blob = await res.blob();
        totalBytes += blob.size;
        await idbPut(key, blob);
      } catch (err: any) {
        if (err?.name === 'AbortError') throw err;
        failed++;
      }
      completed++;
      onProgress?.({
        phase: 'audio',
        completed,
        total: totalCount,
        label: `${meta.en} (${completed}/${totalCount})`,
        bytes: totalBytes,
      });
    }
  };

  const concurrency = 3;
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return { saved: completed - failed, failed, bytes: totalBytes };
}

export const PDF_COVER_PRESETS: { label: string; url: string }[] = [
  {
    label: '15-Line Quran Cover',
    url:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#8B6DF0"/><stop offset="100%" stop-color="#4B2FB8"/></linearGradient></defs><rect width="600" height="340" fill="url(#g)"/><rect x="26" y="24" width="548" height="292" rx="22" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="3"/><circle cx="300" cy="138" r="64" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.45)" stroke-width="2"/><text x="300" y="154" text-anchor="middle" fill="#fff" font-family="serif" font-size="44">القرآن</text><text x="300" y="244" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="700" font-size="22">15-Line Hifz Quran</text><text x="300" y="276" text-anchor="middle" fill="rgba(255,255,255,0.82)" font-family="sans-serif" font-size="14">Tap below to open PDF</text></svg>`
      ),
  },
  {
    label: 'Islamic Kitab Cover',
    url:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1E6B52"/><stop offset="100%" stop-color="#0E3B2E"/></linearGradient></defs><rect width="600" height="340" fill="url(#g)"/><rect x="26" y="24" width="548" height="292" rx="22" fill="none" stroke="rgba(232,203,130,0.55)" stroke-width="3"/><text x="300" y="148" text-anchor="middle" fill="#F6E2A8" font-family="serif" font-size="48">كتاب</text><text x="300" y="238" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="700" font-size="22">Islamic Book &amp; Notes</text><text x="300" y="272" text-anchor="middle" fill="rgba(255,255,255,0.78)" font-family="sans-serif" font-size="14">Tap below to read</text></svg>`
      ),
  },
];
