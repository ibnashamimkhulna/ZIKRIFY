export type TeachLang = 'en' | 'bn' | 'ar' | 'ur';

export type MultiText = Record<TeachLang, string>;

export type TajweedRuleId =
  | 'ghunnah'
  | 'ikhfa'
  | 'idgham_ghunnah'
  | 'idgham_no_ghunnah'
  | 'iqlab'
  | 'qalqalah'
  | 'madd_wajib'
  | 'madd_asli'
  | 'tafkheem'
  | 'lam_allah'
  | 'silent';

export type MakhrajAreaId = 'jawf' | 'halq' | 'lisan' | 'shafatan' | 'khayshum';

export type SifatId =
  | 'hams'
  | 'jahr'
  | 'shiddah'
  | 'tawassut'
  | 'rakhawah'
  | 'istila'
  | 'istifal'
  | 'itbaq'
  | 'infitah'
  | 'idhlaq'
  | 'ismat'
  | 'qalqalah'
  | 'safeer'
  | 'leen'
  | 'inhiraf'
  | 'takrir'
  | 'tafashshi'
  | 'istitalah'
  | 'ghunnah';

export interface TajweedRuleMeta {
  id: TajweedRuleId;
  colorLight: string;
  colorDark: string;
  bgLight: string;
  bgDark: string;
  harakat: string;
  name: MultiText;
  shortDesc: MultiText;
  howTo: MultiText;
  exampleAr: string;
}

export interface MakhrajPoint {
  id: number;
  area: MakhrajAreaId;
  letters: string[];
  name: MultiText;
  detail: MultiText;
}

export interface SifatMeta {
  id: SifatId;
  category: 'opposite' | 'special';
  oppositeOf?: SifatId;
  name: MultiText;
  detail: MultiText;
  lettersLabel: string;
}

export interface ArabicLetterMeta {
  letter: string;
  name: MultiText;
  makhrajId: number;
  sifatIds: SifatId[];
  heavy?: boolean;
  tip: MultiText;
}

export interface QaidaLesson {
  id: string;
  title: MultiText;
  badge: string;
  summary: MultiText;
  points: Array<{
    subtitle: MultiText;
    detail: MultiText;
    examples?: Array<{ ar: string; note: MultiText }>;
  }>;
}

export const TEACH_LANG_LABELS: Record<TeachLang, string> = {
  en: 'English',
  bn: 'বাংলা',
  ar: 'العربية',
  ur: 'اردو',
};

export const TAJWEED_RULES: Record<TajweedRuleId, TajweedRuleMeta> = {
  ghunnah: {
    id: 'ghunnah',
    colorLight: '#15803D',
    colorDark: '#4ADE80',
    bgLight: '#DCFCE7',
    bgDark: 'rgba(74, 222, 128, 0.16)',
    harakat: '2',
    name: {
      en: 'Ghunnah (Nasalization)',
      bn: 'ওয়াজিব গুন্নাহ (নাক থেকে সুর)',
      ar: 'غُنّة واجبة (نُون ومِيم مُشَدَّدتان)',
      ur: 'واجب غنہ (ناک سے آواز)',
    },
    shortDesc: {
      en: 'Hold a clear nasal resonance for 2 counts on نّ or مّ.',
      bn: 'তাশদীদযুক্ত নূন (نّ) ও মীম (مّ)-এ ২ আলিফ/২ হরকত নাকের বাঁশিতে গুন্নাহ করে পড়ুন।',
      ar: 'إخراج صوت رنّان من الخيشوم بمقدار حركتين عند النون والميم المشددتين.',
      ur: 'مشدد نون (نّ) اور مشدد میم (مّ) پر دو حرکات کے برابر ناک میں آواز روک کر غنہ کریں۔',
    },
    howTo: {
      en: 'Let the sound vibrate in the nasal passage (Al-Khayshum) smoothly without rushing.',
      bn: 'আওয়াজ দ্রুত না ছেড়ে নাকের ভেতর (খাইশূম) ২ সেকেন্ডের মতো স্পষ্ট গুঞ্জরিত করুন।',
      ar: 'أبقِ الصوت يتردد في الخيشوم بوضوح وسلاسة لحركتين.',
      ur: 'آواز کو جلدی ختم کیے بغیر ناک کے بانسے (خیشوم) میں واضح طور پر گونجائیں۔',
    },
    exampleAr: 'إِنَّ · ثُمَّ · عَمَّ',
  },
  ikhfa: {
    id: 'ikhfa',
    colorLight: '#0F766E',
    colorDark: '#2DD4BF',
    bgLight: '#CCFBF1',
    bgDark: 'rgba(45, 212, 191, 0.16)',
    harakat: '2',
    name: {
      en: 'Ikhfa (Concealed Nasal Sound)',
      bn: 'ইখফা (গোপন করে গুন্নাহ)',
      ar: 'إخفاء حقيقي / شفوي',
      ur: 'اخفاء (آواز چھپا کر غنہ)',
    },
    shortDesc: {
      en: 'Hide Nun Sakinah/Tanween (or Meem before ب) between Izhar and Idgham with 2-count Ghunnah.',
      bn: 'নূন সাকিন বা তানভীনের পর ইখফার ১৫ হরফ (অথবা মীম সাকিনের পর ب) এলে আওয়াজ গোপন করে ২ হরকত গুন্নাহ করুন।',
      ar: 'نطق النون الساكنة أو التنوين بحالة بين الإظهار والإدغام مع بقاء الغنة حركتين.',
      ur: 'نون ساکن/تنوین کے بعد اخفاء کے ۱۵ حروف (یا میم ساکن کے بعد ب) آئیں تو آواز چھپا کر غنہ کریں۔',
    },
    howTo: {
      en: 'Do not touch the tongue firmly to the Noon makhraj; hover near the next letter with nasal tone.',
      bn: 'জিহ্বা নূনের মাখরাজে পুরোপুরি না লাগিয়ে পরবর্তী হরফের কাছাকাছি রেখে নাক দিয়ে গুন্নাহ করুন।',
      ar: 'لا تُلصق اللسان بمخرج النون، بل هيّئ الفم للحرف التالي مع صوت الغنة.',
      ur: 'زبان کو نون کے مخرج پر پورا نہ لگائیں بلکہ اگلے حرف کے قریب رکھ کر ناک سے غنہ نکالیں۔',
    },
    exampleAr: 'مِنْ قَبْلُ · أَنْفُسِهِمْ · تَرْمِيهِمْ بِحِجَارَةٍ',
  },
  idgham_ghunnah: {
    id: 'idgham_ghunnah',
    colorLight: '#2563EB',
    colorDark: '#60A5FA',
    bgLight: '#DBEAFE',
    bgDark: 'rgba(96, 165, 250, 0.18)',
    harakat: '2',
    name: {
      en: 'Idgham with Ghunnah (Merging)',
      bn: 'ইদগামে বা-গুন্নাহ (মিলিয়ে গুন্নাহ)',
      ar: 'إدغام بغنّة (ينمو / ميم في ميم)',
      ur: 'ادغام بغنہ (ملا کر غنہ)',
    },
    shortDesc: {
      en: 'Merge Nun Sakinah/Tanween into ي ن م و (or Meem into م) while keeping 2-count nasal Ghunnah.',
      bn: 'নূন সাকিন/তানভীনের পর ي ن م و এলে (অথবা মীম সাকিনের পর م) মিলিয়ে ২ হরকত গুন্নাহসহ পড়ুন।',
      ar: 'إدخال النون الساكنة أو التنوين في حروف (ينمو) أو الميم في الميم مع غنة حركتين.',
      ur: 'نون ساکن/تنوین کے بعد (ی ن م و) آئے یا میم کے بعد میم ہو تو ملا کر غنہ کے ساتھ پڑھیں۔',
    },
    howTo: {
      en: 'Blend smoothly into the next letter so there is no pause, letting the nasal sound flow for 2 counts.',
      bn: 'আগের নূন/তানভীন সম্পূর্ণ বাদ দিয়ে পরের হরফের সাথে মিলিয়ে নাকের সুর ২ হরকত ধরে রাখুন।',
      ar: 'ادمج الحرفين معاً بسلاسة مع الحفاظ على صوت الغنة من الخيشوم.',
      ur: 'پہلے حرف کو اگلے حرف میں ضم کر کے دو حرکات تک ناک میں غنہ جاری رکھیں۔',
    },
    exampleAr: 'مَنْ يَقُولُ · مِن وَلِيٍّ · لَهُمْ مَغْفِرَةٌ',
  },
  idgham_no_ghunnah: {
    id: 'idgham_no_ghunnah',
    colorLight: '#0284C7',
    colorDark: '#38BDF8',
    bgLight: '#E0F2FE',
    bgDark: 'rgba(56, 189, 248, 0.18)',
    harakat: '0',
    name: {
      en: 'Idgham Bila Ghunnah (Pure Merge)',
      bn: 'ইদগামে বিলা-গুন্নাহ (গুন্নাহ ছাড়া মিল)',
      ar: 'إدغام كامل بلا غنّة (ل، ر)',
      ur: 'ادغام بلا غنہ (بغیر غنہ کے ملاپ)',
    },
    shortDesc: {
      en: 'Completely merge Nun Sakinah or Tanween into ل or ر with NO nasal sound.',
      bn: 'নূন সাকিন বা তানভীনের পর ل বা ر এলে নূনকে সম্পূর্ণ বিলীন করে গুন্নাহ ছাড়াই মিলিয়ে পড়ুন।',
      ar: 'إدغام النون الساكنة أو التنوين إدغاماً كاملاً في اللام والراء من غير غنّة.',
      ur: 'نون ساکن یا تنوین کے بعد ل یا ر آئے تو نون کو بالکل ختم کر کے بغیر غنہ کے ملا کر پڑھیں۔',
    },
    howTo: {
      en: 'Skip the Noon sound entirely and pronounce the doubled لّ or رّ cleanly from the tongue.',
      bn: 'নাক দিয়ে কোনো সুর না করে সরাসরি পরের লাম (لّ) বা র (رّ)-কে তাশদীদসহ স্পষ্ট উচ্চারণ করুন।',
      ar: 'انطق اللام أو الراء مشددةً مباشرة دون أي أثر للغنة.',
      ur: 'ناک میں آواز لے جائے بغیر اگلے لام یا را کو تشدید کے ساتھ صاف پڑھیں۔',
    },
    exampleAr: 'مِنْ رَبِّهِمْ · هُدًى لِلْمُتَّقِينَ',
  },
  iqlab: {
    id: 'iqlab',
    colorLight: '#A21CAF',
    colorDark: '#E879F9',
    bgLight: '#FAE8FF',
    bgDark: 'rgba(232, 121, 249, 0.18)',
    harakat: '2',
    name: {
      en: 'Iqlab (Conversion to Meem)',
      bn: 'ইকলাব (নূনকে মীমে পরিবর্তন)',
      ar: 'إقلاب (قلب النون ميماً قبل الباء)',
      ur: 'اقلاب (نون کو میم میں بدلنا)',
    },
    shortDesc: {
      en: 'When ب follows Nun Sakinah or Tanween, turn the Nun into a soft hidden Meem (م) with 2 counts.',
      bn: 'নূন সাকিন বা তানভীনের পর ب (বা) এলে নূনকে ছোট মীম (م)-এ পরিবর্তন করে গুন্নাহসহ পড়ুন।',
      ar: 'قلب النون الساكنة أو التنوين ميماً مخفاةً عند حرف الباء مع غنّة حركتين.',
      ur: 'نون ساکن یا تنوین کے بعد ب آئے تو نون کو میم سے بدل کر دو حرکات غنہ کے ساتھ پڑھیں۔',
    },
    howTo: {
      en: 'Gently touch both lips together for Meem with light contact (do not press hard), holding 2 counts before ب.',
      bn: 'দুই ঠোঁট আলতোভাবে ছুঁয়ে (চেপে না ধরে) ২ হরকত মীমের গুন্নাহ করে তারপর ب উচ্চারণ করুন।',
      ar: 'أطبق الشفتين برفق دون كزّ، مع غنة حركتين قبل النطق بالباء.',
      ur: 'دونوں ہونٹوں کو نرمی سے ملائیں (زور سے نہ دبائیں) اور دو حرکات غنہ کر کے ب پڑھیں۔',
    },
    exampleAr: 'مِنۢ بَعْدِ · سَمِيعٌۢ بَصِيرٌ',
  },
  qalqalah: {
    id: 'qalqalah',
    colorLight: '#D97706',
    colorDark: '#FBBF24',
    bgLight: '#FEF3C7',
    bgDark: 'rgba(251, 191, 36, 0.18)',
    harakat: 'Echo',
    name: {
      en: 'Qalqalah (Echoing Bounce)',
      bn: 'কলকলা (প্রতিধ্বনি / ধাক্কা)',
      ar: 'قلقلة (قُطْبُ جَدّ)',
      ur: 'قلقلہ (آواز میں گونج/تکرار)',
    },
    shortDesc: {
      en: 'Bounce/echo ق ط ب ج د cleanly when they carry Sukun or when stopping on them.',
      bn: 'কলকলার ৫টি হরফ (ق ط ب ج د)-এ সাকিন বা ওয়াকফ হলে মাখরাজে ধাক্কা দিয়ে প্রতিধ্বনির মতো উচ্চারণ করুন।',
      ar: 'اهتزاز الصوت في مخرج الحرف الساكن من حروف (قطب جد) حتى يُسمع له نبرة قوية.',
      ur: 'حروف قلقلہ (ق ط ب ج د) پر جزم ہو یا وقف کیا جائے تو مخرج میں حرکت/گونج پیدا کریں۔',
    },
    howTo: {
      en: 'Release the makhraj crisply without adding a Fatha/Kasra/Dammah vowel sound after it.',
      bn: 'মাখরাজ ছেড়ে দেওয়ার সময় আ/ই/উ এর মতো কোনো হরকতের সুর যেন যোগ না হয় সেদিকে খেয়াল রাখুন।',
      ar: 'باعد بين طرفي المخرج فجأة دون إمالةٍ إلى فتحة أو كسرة أو ضمة.',
      ur: 'حرف کے بعد زبر، زیر یا پیش کی آواز پیدا کیے بغیر مخرج کو جھٹکے سے الگ کریں۔',
    },
    exampleAr: 'يَقْطَعُونَ · قُلْ هُوَ اللَّهُ أَحَدٌ',
  },
  madd_wajib: {
    id: 'madd_wajib',
    colorLight: '#DC2626',
    colorDark: '#FB7185',
    bgLight: '#FEE2E2',
    bgDark: 'rgba(251, 113, 133, 0.18)',
    harakat: '4–6',
    name: {
      en: 'Madd Wajib / Jaiz / Lazim (Long Stretch)',
      bn: 'মদ্দে ওয়াজিব / জায়েয / লাযিম (লম্বা টান)',
      ar: 'المدّ الواجب / الجائز / اللازم (٤–٦ حركات)',
      ur: 'مد واجب / جائز / لازم (لمبا کھینچنا)',
    },
    shortDesc: {
      en: 'Stretch this Madd vowel for 4–5 harakat (or 6 counts for Madd Lazim).',
      bn: 'হামযা বা সাকিনের কারণে এই মদ্দকে ৪–৫ আলিফ/হরকত (মদ্দে লাযিমে ৬ হরকত) লম্বা করে টানুন।',
      ar: 'إطالة الصوت بحرف المدّ ٤ أو ٥ حركات لوجود الهمزة، أو ٦ حركات للمدّ اللازم.',
      ur: 'ہمزہ یا سکون کی وجہ سے مد کو ۴ تا ۵ حرکات (اور مد لازم میں ۶ حرکات) لمبا کھینچیں۔',
    },
    howTo: {
      en: 'Keep the pitch steady and smooth across 4–6 counts without trembling the voice.',
      bn: 'আওয়াজ কাঁপানো ছাড়া একটানা সমান তালে ৪ থেকে ৬ হরকত পরিমাণ টেনে পড়ুন।',
      ar: 'مُدّ الصوت باستقامة وثبات طوال عدد الحركات المطلوب.',
      ur: 'آواز کو ہلائے بغیر ایک ہی لے میں ۴ سے ۶ حرکات تک کھینچ کر پڑھیں۔',
    },
    exampleAr: 'جَآءَ · أُولَـٰٓئِكَ · وَلَا ٱلضَّآلِّينَ',
  },
  madd_asli: {
    id: 'madd_asli',
    colorLight: '#EA580C',
    colorDark: '#FDBA74',
    bgLight: '#FFEDD5',
    bgDark: 'rgba(253, 186, 116, 0.16)',
    harakat: '2',
    name: {
      en: 'Madd Tabi’i / Natural Stretch (2 Counts)',
      bn: 'মদ্দে তবায়ী / আসলি (২ হরকত টান)',
      ar: 'المدّ الطبيعي / الأصلي / الصلة (حركتان)',
      ur: 'مد اصلی / طبعی (۲ حرکات)',
    },
    shortDesc: {
      en: 'Natural elongation of Alif, Waw, Ya, dagger Alif (ٰ) or Silah for 2 balanced counts.',
      bn: 'খাড়া যবর (ٰ), উল্টা পেশ বা মদ্দের হরফকে স্বাভাবিক ২ হরকত (১ আলিফ) পরিমাণ টেনে পড়ুন।',
      ar: 'مدّ الصوت بحرف المدّ أو الألف الخنجرية أو هاء الصلة بمقدار حركتين طبيعيتين.',
      ur: 'کھڑی زبر، الٹا پیش، یا حروفِ مدہ کو قدرتی طور پر ۲ حرکات (ایک الف) کے برابر کھینچیں۔',
    },
    howTo: {
      en: 'Count two smooth finger beats—never cut it short to 1 beat or over-stretch.',
      bn: '১ আলিফ তথা দুটি হরকতের সমান সময় ধরে পড়ুন—বেশি ছোট বা বেশি লম্বা করবেন না।',
      ar: 'حافظ على زمن الحركتين بدقة دون تقصير أو زيادة.',
      ur: 'نہ بہت مختصر کریں اور نہ بہت لمبا، بلکہ ٹھیک دو حرکات کے برابر پڑھیں۔',
    },
    exampleAr: 'مَـٰلِكِ · بِهِۦ · قَالُوا',
  },
  tafkheem: {
    id: 'tafkheem',
    colorLight: '#1D4ED8',
    colorDark: '#93C5FD',
    bgLight: '#DBEAFE',
    bgDark: 'rgba(147, 197, 253, 0.16)',
    harakat: 'Full Mouth',
    name: {
      en: 'Tafkheem (Heavy Full-Mouth Letter)',
      bn: 'তাফখীম (মোটা ও ভরাট উচ্চারণ)',
      ar: 'حرف مُفَخَّم (استعلاء / تفخيم الراء)',
      ur: 'تفخیم (پُر اور موٹا پڑھنا)',
    },
    shortDesc: {
      en: 'Raise the back of the tongue to produce a deep, full-mouth resonance (خص ضغط قظ & heavy ر).',
      bn: 'ইস্তি‘লা-র ৭ হরফ (خ ص ض غ ط ق ظ) এবং মোটা র (ر) জিহ্বার গোড়া উঁচু করে মুখ ভরে মোটা করে পড়ুন।',
      ar: 'تسمين الحرف برفع أقصى اللسان إلى الحنك الأعلى فيمتلئ الفم بصداه.',
      ur: 'حروفِ مستعلیہ (خ ص ض غ ط ق ظ) اور پُر را (ر) کو زبان کی جڑ اوپر اٹھا کر منہ بھر کر موٹا پڑھیں۔',
    },
    howTo: {
      en: 'Do not round your lips forward artificially—let the heaviness come from raising the back of the tongue.',
      bn: 'ঠোঁট গোল না করে জিহ্বার পেছনের অংশ উপরের তালুর দিকে তুলে ভেতর থেকে ভরাট আওয়াজ আনুন।',
      ar: 'اجعل التفخيم من ارتفاع أقصى اللسان لا من ضمّ الشفتين.',
      ur: 'ہونٹ گول کیے بغیر زبان کے پچھلے حصے کو اوپر اٹھا کر گہری موٹی آواز نکالیں۔',
    },
    exampleAr: 'ٱلصِّرَٰطَ · غَيْرِ · ٱلْمَغْضُوبِ',
  },
  lam_allah: {
    id: 'lam_allah',
    colorLight: '#6D28D9',
    colorDark: '#C4B5FD',
    bgLight: '#EDE9FE',
    bgDark: 'rgba(196, 181, 253, 0.16)',
    harakat: 'Heavy/Light',
    name: {
      en: 'Lam of Allah (Heavy vs Light)',
      bn: 'আল্লাহ শব্দের লাম (মোটা বা পাতলা)',
      ar: 'لام لفظ الجلالة (تفخيم / ترقيق)',
      ur: 'لفظِ اللہ کا لام (مفخم یا مرقق)',
    },
    shortDesc: {
      en: 'Pronounce “Allah” heavy (Allāh) after Fatha/Dammah, and light (lillāh) after Kasrah.',
      bn: '“আল্লাহ” শব্দের আগে যবর বা পেশ থাকলে লাম মোটা (আল্লা-হ), আর যের থাকলে পাতলা (লিল্লা-হ) পড়ুন।',
      ar: 'تُفَخَّم لام لفظ الجلالة إذا سُبقت بفتح أو ضم، وتُرَقَّق إذا سُبقت بكسر.',
      ur: 'لفظ اللہ سے پہلے زبر یا پیش ہو تو لام موٹا (پُر)، اور زیر ہو تو باریک پڑھیں۔',
    },
    howTo: {
      en: 'Listen carefully to the vowel directly preceding the word Allah before choosing heavy or light Lam.',
      bn: 'আল্লাহ শব্দের ঠিক আগের হরকত যের নাকি যবর/পেশ—তা দেখে মোটা বা চিকন উচ্চারণ ঠিক করুন।',
      ar: 'انتبه للحركة التي تسبق لفظ الجلالة مباشرةً لتحديد التفخيم أو الترقيق.',
      ur: 'لفظ اللہ سے بالکل پہلے والی حرکت کو دیکھ کر موٹا یا باریک ادا کریں۔',
    },
    exampleAr: 'قُلْ هُوَ ٱللَّهُ · بِسْمِ ٱللَّهِ',
  },
  silent: {
    id: 'silent',
    colorLight: '#64748B',
    colorDark: '#94A3B8',
    bgLight: '#F1F5F9',
    bgDark: 'rgba(148, 163, 184, 0.14)',
    harakat: 'Silent',
    name: {
      en: 'Hamzatul Wasl / Silent Letter',
      bn: 'হামযাতুল ওয়াসল / অনুচ্চারিত হরফ',
      ar: 'همزة الوصل / حرف غير منطوق وصلاً',
      ur: 'ہمزۃ الوصل / خاموش حرف',
    },
    shortDesc: {
      en: 'Dropped silently when connecting words; pronounced only when starting from this word.',
      bn: 'মিলিয়ে পড়ার সময় এই হরফটি উচ্চারিত হয় না; শুধু এই শব্দ থেকে শুরু করলে পড়া হয়।',
      ar: 'تسقط في درج الكلام ولا تُنطق عند الوصل، وتُثبت عند الابتداء بها فقط.',
      ur: 'ملا کر پڑھنے کی صورت میں یہ حرف نہیں پڑھا جاتا، صرف اسی لفظ سے شروع کرنے پر پڑھا جاتا ہے۔',
    },
    howTo: {
      en: 'Connect the vowel right before it directly into the next pronounced consonant.',
      bn: 'মিলিয়ে পড়ার সময় সরাসরি পরের সাকিন বা তাশদীদযুক্ত হরফে যুক্ত হয়ে পড়ুন।',
      ar: 'صِل الحركة السابقة مباشرة بالحرف التالي دون نطق همزة الوصل.',
      ur: 'پچھلی حرکت کو براہِ راست اگلے حرف سے ملا دیں۔',
    },
    exampleAr: 'ٱهْدِنَا · وَلَا ٱلضَّآلِّينَ · أُولَـٰٓئِكَ',
  },
};

export const MAKHARIJ_AREAS: Record<
  MakhrajAreaId,
  { name: MultiText; color: string; desc: MultiText }
> = {
  jawf: {
    name: {
      en: '1. Al-Jawf (Oral & Throat Cavity)',
      bn: '১. আল-জাউফ (মুখ ও গলার খালি জায়গা)',
      ar: '١. الجوف (خلاء الحلق والفم)',
      ur: '۱. الجوف (منہ اور حلق کا خلا)',
    },
    color: '#EA580C',
    desc: {
      en: 'Open space inside the mouth and throat where the three Madd letters flow.',
      bn: 'গলা ও মুখের ভেতরের খালি অংশ যেখান থেকে মদ্দের তিনটি হরফ (ا و ي) টেনে পড়া হয়।',
      ar: 'الفراغ الممتد من الحلق إلى الفم وتخرج منه حروف المد الثلاثة.',
      ur: 'حلق اور منہ کے اندر کا خالی حصہ جہاں سے مدہ کے تین حروف نکلتے ہیں۔',
    },
  },
  halq: {
    name: {
      en: '2. Al-Halq (The Throat)',
      bn: '২. আল-হালক (কণ্ঠনালী — ৬ হরফ)',
      ar: '٢. الحلق (٦ حروف)',
      ur: '۲. الحلق (گلا — ۶ حروف)',
    },
    color: '#0D9488',
    desc: {
      en: 'Three levels of the throat (bottom, middle, top) producing ء ه ع ح غ خ.',
      bn: 'কণ্ঠনালীর শুরু, মাঝখান ও শেষ থেকে যথাক্রমে ء ه, ع ح এবং غ خ উচ্চারিত হয়।',
      ar: 'أقصى الحلق (ء ه)، وسطه (ع ح)، وأدناه (غ خ).',
      ur: 'حلق کے تین حصوں (نچلا، درمیانی، اوپری) سے ء ه ع ح غ خ ادا ہوتے ہیں۔',
    },
  },
  lisan: {
    name: {
      en: '3. Al-Lisan (The Tongue)',
      bn: '৩. আল-লিসান (জিহ্বা — ১০ মাখরাজ, ১৮ হরফ)',
      ar: '٣. اللسان (١٠ مخارج لـ ١٨ حرفاً)',
      ur: '۳. اللسان (زبان — ۱۰ مخارج، ۱۸ حروف)',
    },
    color: '#2563EB',
    desc: {
      en: 'Root, middle, edges, and tip of the tongue touching the palate, gums, or teeth.',
      bn: 'জিহ্বার গোড়া, মাঝখান, কিনারা ও আগা তালু-মাড়ি-দাঁতের সাথে লেগে ১৮টি হরফ উচ্চারিত হয়।',
      ar: 'يشمل أقصى اللسان ووسطه وحافتيه وطرفه مع الحنك واللثة والأسنان.',
      ur: 'زبان کی جڑ، درمیان، کنارے اور نوک کے ذریعے ۱۸ حروف ادا ہوتے ہیں۔',
    },
  },
  shafatan: {
    name: {
      en: '4. Ash-Shafatan (The Lips)',
      bn: '৪. আশ-শাফাতান (দুই ঠোঁট — ৪ হরফ)',
      ar: '٤. الشفتان (ف، ب، م، و)',
      ur: '۴. الشفتان (ہونٹ — ۴ حروف)',
    },
    color: '#7C3AED',
    desc: {
      en: 'Lower lip + upper teeth (ف) and both lips together (ب م و).',
      bn: 'নিচের ঠোঁটের পেট ও উপরের দাঁতের আগা থেকে ف এবং দুই ঠোঁট থেকে ب م و উচ্চারিত হয়।',
      ar: 'بطن الشفة السفلى مع أطراف الثنايا العليا (ف) والشفتان معاً (ب م و).',
      ur: 'نچلے ہونٹ کے اندرونی حصے سے ف اور دونوں ہونٹوں سے ب م و ادا ہوتے ہیں۔',
    },
  },
  khayshum: {
    name: {
      en: '5. Al-Khayshum (Nasal Passage)',
      bn: '৫. আল-খাইশূম (নাকের বাঁশি — গুন্নাহ)',
      ar: '٥. الخيشوم (مخرج الغنّة)',
      ur: '۵. الخیشوم (ناک کا بانسہ — غنہ)',
    },
    color: '#16A34A',
    desc: {
      en: 'Upper nasal cavity producing the resonant Ghunnah sound accompanying ن and م.',
      bn: 'নাকের ভেতরের উপরের অংশ যেখান থেকে নূন ও মীমের গুন্নাহর সুর বের হয়।',
      ar: 'أعلى الأنف ويخرج منه صوت الغنة المصاحب للنون والميم.',
      ur: 'ناک کا اندرونی اوپری حصہ جہاں سے نون اور میم کے غنہ کی آواز نکلتی ہے۔',
    },
  },
};

export const MAKHARIJ_17: MakhrajPoint[] = [
  {
    id: 1,
    area: 'jawf',
    letters: ['ا', 'و', 'ي'],
    name: {
      en: 'Makhraj 1 · Al-Jawf (Oral & Throat Cavity)',
      bn: 'মাখরাজ ১ · জাউফ (মুখের খালি জায়গা)',
      ar: '١. الجوف (حروف المدّ الثلاثة)',
      ur: 'مخرج ۱ · الجوف (منہ اور حلق کا خلا)',
    },
    detail: {
      en: 'Empty cavity of throat and mouth for Madd letters: Alif after Fatha, Waw Sakinah after Dammah, Ya Sakinah after Kasrah.',
      bn: 'যবরের পর খালি আলিফ, পেশের পর জযমওয়ালা ওয়াও, যেরের পর জযমওয়ালা ইয়া টেনে পড়া হয়।',
      ar: 'الألف الساكنة المفتوح ما قبلها، والواو الساكنة المضموم ما قبلها، والياء الساكنة المكسور ما قبلها.',
      ur: 'زبر کے بعد الف، پیش کے بعد واو ساکن اور زیر کے بعد یا ساکن (حروفِ مدہ) منہ کے خلا سے نکلتے ہیں۔',
    },
  },
  {
    id: 2,
    area: 'halq',
    letters: ['ء', 'ه'],
    name: {
      en: 'Makhraj 2 · Deepest Throat (Bottom)',
      bn: 'মাখরাজ ২ · কণ্ঠনালীর শুরু (সবচেয়ে নিচের অংশ)',
      ar: '٢. أقصى الحلق (ء، هـ)',
      ur: 'مخرج ۲ · اقصیٰ الحلق (گلے کا سب سے نچلا حصہ)',
    },
    detail: {
      en: 'Deepest part of the throat closest to the chest (vocal cords).',
      bn: 'বুকের নিকটবর্তী কণ্ঠনালীর সবচেয়ে ভেতরের অংশ থেকে হামযা (ء) ও হা (ه) উচ্চারিত হয়।',
      ar: 'أبعد منطقة في الحلق مما يلي الصدر وتخرج منه الهمزة والهاء.',
      ur: 'سینے کے قریب حلق کے سب سے نچلے حصے سے ہمزہ (ء) اور ہا (ه) ادا ہوتے ہیں۔',
    },
  },
  {
    id: 3,
    area: 'halq',
    letters: ['ع', 'ح'],
    name: {
      en: 'Makhraj 3 · Middle Throat',
      bn: 'মাখরাজ ৩ · কণ্ঠনালীর মাঝখান',
      ar: '٣. وسط الحلق (ع، ح)',
      ur: 'مخرج ۳ · وسطِ حلق (گلے کا درمیانی حصہ)',
    },
    detail: {
      en: 'Middle part of the throat gently constricting the epiglottis cleanly without harsh scraping.',
      bn: 'কণ্ঠনালীর মাঝখান সামান্য চেপে সুস্পষ্ট ও মোলায়েমভাবে আইন (ع) ও হা (ح) উচ্চারিত হয়।',
      ar: 'منطقة وسط الحلق (لسان المزمار) وتخرج منه العين والحاء بصفاء.',
      ur: 'حلق کے درمیانی حصے سے عین (ع) اور حاء (ح) صاف ادا ہوتے ہیں۔',
    },
  },
  {
    id: 4,
    area: 'halq',
    letters: ['غ', 'خ'],
    name: {
      en: 'Makhraj 4 · Upper Throat',
      bn: 'মাখরাজ ৪ · কণ্ঠনালীর উপরের অংশ (মুখের কাছের)',
      ar: '٤. أدنى الحلق (غ، خ)',
      ur: 'مخرج ۴ · ادنیٰ الحلق (گلے کا اوپری حصہ)',
    },
    detail: {
      en: 'Top of the throat nearest to the root of the tongue/uvula.',
      bn: 'মুখের নিকটবর্তী কণ্ঠনালীর শেষ/উপরের অংশ থেকে গাইন (غ) ও খা (خ) মোটা করে উচ্চারিত হয়।',
      ar: 'أقرب منطقة من الحلق مما يلي الفم وتخرج منه الغين والخاء.',
      ur: 'منہ کے قریب حلق کے اوپری حصے سے غین (غ) اور خا (خ) ادا ہوتے ہیں۔',
    },
  },
  {
    id: 5,
    area: 'lisan',
    letters: ['ق'],
    name: {
      en: 'Makhraj 5 · Back of Tongue + Soft Palate',
      bn: 'মাখরাজ ৫ · জিহ্বার গোড়া ও নরম তালু (ق)',
      ar: '٥. أقصى اللسان مع الحنك اللحمي (ق)',
      ur: 'مخرج ۵ · زبان کی جڑ اور نرم تالو (ق)',
    },
    detail: {
      en: 'Deepest part of the tongue touching the soft fleshy palate (uvula area) for deep Qaf (ق).',
      bn: 'জিহ্বার শেষ/গোড়া উপরের নরম তালুর সাথে লাগিয়ে মোটা ক্বফ (ق) উচ্চারিত হয়।',
      ar: 'أقصى اللسان مع ما يحاذيه من الحنك اللحمي وتخرج منه القاف.',
      ur: 'زبان کی جڑ جب اوپر کے نرم تالو سے لگے تو قاف (ق) ادا ہوتا ہے۔',
    },
  },
  {
    id: 6,
    area: 'lisan',
    letters: ['ك'],
    name: {
      en: 'Makhraj 6 · Back Tongue Slightly Forward + Hard/Soft Palate',
      bn: 'মাখরাজ ৬ · জিহ্বার গোড়া থেকে একটু সামনে ও তালু (ك)',
      ar: '٦. أقصى اللسان أسفل مخرج القاف (ك)',
      ur: 'مخرج ۶ · قاف سے ذرا آگے زبان کی جڑ اور سخت تالو (ك)',
    },
    detail: {
      en: 'Back of the tongue just below Qaf where soft and hard palate meet, with crisp Hams release for Kaf (ك).',
      bn: 'ক্বফ-এর মাখরাজ থেকে একটু সামনে শক্ত ও নরম তালুর সংযোগস্থলে লাগিয়ে হালকা বাতাসসহ কাফ (ك) উচ্চারিত হয়।',
      ar: 'أقصى اللسان أمام مخرج القاف مع التقاء الحنكين اللحمي والعظمي للكاف.',
      ur: 'قاف کے مخرج سے ذرا آگے زبان اور تالو کے ملنے سے کاف (ك) ادا ہوتا ہے۔',
    },
  },
  {
    id: 7,
    area: 'lisan',
    letters: ['ج', 'ش', 'ي'],
    name: {
      en: 'Makhraj 7 · Middle of Tongue + Hard Palate',
      bn: 'মাখরাজ ৭ · জিহ্বার মাঝখান ও উপরের তালু (ج ش ي)',
      ar: '٧. وسط اللسان مع الحنك الأعلى (ج، ش، ي)',
      ur: 'مخرج ۷ · زبان کا درمیان اور اوپر کا تالو (ج ش ي)',
    },
    detail: {
      en: 'Middle of the tongue meeting the upper hard roof of the mouth for Jeem, Sheen, and non-Madd Ya.',
      bn: 'জিহ্বার মধ্যভাগ সরাসরি উপরের তালুর সাথে লাগিয়ে জীম (ج), শীন (ش) এবং হরকত/লীনযুক্ত ইয়া (ي) পড়া হয়।',
      ar: 'وسط اللسان مع ما يحاذيه من الحنك الأعلى للجيم والشين والياء غير المدية.',
      ur: 'زبان کا درمیانی حصہ جب اوپر کے تالو سے لگے تو ج، ش اور یا (غیر مدہ) ادا ہوتے ہیں۔',
    },
  },
  {
    id: 8,
    area: 'lisan',
    letters: ['ض'],
    name: {
      en: 'Makhraj 8 · Edge of Tongue + Upper Molars',
      bn: 'মাখরাজ ৮ · জিহ্বার কিনারা ও মাড়ির দাঁত (ض)',
      ar: '٨. إحدى حافتي اللسان مع الأضراس العليا (ض)',
      ur: 'مخرج ۸ · زبان کا کنارہ اور اوپر کی داڑھیں (ض)',
    },
    detail: {
      en: 'Left, right, or both side edges of the tongue pressing against the upper molar teeth for unique Dhad (ض).',
      bn: 'জিহ্বার ডান, বাম বা উভয় কিনারা উপরের মাড়ির দাঁতের গোড়ায় লাগিয়ে মোটা ও প্রলম্বিত দ্বদ (ض) উচ্চারণ করা হয়।',
      ar: 'إحدى حافتي اللسان (أو كلتاهما) مع ما يليها من الأضراس العليا للضاد.',
      ur: 'زبان کے دائیں یا بائیں (یا دونوں) کنارے اوپر کی داڑھوں سے لگانے سے ضاد (ض) ادا ہوتا ہے۔',
    },
  },
  {
    id: 9,
    area: 'lisan',
    letters: ['ل'],
    name: {
      en: 'Makhraj 9 · Front Side Edges of Tongue + Upper Gums',
      bn: 'মাখরাজ ৯ · জিহ্বার সামনের কিনারা ও উপরের মাড়ি (ل)',
      ar: '٩. أدنى حافتي اللسان إلى منتهاها (ل)',
      ur: 'مخرج ۹ · زبان کے اگلے کنارے اور اوپر کے مسوڑھے (ل)',
    },
    detail: {
      en: 'From the side edges forward to the tip of the tongue touching the gums of upper front teeth for Lam (ل).',
      bn: 'জিহ্বার আগার কিনারা উপরের দাঁতের মাড়িতে লাগিয়ে লাম (ل) উচ্চারণ করা হয়।',
      ar: 'أدنى حافة اللسان إلى منتهى طرفه مع لثة الأسنان العليا للام.',
      ur: 'زبان کا اگلا کنارہ اوپر کے دانتوں کے مسوڑھوں سے لگانے سے لام (ل) ادا ہوتا ہے۔',
    },
  },
  {
    id: 10,
    area: 'lisan',
    letters: ['ن'],
    name: {
      en: 'Makhraj 10 · Tip of Tongue + Upper Incisor Gums',
      bn: 'মাখরাজ ১০ · জিহ্বার আগা ও সামনের দাঁতের মাড়ি (ن)',
      ar: '١٠. طرف اللسان مع لثة الثنايا العليا (ن)',
      ur: 'مخرج ۱۰ · زبان کی نوک اور اوپر کے مسوڑھے (ن)',
    },
    detail: {
      en: 'Tip of tongue touching the gum ridge slightly below Lam, accompanied by nasal airflow through Khayshum.',
      bn: 'লাম-এর মাখরাজের সামান্য নিচে জিহ্বার আগা লাগিয়ে সাথে খাইশূমের সহায়তায় নূন (ن) উচ্চারিত হয়।',
      ar: 'طرف اللسان مع ما يحاذيه من اللثة تحت مخرج اللام للنون، ويصاحبها الخيشوم.',
      ur: 'لام کے مخرج سے ذرا نیچے زبان کی نوک مسوڑھوں سے لگانے اور ناک کے تعاون سے نون (ن) ادا ہوتا ہے۔',
    },
  },
  {
    id: 11,
    area: 'lisan',
    letters: ['ر'],
    name: {
      en: 'Makhraj 11 · Tip & Top of Tongue Tip + Upper Gums',
      bn: 'মাখরাজ ১১ · জিহ্বার আগার পিঠ ও উপরের তালুর মাড়ি (ر)',
      ar: '١١. طرف اللسان مع ظهره ولثة الثنايا (ر)',
      ur: 'مخرج ۱۱ · زبان کی نوک کی پشت اور اوپر کے مسوڑھے (ر)',
    },
    detail: {
      en: 'Tip inclining slightly inward toward its dorsal surface against the upper gum ridge for smooth single-tap Raa (ر).',
      bn: 'জিহ্বার আগার উল্টো দিক (পিঠ) উপরের মাড়ির সাথে মিলিয়ে র (ر) উচ্চারণ করুন—একাধিক কম্পন (তাকরীর) নয়।',
      ar: 'طرف اللسان مائلاً قليلاً إلى ظهره مع لثة الثنايا العليا للراء.',
      ur: 'زبان کی نوک کا پچھلا حصہ اوپر کے مسوڑھوں سے لگانے سے را (ر) ادا ہوتا ہے۔',
    },
  },
  {
    id: 12,
    area: 'lisan',
    letters: ['ط', 'د', 'ت'],
    name: {
      en: 'Makhraj 12 · Tip of Tongue + Roots of Upper Central Incisors',
      bn: 'মাখরাজ ১২ · জিহ্বার আগা ও সামনের উপরের দুই দাঁতের গোড়া (ط د ت)',
      ar: '١٢. طرف اللسان وأصول الثنايا العليا (ط، د، ت)',
      ur: 'مخرج ۱۲ · زبان کی نوک اور اوپر کے دو دانتوں کی جڑ (ط د ت)',
    },
    detail: {
      en: 'Flat tip of tongue pressing the root/gum-line of upper front two incisors: heavy ط, voiced د, whispered ت.',
      bn: 'জিহ্বার আগা সামনের উপরের দুই দাঁতের গোড়ায় লাগিয়ে ত্ব (ط - মোটা), দাল (د - কলকলা) ও তা (ت - বাতাসসহ) পড়া হয়।',
      ar: 'طرف اللسان العريض مع أصول الثنايا العليا للطاء والدال والتاء.',
      ur: 'زبان کی نوک اوپر کے سامنے کے دو دانتوں کی جڑ سے لگانے سے ط، د اور ت ادا ہوتے ہیں۔',
    },
  },
  {
    id: 13,
    area: 'lisan',
    letters: ['ص', 'ز', 'س'],
    name: {
      en: 'Makhraj 13 · Tip of Tongue + Lower Incisors (Whistling/Safeer)',
      bn: 'মাখরাজ ১৩ · জিহ্বার আগা ও নিচের দাঁতের ভেতরের দিক (ص ز س)',
      ar: '١٣. طرف اللسان وفويق الثنايا السفلى (ص، ز، س)',
      ur: 'مخرج ۱۳ · زبان کی نوک اور نچلے دانتوں کا اندرونی کنارہ (ص ز س)',
    },
    detail: {
      en: 'Tip of tongue near lower incisors while air passes over it creating a sharp whistle (Safeer) for ص ز س.',
      bn: 'জিহ্বার আগা সামনের নিচের দুই দাঁতের ভেতরের পেটে রেখে শীষ ধ্বনির সাথে স্বদ (ص), যা (ز) ও সীন (س) উচ্চারিত হয়।',
      ar: 'منتهى طرف اللسان مع صفحة الثنايا السفلى لخروج حروف الصفير (ص، ز، س).',
      ur: 'زبان کی نوک نچلے سامنے کے دانتوں کے قریب لانے سے سیٹی کی آواز کے ساتھ ص، ز، س ادا ہوتے ہیں۔',
    },
  },
  {
    id: 14,
    area: 'lisan',
    letters: ['ظ', 'ذ', 'ث'],
    name: {
      en: 'Makhraj 14 · Tip of Tongue + Edges of Upper Central Incisors',
      bn: 'মাখরাজ ১৪ · জিহ্বার আগা ও উপরের দুই দাঁতের আগা (ظ ذ ث)',
      ar: '١٤. طرف اللسان مع أطراف الثنايا العليا (ظ، ذ، ث)',
      ur: 'مخرج ۱۴ · زبان کی نوک اور اوپر کے دو دانتوں کے کنارے (ظ ذ ث)',
    },
    detail: {
      en: 'Tip of tongue gently touching the biting edges of the upper central incisors (never buzzing like z).',
      bn: 'জিহ্বার আগা সামনের উপরের দুই দাঁতের আগার সাথে নরমভাবে লাগিয়ে যোয়া (ظ), যাল (ذ) ও সা (ث) পড়া হয়।',
      ar: 'طرف اللسان مع أطراف الثنايا العليا للظاء والذال والثاء (الحروف اللثوية).',
      ur: 'زبان کی نوک کو اوپر کے سامنے کے دو دانتوں کے کناروں سے لگانے سے ظ، ذ، ث ادا ہوتے ہیں۔',
    },
  },
  {
    id: 15,
    area: 'shafatan',
    letters: ['ف'],
    name: {
      en: 'Makhraj 15 · Inner Lower Lip + Edges of Upper Incisors',
      bn: 'মাখরাজ ১৫ · নিচের ঠোঁটের পেট ও উপরের দাঁতের আগা (ف)',
      ar: '١٥. بطن الشفة السفلى مع أطراف الثنايا العليا (ف)',
      ur: 'مخرج ۱۵ · نچلے ہونٹ کا اندرونی حصہ اور اوپر کے دانت (ف)',
    },
    detail: {
      en: 'Upper front central incisors touching the wet inner ridge of the lower lip with gentle breath for Faa (ف).',
      bn: 'উপরের সামনের দুই দাঁতের আগা নিচের ঠোঁটের ভেতরের ভেজা অংশে লাগিয়ে বাতাস ছেড়ে ফা (ف) পড়া হয়।',
      ar: 'بطن الشفة السفلى مع أطراف الثنايا العليا للفاء.',
      ur: 'اوپر کے سامنے کے دو دانت جب نچلے ہونٹ کے تر حصے پر لگیں تو ف ادا ہوتا ہے۔',
    },
  },
  {
    id: 16,
    area: 'shafatan',
    letters: ['ب', 'م', 'و'],
    name: {
      en: 'Makhraj 16 · The Two Lips Together',
      bn: 'মাখরাজ ১৬ · দুই ঠোঁট (ب م و)',
      ar: '١٦. الشفتان معاً (ب، م، و)',
      ur: 'مخرج ۱۶ · دونوں ہونٹ (ب م و)',
    },
    detail: {
      en: 'Lips close tightly on wet inner side for ب, gently on dry side for م, and round forward leaving a small opening for non-Madd و.',
      bn: 'দুই ঠোঁটের ভেজা অংশ থেকে বা (ب), শুকনো অংশ থেকে মীম (م) এবং দুই ঠোঁট গোল করে ওয়াও (و) উচ্চারিত হয়।',
      ar: 'انطباق الشفتين للباء والميم، واستدارة الشفتين مع فرجة للواو غير المدية.',
      ur: 'دونوں ہونٹوں کے ملنے سے ب اور م، اور ہونٹ گول کرنے سے واو (غیر مدہ) ادا ہوتا ہے۔',
    },
  },
  {
    id: 17,
    area: 'khayshum',
    letters: ['ن', 'م'],
    name: {
      en: 'Makhraj 17 · Al-Khayshum (Nasal Cavity)',
      bn: 'মাখরাজ ১৭ · নাকের বাঁশি (খাইশূম — গুন্নাহ)',
      ar: '١٧. الخيشوم (صوت الغنة)',
      ur: 'مخرج ۱۷ · خیشوم (ناک کا بانسہ — غنہ)',
    },
    detail: {
      en: 'Nasal passage producing the characteristic Ghunnah resonance inherent to Noon and Meem.',
      bn: 'নাকের ছিদ্রের ভেতরের উপরের অংশ যেখান থেকে মীম ও নূনের গুন্নাহর সুর ধ্বনিত হয়।',
      ar: 'أقصى الأنف المنجذب إلى الفم وتخرج منه الغنّة في النون والميم.',
      ur: 'ناک کا اندرونی بانسہ جہاں سے نون اور میم کا غنہ ادا ہوتا ہے۔',
    },
  },
];

export const SIFAT_LIST: Record<SifatId, SifatMeta> = {
  hams: {
    id: 'hams',
    category: 'opposite',
    oppositeOf: 'jahr',
    lettersLabel: 'ف ح ث هـ ش خ ص س ك ت',
    name: {
      en: 'Hams (Flow of Breath)',
      bn: 'হামস (বাতাস প্রবাহিত হওয়া)',
      ar: 'الهمس (جريان النفس)',
      ur: 'ہمس (سانس کا جاری رہنا)',
    },
    detail: {
      en: 'Whispered release where breath flows noticeably alongside the sound due to relaxed vocal cords.',
      bn: 'উচ্চারণের সময় মুখ থেকে স্পষ্টভাবে শ্বাস/বাতাস বের হয় (ফাহাছ্ছাহু শাখছুন ছাকাত — ১০ হরফ)।',
      ar: 'ضعف الاعتماد على المخرج مما يؤدي إلى جريان النفس مع النطق بالحرف.',
      ur: 'مخرج پر کمزور اعتماد کی وجہ سے حرف کی ادائیگی کے ساتھ سانس جاری رہتا ہے۔',
    },
  },
  jahr: {
    id: 'jahr',
    category: 'opposite',
    oppositeOf: 'hams',
    lettersLabel: 'باقي ١٩ حرفاً',
    name: {
      en: 'Jahr (Withheld Breath / Voiced)',
      bn: 'জাহর (বাতাস বন্ধ থাকা)',
      ar: 'الجهر (انحباس النفس)',
      ur: 'جہر (سانس کا رک جانا)',
    },
    detail: {
      en: 'Vocal cords vibrate cleanly and prevent excess breath from escaping.',
      bn: 'উচ্চারণের সময় বাতাস আটকে থাকে এবং পরিষ্কার আওয়াজ হয় (বাকি ১৯ হরফ)।',
      ar: 'قوة الاعتماد على المخرج فينحبس النفس عند النطق بالحرف.',
      ur: 'مخرج پر مضبوط گرفت کی وجہ سے سانس بند رہتا ہے اور آواز صاف نکلتی ہے۔',
    },
  },
  shiddah: {
    id: 'shiddah',
    category: 'opposite',
    oppositeOf: 'rakhawah',
    lettersLabel: 'أ ج د ق ط ب ك ت',
    name: {
      en: 'Shiddah (Complete Sound Stop)',
      bn: 'শিদ্দাত (আওয়াজ সম্পূর্ণ আটকে যাওয়া)',
      ar: 'الشدة (انحباس الصوت)',
      ur: 'شدت (آواز کا مکمل بند ہو جانا)',
    },
    detail: {
      en: 'Sound stops firmly at the articulation point until released (أجد قط بكت).',
      bn: 'মাখরাজে আওয়াজ সম্পূর্ণ বন্ধ হয়ে শক্তভাবে আটকানো হয় (আজিদু ক্বাত্বিন বাকাত — ৮ হরফ)।',
      ar: 'انحباس جريان الصوت عند النطق بالحرف لكمال قوة الاعتماد على المخرج.',
      ur: 'مخرج کے مکمل بند ہونے کی وجہ سے آواز فوراً رک جاتی ہے۔',
    },
  },
  tawassut: {
    id: 'tawassut',
    category: 'opposite',
    lettersLabel: 'ل ن ع م ر',
    name: {
      en: 'Tawassut (Moderate Flow)',
      bn: 'তাওয়াসসুত (মাঝারি আওয়াজ প্রবাহ)',
      ar: 'التوسط / البينية (لن عمر)',
      ur: 'توسط / بینیت (درمیانی کیفیت)',
    },
    detail: {
      en: 'Balanced between Shiddah and Rakhawah: sound flows briefly then resolves naturally (لن عمر).',
      bn: 'আওয়াজ একেবারে বন্ধও হয় না আবার বেশি লম্বাও চলে না (লিন উমার — ৫ হরফ)।',
      ar: 'اعتدال الصوت عند النطق بالحرف فلا ينحبس كمال الشدة ولا يجري كمال الرخاوة.',
      ur: 'آواز نہ پوری طرح بند ہوتی ہے اور نہ بالکل جاری رہتی ہے بلکہ درمیانی رہتی ہے۔',
    },
  },
  rakhawah: {
    id: 'rakhawah',
    category: 'opposite',
    oppositeOf: 'shiddah',
    lettersLabel: 'باقي ١٦ حرفاً',
    name: {
      en: 'Rakhawah (Soft Sound Flow)',
      bn: 'রাখাওয়াত (আওয়াজ নরম হয়ে প্রবাহিত)',
      ar: 'الرخاوة (جريان الصوت)',
      ur: 'رخاوت (آواز کا نرمی سے جاری رہنا)',
    },
    detail: {
      en: 'Sound flows smoothly and gently while the letter is held, especially with Sukun.',
      bn: 'সাকিন অবস্থায় মাখরাজ থেকে আওয়াজ নরম ও অবাধে বেরিয়ে যায় (বাকি ১৬ হরফ)।',
      ar: 'جريان الصوت بليونة عند النطق بالحرف الساكن لضعف الاعتماد على المخرج.',
      ur: 'مخرج میں نرمی کی وجہ سے حرف پر آواز آسانی سے جاری رہتی ہے۔',
    },
  },
  istila: {
    id: 'istila',
    category: 'opposite',
    oppositeOf: 'istifal',
    lettersLabel: 'خ ص ض غ ط ق ظ',
    name: {
      en: 'Isti’la (Elevated / Heavy)',
      bn: 'ইস্তি‘লা (জিহ্বার গোড়া উঁচু / মোটা)',
      ar: 'الاستعلاء (ارتفاع أقصى اللسان — تفخيم)',
      ur: 'استعلاء (زبان کی جڑ اٹھانا / موٹا)',
    },
    detail: {
      en: 'Back of the tongue rises toward the upper palate, making these 7 letters permanently Heavy (Tafkheem).',
      bn: 'জিহ্বার গোড়া উপরের তালুর দিকে উঠে ৭টি হরফ সর্বদা মোটা ও গম্ভীরভাবে পড়া হয় (খুছ্ছা দ্বগত্বিন ক্বিয)।',
      ar: 'ارتفاع أقصى اللسان إلى الحنك الأعلى فيُفخم الحرف دائماً.',
      ur: 'زبان کی جڑ اوپر تالو کی طرف اٹھنے سے یہ ۷ حروف ہمیشہ پُر (موٹے) پڑھے جاتے ہیں۔',
    },
  },
  istifal: {
    id: 'istifal',
    category: 'opposite',
    oppositeOf: 'istila',
    lettersLabel: 'باقي ٢٢ حرفاً',
    name: {
      en: 'Istifal (Low / Light Letter)',
      bn: 'ইস্তিফাল (জিহ্বা নিচে / পাতলা উচ্চারণ)',
      ar: 'الاستفال (انخفاض اللسان — ترقيق)',
      ur: 'استفال (زبان نیچے رکھنا / باریک)',
    },
    detail: {
      en: 'Back of tongue stays relaxed and low, producing a light, clean sound (Tarqeeq).',
      bn: 'জিহ্বার গোড়া নিচে স্বাভাবিক থাকে ফলে হরফ পাতলা/চিকনভাবে উচ্চারিত হয়।',
      ar: 'انخفاض أقصى اللسان عن الحنك الأعلى فيُرقق الحرف.',
      ur: 'زبان کی جڑ نیچے رہتی ہے جس کی وجہ سے آواز باریک رہتی ہے۔',
    },
  },
  itbaq: {
    id: 'itbaq',
    category: 'opposite',
    oppositeOf: 'infitah',
    lettersLabel: 'ص ض ط ظ',
    name: {
      en: 'Itbaq (Enclosed Heavy Sound)',
      bn: 'ইত্ববাক (জিহ্বা তালুর সাথে চেপে ধরা)',
      ar: 'الإطباق (انطباق اللسان على الحنك)',
      ur: 'اطباق (زبان کا تالو سے چپکنا)',
    },
    detail: {
      en: 'Largest portion of the tongue adheres/encloses toward the palate, creating the heaviest 4 letters (ص ض ط ظ).',
      bn: 'জিহ্বার মাঝখানও উপরের তালুর সাথে লেগে আওয়াজকে সবচেয়ে ভারী ও আবদ্ধ করে তোলে (৪ হরফ)।',
      ar: 'انطباق طائفة من اللسان على الحنك الأعلى وانحصار الصوت بينهما (ص ض ط ظ).',
      ur: 'زبان کا بڑا حصہ اوپر تالو سے لگ کر آواز کو زیادہ بھاری کر دیتا ہے۔',
    },
  },
  infitah: {
    id: 'infitah',
    category: 'opposite',
    oppositeOf: 'itbaq',
    lettersLabel: 'باقي ٢٥ حرفاً',
    name: {
      en: 'Infitah (Open / Unenclosed)',
      bn: 'ইনফিতাহ (জিহ্বা ও তালু খোলা থাকা)',
      ar: 'الانفتاح (افتراق اللسان عن الحنك)',
      ur: 'انفتاح (زبان اور تالو کے درمیان کشادگی)',
    },
    detail: {
      en: 'Space remains open between the tongue and the palate so sound spreads freely outward.',
      bn: 'জিহ্বা ও তালুর মাঝখানে ফাঁকা থাকে, আওয়াজ আবদ্ধ হয় না।',
      ar: 'تجافي اللسان عن الحنك الأعلى فلا ينحصر الصوت بينهما.',
      ur: 'زبان اور تالو کے درمیان کھلا خلا رہتا ہے اور آواز باہر نکلتی ہے۔',
    },
  },
  idhlaq: {
    id: 'idhlaq',
    category: 'opposite',
    oppositeOf: 'ismat',
    lettersLabel: 'ف ر م ن ل ب',
    name: {
      en: 'Idhlaq (Swift / Fluent Lip-Tip)',
      bn: 'ইযলাক (দ্রুত ও সহজে উচ্চারণ)',
      ar: 'الإذلاق (فرّ من لبّ)',
      ur: 'اذلاق (زبان کی نوک یا ہونٹوں سے آسانی)',
    },
    detail: {
      en: 'Articulated fluently from the very tip of the tongue or lips (فر من لب).',
      bn: 'জিহ্বার একদম আগা বা ঠোঁট থেকে অত্যন্ত দ্রুত ও স্বাচ্ছন্দ্যে উচ্চারিত হওয়া।',
      ar: 'خفة الحرف وسرعة النطق به لخروجه من ذلق اللسان أو الشفتين.',
      ur: 'زبان کی نوک یا ہونٹوں سے نکلنے کی وجہ سے تیزی اور روانی سے ادا ہوتے ہیں۔',
    },
  },
  ismat: {
    id: 'ismat',
    category: 'opposite',
    oppositeOf: 'idhlaq',
    lettersLabel: 'باقي ٢٣ حرفاً',
    name: {
      en: 'Ismat (Firm Articulation)',
      bn: 'ইসমাত (স্থির ও ধীর মাখরাজ)',
      ar: 'الإصمات',
      ur: 'اصمات (ٹھہراؤ اور مضبوطی)',
    },
    detail: {
      en: 'Articulated firmly away from the tip of tongue or outer lips with controlled precision.',
      bn: 'জিহ্বার ভেতরের অংশ থেকে গম্ভীর ও নিয়ন্ত্রিতভাবে উচ্চারণ।',
      ar: 'ثقل الحرف لخروجه بعيداً عن طرف اللسان والشفة، وضبطه في الكلمات الرباعية.',
      ur: 'زبان کی نوک اور ہونٹوں سے ہٹ کر مضبوطی سے ادا ہونے والے حروف۔',
    },
  },
  qalqalah: {
    id: 'qalqalah',
    category: 'special',
    lettersLabel: 'ق ط ب ج د',
    name: {
      en: 'Qalqalah (Echoing Bounce)',
      bn: 'কলকলা (ধাক্কা / প্রতিধ্বনি)',
      ar: 'القلقلة (قطب جد)',
      ur: 'قلقلہ (مخرج میں گونج/جھٹکا)',
    },
    detail: {
      en: 'Crisp bouncing release on قطب جد when Sakin or at Waqf so the letter remains audible.',
      bn: 'সাকিন অবস্থায় মাখরাজ থেকে স্পষ্ট ধাক্কা দিয়ে প্রতিধ্বনি তৈরি করা।',
      ar: 'اضطراب المخرج عند النطق بالحرف ساكناً حتى يُسمع له نبرة قوية.',
      ur: 'حالتِ سکون میں مخرج کے جھٹکے سے واضح گونج پیدا ہونا۔',
    },
  },
  safeer: {
    id: 'safeer',
    category: 'special',
    lettersLabel: 'ص ز س',
    name: {
      en: 'Safeer (Whistling Resonance)',
      bn: 'সাফীর (তীব্র শীষের ধ্বনি)',
      ar: 'الصفير (ص، ز، س)',
      ur: 'صفیر (سیٹی جیسی آواز)',
    },
    detail: {
      en: 'Clear, sharp whistling quality as air escapes through the narrow tip-incisor channel.',
      bn: 'জিহ্বার আগা ও দাঁতের সরু ফাঁক দিয়ে বের হওয়া ধারালো শীষের মতো সুর।',
      ar: 'حدّة في الصوت يشبه صوت الطائر يخرج من بين طرف اللسان والثنايا.',
      ur: 'زبان کی نوک اور دانتوں کے درمیان سے نکلنے والی تیز سیٹی جیسی آواز۔',
    },
  },
  leen: {
    id: 'leen',
    category: 'special',
    lettersLabel: 'و ي (ساكنتين بعد فتح)',
    name: {
      en: 'Leen (Softness)',
      bn: 'লীন (নরম ও সহজ উচ্চারণ)',
      ar: 'اللين (الواو والياء الساكنتان المفتوح ما قبلهما)',
      ur: 'لین (نرمی اور سہولت)',
    },
    detail: {
      en: 'Easy, effortless gliding pronunciation when Sakinah و or ي follows a Fatha (e.g. خَوْف · بَيْت).',
      bn: 'যবরের পর জযমওয়ালা و বা ي কোনো টান-ঝাঁকুনি ছাড়াই কোমলভাবে পড়া (যেমন خَوْف, قُرَيْش)।',
      ar: 'إخراج الحرف من مخرجه بسهولة وعدم كلفة على اللسان.',
      ur: 'زبر کے بعد واو یا یا ساکن کو بغیر کسی تکلف کے نرمی سے پڑھنا۔',
    },
  },
  inhiraf: {
    id: 'inhiraf',
    category: 'special',
    lettersLabel: 'ل ر',
    name: {
      en: 'Inhiraf (Deflection of Sound)',
      bn: 'ইনহিরাফ (মাখরাজ সামান্য বাঁকা হওয়া)',
      ar: 'الانحراف (ل، ر)',
      ur: 'انحراف (آواز کا مڑ جانا)',
    },
    detail: {
      en: 'Sound smoothly curves around the edges (ل) or toward the center tip (ر) after leaving its makhraj.',
      bn: 'আওয়াজ নিজ মাখরাজ থেকে বেরিয়ে সামান্য দিক পরিবর্তন করে (ل এর পাশে ও ر এর মাঝের দিকে)।',
      ar: 'ميل الصوت عن مساره بعد خروجه من مخرجه في اللام والراء.',
      ur: 'حرف نکلنے کے بعد آواز کا دوسرے مخرج کی طرف معمولی جھکاؤ۔',
    },
  },
  takrir: {
    id: 'takrir',
    category: 'special',
    lettersLabel: 'ر',
    name: {
      en: 'Takrir (Light Trill Guard)',
      bn: 'তাকরীর (কম্পন নিয়ন্ত্রণ)',
      ar: 'التكرير (ر)',
      ur: 'تکرار (لرزش پر قابو)',
    },
    detail: {
      en: 'The tongue tip lightly taps once for ر; do not over-trill it repeatedly like “rrrrr”.',
      bn: 'র উচ্চারণে জিহ্বার আগা মাত্র একবার আলতো করে কাঁপবে—একাধিকবার “ররর” করা যাবে না।',
      ar: 'ارتعاد طرف اللسان برفق مرة واحدة عند النطق بالراء دون مبالغة.',
      ur: 'را پڑھتے وقت زبان کی نوک میں صرف ایک ہلکی لرزش ہو، بار بار نہ لرزے۔',
    },
  },
  tafashshi: {
    id: 'tafashshi',
    category: 'special',
    lettersLabel: 'ش',
    name: {
      en: 'Tafashshi (Spreading Breath)',
      bn: 'তাফাশশী (মুখ ভরে বাতাস ছড়িয়ে যাওয়া)',
      ar: 'التفشي (ش)',
      ur: 'تفشی (منہ میں ہوا کا پھیلنا)',
    },
    detail: {
      en: 'Breath spreads widely inside the mouth until touching the upper incisors when pronouncing ش.',
      bn: 'শীন (ش) উচ্চারণের সময় মুখের ভেতর বাতাস চারদিকে ছড়িয়ে পড়ে।',
      ar: 'انتشار الهواء والريح في الفم عند النطق بالشين.',
      ur: 'ش ادا کرتے وقت پورے منہ میں سانس اور ہوا پھیل جاتی ہے۔',
    },
  },
  istitalah: {
    id: 'istitalah',
    category: 'special',
    lettersLabel: 'ض',
    name: {
      en: 'Istitalah (Elongation Across Tongue Edge)',
      bn: 'ইস্তিতলাহ (মাখরাজের প্রলম্বন — ض)',
      ar: 'الاستطالة (ض)',
      ur: 'استطالہ (آواز کا مخرج میں لمبا ہونا)',
    },
    detail: {
      en: 'Sound gently glides forward along the tongue edge from back molars toward Lam makhraj on ض.',
      bn: 'দ্বদ (ض) উচ্চারণের সময় জিহ্বার কিনারা দিয়ে আওয়াজ পিছন থেকে সামনের দিকে সামান্য প্রসারিত হয়।',
      ar: 'امتداد الصوت من أول حافة اللسان إلى آخرها عند النطق بالضاد.',
      ur: 'ضاد پڑھتے وقت زبان کے کنارے پر آواز پیچھے سے آگے کی طرف پھیلتی ہے۔',
    },
  },
  ghunnah: {
    id: 'ghunnah',
    category: 'special',
    lettersLabel: 'ن م',
    name: {
      en: 'Ghunnah (Inherent Nasal Tone)',
      bn: 'গুন্নাহ (স্বাভাবিক নাসিক্য ধ্বনি)',
      ar: 'الغنة اللازمة (ن، م)',
      ur: 'غنہ (قدرتی ناک کی گونج)',
    },
    detail: {
      en: 'Inherent nasal quality present in every Noon and Meem, strongest when Mushaddad or in Ikhfa/Idgham.',
      bn: 'প্রতিটি নূন ও মীমের সাথে জন্মগত নাকের সুর জড়িত, যা তাশদীদ ও ইখফায় সবচেয়ে প্রবল হয়।',
      ar: 'صوتٌ لذيذ مُرَكَّب في جسم النون والميم يخرج من الخيشوم.',
      ur: 'نون اور میم کے اندر قدرتی طور پر پائی جانے والی ناک کی گونج۔',
    },
  },
};

export const ARABIC_LETTERS: ArabicLetterMeta[] = [
  {
    letter: 'ا',
    name: { en: 'Alif (ألف)', bn: 'আলিফ (ا)', ar: 'ألف', ur: 'الف (ا)' },
    makhrajId: 1,
    sifatIds: ['jahr', 'rakhawah', 'istifal', 'infitah', 'ismat'],
    tip: {
      en: 'Open mouth vertically like “aa”. Pronounced heavy only when directly following a heavy letter.',
      bn: 'মুখ স্বাভাবিক খোলা রেখে টেনে পড়া হয়। মোটা হরফের পর এলে মোটা এবং পাতলা হরফের পর পাতলা হয়।',
      ar: 'تُتبع الألف ما قبلها تفخيماً وترقيقاً وتخرج من الجوف.',
      ur: 'الف اپنے سے پہلے والے حرف کے مطابق موٹا یا باریک پڑھا جاتا ہے۔',
    },
  },
  {
    letter: 'ء',
    name: { en: 'Hamzah (همزة)', bn: 'হামযা (ء)', ar: 'همزة', ur: 'ہمزہ (ء)' },
    makhrajId: 2,
    sifatIds: ['jahr', 'shiddah', 'istifal', 'infitah', 'ismat'],
    tip: {
      en: 'Clean glottal start from deepest throat; avoid over-harsh coughing click.',
      bn: 'কণ্ঠনালীর সবচেয়ে ভেতর থেকে স্পষ্ট ও ভদ্রভাবে উচ্চারণ করুন।',
      ar: 'تخرج من أقصى الحلق بلطف دون تكلّف أو قلقلة.',
      ur: 'حلق کے سب سے نچلے حصے سے صاف ادا کریں، جھٹکا نہ دیں۔',
    },
  },
  {
    letter: 'ب',
    name: { en: 'Baa (باء)', bn: 'বা (ب)', ar: 'باء', ur: 'باء (ب)' },
    makhrajId: 16,
    sifatIds: ['jahr', 'shiddah', 'istifal', 'infitah', 'idhlaq', 'qalqalah'],
    tip: {
      en: 'Press inner wet part of lips; echo with Qalqalah when Sakin.',
      bn: 'দুই ঠোঁটের ভেজা অংশ থেকে উচ্চারিত; সাকিন হলে স্পষ্ট কলকলা হবে।',
      ar: 'انطباق الشفتين من الداخل مع قلقلة واضحة إذا سكنت.',
      ur: 'دونوں ہونٹوں کے تر حصے سے ادا ہوتا ہے، جزم پر قلقلہ ہوگا۔',
    },
  },
  {
    letter: 'ت',
    name: { en: 'Taa (تاء)', bn: 'তা (ت)', ar: 'تاء', ur: 'تاء (ت)' },
    makhrajId: 12,
    sifatIds: ['hams', 'shiddah', 'istifal', 'infitah', 'ismat'],
    tip: {
      en: 'Light alveolar T with gentle puff of breath (Hams), not heavy English T.',
      bn: 'দাঁতের গোড়া থেকে হালকা বাতাসসহ নরমভাবে তা উচ্চারিত হবে—ইংরেজি ট-এর মতো নয়।',
      ar: 'تاء مرققة مع همس لطيف عند السكون.',
      ur: 'باریک ت جو جزم کی حالت میں ہلکے سانس (ہمس) کے ساتھ ادا ہو۔',
    },
  },
  {
    letter: 'ث',
    name: { en: 'Thaa (ثاء)', bn: 'সা (ث)', ar: 'ثاء', ur: 'ثاء (ث)' },
    makhrajId: 14,
    sifatIds: ['hams', 'rakhawah', 'istifal', 'infitah', 'ismat'],
    tip: {
      en: 'Like “th” in “think”; tongue tip touches upper central teeth edges with soft breath.',
      bn: 'জিহ্বার আগা উপরের দুই দাঁতের আগায় লাগিয়ে নরম ও শ্বাসপ্রবাহসহ সা (যেমন think)।',
      ar: 'حرف لثوي يخرج بوضع طرف اللسان تحت أطراف الثنايا العليا برفق.',
      ur: 'زبان کی نوک اوپر کے دو دانتوں کے کناروں پر رکھ کر نرمی سے ادا کریں۔',
    },
  },
  {
    letter: 'ج',
    name: { en: 'Jeem (جيم)', bn: 'জীম (ج)', ar: 'جيم', ur: 'جیم (ج)' },
    makhrajId: 7,
    sifatIds: ['jahr', 'shiddah', 'istifal', 'infitah', 'ismat', 'qalqalah'],
    tip: {
      en: 'Mid-tongue closes tightly on hard palate (no loose “zh”); bounces with Qalqalah on Sukun.',
      bn: 'জিহ্বার মাঝখান তালুতে পুরো লাগিয়ে স্পষ্ট জীম; সাকিনে কলকলা হবে।',
      ar: 'تُخرج من وسط اللسان محكمةً غير رخوة، وتُقلقل عند السكون.',
      ur: 'زبان کا درمیان تالو سے مضبوطی سے لگائیں؛ جزم پر قلقلہ کریں۔',
    },
  },
  {
    letter: 'ح',
    name: { en: 'Haa (حاء)', bn: 'হা (ح)', ar: 'حاء', ur: 'حاء (ح)' },
    makhrajId: 3,
    sifatIds: ['hams', 'rakhawah', 'istifal', 'infitah', 'ismat'],
    tip: {
      en: 'Crisp breathy middle-throat “h” like blowing warm air smoothly without throat rattle.',
      bn: 'কণ্ঠনালীর মাঝখান থেকে পরিষ্কার বাতাসসহ স্বচ্ছ হা (خ-এর মতো খসখসে নয়)।',
      ar: 'حاء مرققة تخرج من وسط الحلق بنَفَسٍ نقي صافٍ.',
      ur: 'درمیانی حلق سے صاف اور گرم سانس کی طرح ادا کریں۔',
    },
  },
  {
    letter: 'خ',
    name: { en: 'Khaa (خاء)', bn: 'খা (خ)', ar: 'خاء', ur: 'خاء (خ)' },
    makhrajId: 4,
    sifatIds: ['hams', 'rakhawah', 'istila', 'infitah', 'ismat'],
    heavy: true,
    tip: {
      en: 'Upper throat heavy letter with gentle breath; always keep back tongue lifted.',
      bn: 'উপরের কণ্ঠনালী থেকে মোটা খা; বেশি ঘর্ষণ না করে গম্ভীরভাবে পড়ুন।',
      ar: 'حرف مفخم مستعلٍ من أدنى الحلق مع جريان النفس.',
      ur: 'ادنیٰ حلق سے موٹا پڑھیں، زیادہ خرخراہٹ سے بچیں۔',
    },
  },
  {
    letter: 'د',
    name: { en: 'Dal (دال)', bn: 'দাল (د)', ar: 'دال', ur: 'دال (د)' },
    makhrajId: 12,
    sifatIds: ['jahr', 'shiddah', 'istifal', 'infitah', 'ismat', 'qalqalah'],
    tip: {
      en: 'Light tip-on-gum D; clearly bounces (Qalqalah) when carrying Sukun.',
      bn: 'উপরের দাঁতের গোড়া থেকে হালকা দাল; সাকিনে কলকলা হবে।',
      ar: 'دال مرققة من أصول الثنايا العليا وتُقلقل عند السكون.',
      ur: 'دانتوں کی جڑ سے باریک ادا ہو اور جزم کی صورت میں قلقلہ کریں۔',
    },
  },
  {
    letter: 'ذ',
    name: { en: 'Dhal (ذال)', bn: 'যাল (ذ)', ar: 'ذال', ur: 'ذال (ذ)' },
    makhrajId: 14,
    sifatIds: ['jahr', 'rakhawah', 'istifal', 'infitah', 'ismat'],
    tip: {
      en: 'Soft voiced “th” as in “this”; avoid whistling like ز.',
      bn: 'জিহ্বার আগা উপরের দাঁতের আগায় ছুঁয়ে কোমলভাবে যাল (য-এর মতো শীষ নয়)।',
      ar: 'حرف لثوي مرقق رخو (مثل ذي) يُنطق دون صفير.',
      ur: 'زبان کی نوک اوپر کے دانتوں کے کناروں پر رکھ کر نرمی سے ادا کریں، ز جیسی سیٹی نہ ہو۔',
    },
  },
  {
    letter: 'ر',
    name: { en: 'Raa (راء)', bn: 'র (ر)', ar: 'راء', ur: 'راء (ر)' },
    makhrajId: 11,
    sifatIds: ['jahr', 'tawassut', 'istifal', 'infitah', 'idhlaq', 'inhiraf', 'takrir'],
    tip: {
      en: 'Heavy with Fatha/Dammah, Light with Kasrah. Single clean tap—avoid rolling R.',
      bn: 'যবর/পেশে মোটা এবং যেরে পাতলা। জিহ্বার আগায় একাধিকবার না কাঁপিয়ে মসৃণভাবে পড়ুন।',
      ar: 'تُفخم بالفتح والضم وتُرقق بالكسر؛ وتُمنع المبالغة في التكرير.',
      ur: 'زبر اور پیش پر موٹی، زیر پر باریک پڑھی جاتی ہے؛ زیادہ تکرار سے بچیں۔',
    },
  },
  {
    letter: 'ز',
    name: { en: 'Zay (زاي)', bn: 'যা (ز)', ar: 'زاي', ur: 'زاء (ز)' },
    makhrajId: 13,
    sifatIds: ['jahr', 'rakhawah', 'istifal', 'infitah', 'ismat', 'safeer'],
    tip: {
      en: 'Voiced sharp buzzing/whistle (Safeer) like “z” in “zoo”.',
      bn: 'দাঁতের আগা বন্ধ রেখে স্পষ্ট গুনগুন/শীষ ধ্বনিসহ যা।',
      ar: 'حرف صفير مجهور من طرف اللسان مع صفحة الثنايا السفلى.',
      ur: 'سیٹی کی واضح آواز کے ساتھ ادا کریں۔',
    },
  },
  {
    letter: 'س',
    name: { en: 'Seen (سين)', bn: 'সীন (س)', ar: 'سين', ur: 'سین (س)' },
    makhrajId: 13,
    sifatIds: ['hams', 'rakhawah', 'istifal', 'infitah', 'ismat', 'safeer'],
    tip: {
      en: 'Light crisp “s” whistle (Safeer) without lifting the back of the tongue.',
      bn: 'হালকা ও স্পষ্ট শীষসহ সীন—মুখ ভরাট না করে পাতলাভাবে।',
      ar: 'سين مرققة ذات صفير واضح وجريان نفس وصوت.',
      ur: 'باریک آواز اور واضح سیٹی کے ساتھ ادا کریں۔',
    },
  },
  {
    letter: 'ش',
    name: { en: 'Sheen (شين)', bn: 'শীন (ش)', ar: 'شين', ur: 'شین (ش)' },
    makhrajId: 7,
    sifatIds: ['hams', 'rakhawah', 'istifal', 'infitah', 'ismat', 'tafashshi'],
    tip: {
      en: 'Air spreads softly inside mouth (Tafashshi) from mid-tongue like “sh”.',
      bn: 'মুখের ভেতর বাতাস ছড়িয়ে (তাফাশশী) শীন উচ্চারিত হয়।',
      ar: 'شين مرققة يتفشّى فيها الهواء داخل الفم من وسط اللسان.',
      ur: 'زبان کے درمیان سے پورے منہ میں ہوا پھیلا کر ادا کریں۔',
    },
  },
  {
    letter: 'ص',
    name: { en: 'Sad (صاد)', bn: 'স্বদ (ص)', ar: 'صاد', ur: 'صاد (ص)' },
    makhrajId: 13,
    sifatIds: ['hams', 'rakhawah', 'istila', 'itbaq', 'ismat', 'safeer'],
    heavy: true,
    tip: {
      en: 'Heavy & Enclosed S with strong whistle; keep back tongue high and lips natural.',
      bn: 'সীন-এর মাখরাজে তবে জিহ্বার গোড়া ও তালু উঁচু করে ভারী স্বদ।',
      ar: 'صاد مفخمة مطبقة ذات صفير قوي دون إشراك الشفتين.',
      ur: 'زبان کی جڑ اور درمیان اٹھا کر موٹی اور سیٹی والی آواز کے ساتھ پڑھیں۔',
    },
  },
  {
    letter: 'ض',
    name: { en: 'Dad (ضاد)', bn: 'দ্বদ (ض)', ar: 'ضاد', ur: 'ضاد (ض)' },
    makhrajId: 8,
    sifatIds: ['jahr', 'rakhawah', 'istila', 'itbaq', 'ismat', 'istitalah'],
    heavy: true,
    tip: {
      en: 'Press tongue side edges to upper molars with soft sound stretch (Istitalah)—do not make it د or ظ!',
      bn: 'জিহ্বার কিনারা মাড়ির দাঁতে লাগিয়ে গম্ভীর ও প্রলম্বিত দ্বদ (এটি দাল বা যোয়ার মতো নয়)।',
      ar: 'حرف الضاد المستطيل المفخم من حافة اللسان والأضراس العليا دون قلقلة.',
      ur: 'زبان کے کنارے داڑھوں سے لگا کر استطالہ کے ساتھ موٹا پڑھیں (د یا ظ جیسا نہ ہو)۔',
    },
  },
  {
    letter: 'ط',
    name: { en: 'Taa Heavy (طاء)', bn: 'ত্ব (ط)', ar: 'طاء', ur: 'طاء (ط)' },
    makhrajId: 12,
    sifatIds: ['jahr', 'shiddah', 'istila', 'itbaq', 'ismat', 'qalqalah'],
    heavy: true,
    tip: {
      en: 'Strongest heavy letter! Full-mouth T with no extra breath on Sukun—uses strong Qalqalah.',
      bn: 'আরবির সবচেয়ে শক্তিশালী মোটা হরফ; বাতাস না ছেড়ে ভরাট ত্ব ও সাকিনে কলকলা।',
      ar: 'أقوى الحروف تفخيماً وإطباقاً، ولا هَمْس فيها بل قلقلة عند السكون.',
      ur: 'سب سے زیادہ پُر اور مضبوط حرف؛ اس میں سانس جاری نہیں ہوتا بلکہ جزم پر قلقلہ ہوتا ہے۔',
    },
  },
  {
    letter: 'ظ',
    name: { en: 'Dhaa Heavy (ظاء)', bn: 'যোয়া (ظ)', ar: 'ظاء', ur: 'ظاء (ظ)' },
    makhrajId: 14,
    sifatIds: ['jahr', 'rakhawah', 'istila', 'itbaq', 'ismat'],
    heavy: true,
    tip: {
      en: 'Heavy version of ذ: tip of tongue on upper incisors edge with back tongue raised.',
      bn: 'যাল-এর মাখরাজে তবে জিহ্বার গোড়া ও মাঝখান উঁচু করে মোটা যোয়া (শীষ ছাড়া)।',
      ar: 'حرف لثوي مفخم مطبق رخو من طرف اللسان وأطراف الثنايا العليا.',
      ur: 'ذال کے مخرج سے زبان کو اوپر اٹھا کر موٹا پڑھیں۔',
    },
  },
  {
    letter: 'ع',
    name: { en: 'Ayn (عين)', bn: 'আইন (ع)', ar: 'عين', ur: 'عین (ع)' },
    makhrajId: 3,
    sifatIds: ['jahr', 'tawassut', 'istifal', 'infitah', 'ismat'],
    tip: {
      en: 'Smooth deep resonance from mid-throat (not Hamzah); hold briefly in Tawassut.',
      bn: 'কণ্ঠনালীর মাঝখান থেকে গভীর ও পরিষ্কারভাবে আইন উচ্চারিত হয়—আলিফের মতো নয়।',
      ar: 'تخرج من وسط الحلق بنعومة وتوسط دون بترٍ أو مبالغة في الضغط.',
      ur: 'درمیانی حلق سے گہرائی اور نرمی کے ساتھ ادا کریں۔',
    },
  },
  {
    letter: 'غ',
    name: { en: 'Ghayn (غين)', bn: 'গাইন (غ)', ar: 'غين', ur: 'غین (غ)' },
    makhrajId: 4,
    sifatIds: ['jahr', 'rakhawah', 'istila', 'infitah', 'ismat'],
    heavy: true,
    tip: {
      en: 'Voiced heavy letter from upper throat; gentle flow without turning into a hard Qaf.',
      bn: 'উপরের কণ্ঠনালী থেকে মোটা গাইন—সাকিন অবস্থায় ধাক্কা না খেয়ে মৃদুভাবে চলবে।',
      ar: 'غين مفخمة رخوة من أدنى الحلق دون قلقلة.',
      ur: 'ادنیٰ حلق سے موٹا اور نرم آواز کے ساتھ پڑھیں (قلقلہ نہ ہو)۔',
    },
  },
  {
    letter: 'ف',
    name: { en: 'Faa (فاء)', bn: 'ফা (ف)', ar: 'فاء', ur: 'فاء (ف)' },
    makhrajId: 15,
    sifatIds: ['hams', 'rakhawah', 'istifal', 'infitah', 'idhlaq'],
    tip: {
      en: 'Top front teeth rest softly on lower lip allowing continuous gentle breath.',
      bn: 'উপরের সামনের দাঁত নিচের ঠোঁটের পেটে লাগিয়ে নরম বাতাসসহ ফা।',
      ar: 'فاء مرققة ذات همس ورخاوة من باطن الشفة السفلى وأطراف الثنايا.',
      ur: 'اوپر کے دانت نچلے ہونٹ کے اندرونی حصے پر رکھ کر نرمی سے ادا کریں۔',
    },
  },
  {
    letter: 'ق',
    name: { en: 'Qaf (قاف)', bn: 'ক্বফ (ق)', ar: 'قاف', ur: 'قاف (ق)' },
    makhrajId: 5,
    sifatIds: ['jahr', 'shiddah', 'istila', 'infitah', 'ismat', 'qalqalah'],
    heavy: true,
    tip: {
      en: 'Deep uvular heavy Q (distinct from ك); crisp echo/Qalqalah when Sakin.',
      bn: 'জিহ্বার গোড়া উপরের নরম তালুতে লাগিয়ে মোটা ক্বফ; সাকিনে কলকলা হবে।',
      ar: 'قاف مفخمة من أقصى اللسان مع الحنك اللحمي وتُقلقل عند السكون.',
      ur: 'زبان کی جڑ نرم تالو سے لگا کر موٹا پڑھیں اور جزم پر قلقلہ کریں۔',
    },
  },
  {
    letter: 'ك',
    name: { en: 'Kaf (كاف)', bn: 'কাফ (ك)', ar: 'كاف', ur: 'کاف (ك)' },
    makhrajId: 6,
    sifatIds: ['hams', 'shiddah', 'istifal', 'infitah', 'ismat'],
    tip: {
      en: 'Light K slightly forward of Qaf; finishes with soft puff of breath (Hams).',
      bn: 'হালকা ও পাতলা কাফ; সাকিনে সামান্য বাতাস (হামস) বের হবে, কলকলা নয়।',
      ar: 'كاف مرققة تخرج مع همس لطيف عند الوقف والسكون.',
      ur: 'باریک کاف جو جزم کے وقت ہلکے سانس (ہمس) کے ساتھ ادا ہو۔',
    },
  },
  {
    letter: 'ل',
    name: { en: 'Lam (لام)', bn: 'লাম (ل)', ar: 'لام', ur: 'لام (ل)' },
    makhrajId: 9,
    sifatIds: ['jahr', 'tawassut', 'istifal', 'infitah', 'idhlaq', 'inhiraf'],
    tip: {
      en: 'Light L on upper gum ridge (heavy only in word Allah preceded by Fatha/Dammah).',
      bn: 'উপরের দাঁতের মাড়ি থেকে চিকন লাম (শুধু আল্লাহ শব্দে যবর/পেশের পর মোটা হয়)।',
      ar: 'لام مرققة من حافة اللسان؛ وتُفخم فقط في لفظ الجلالة بعد فتح أو ضم.',
      ur: 'باریک لام؛ صرف لفظِ اللہ میں زبر یا پیش کے بعد موٹا پڑھا جاتا ہے۔',
    },
  },
  {
    letter: 'م',
    name: { en: 'Meem (ميم)', bn: 'মীম (م)', ar: 'ميم', ur: 'میم (م)' },
    makhrajId: 16,
    sifatIds: ['jahr', 'tawassut', 'istifal', 'infitah', 'idhlaq', 'ghunnah'],
    tip: {
      en: 'Both lips close gently accompanied by Khayshum nasal sound.',
      bn: 'দুই ঠোঁট মিলিয়ে নাকের সুরের সহায়তায় মীম; তাশদীদে ২ হরকত গুন্নাহ।',
      ar: 'انطباق الشفتين بلطف مع مصاحبة الغنة من الخيشوم.',
      ur: 'دونوں ہونٹوں کو ملا کر ناک کے غنہ کے ساتھ ادا کریں۔',
    },
  },
  {
    letter: 'ن',
    name: { en: 'Noon (نون)', bn: 'নূন (ن)', ar: 'نون', ur: 'نون (ن)' },
    makhrajId: 10,
    sifatIds: ['jahr', 'tawassut', 'istifal', 'infitah', 'idhlaq', 'ghunnah'],
    tip: {
      en: 'Tongue tip on gum ridge + inherent Ghunnah; changes rule cleanly depending on next letter.',
      bn: 'দাঁতের মাড়ি ও নাকের সুরে নূন; পরের হরফ অনুযায়ী ইযহার, ইদগাম, ইকলাব বা ইখফা হয়।',
      ar: 'من طرف اللسان واللثة مع الغنة؛ ولها أربعة أحكام عند السكون.',
      ur: 'زبان کی نوک مسوڑھوں پر لگا کر ناک کی مدد سے پڑھیں؛ ساکن ہونے پر ۴ احکام ہیں۔',
    },
  },
  {
    letter: 'ه',
    name: { en: 'Haa Soft (هاء)', bn: 'নরম হা (ه)', ar: 'هاء', ur: 'ہاء (ه)' },
    makhrajId: 2,
    sifatIds: ['hams', 'rakhawah', 'istifal', 'infitah', 'ismat'],
    tip: {
      en: 'Very gentle chest/deep-throat H—do not swallow it when Sakin at word endings.',
      bn: 'বুক ও কণ্ঠনালীর গভীর থেকে অত্যন্ত নরম হা; শব্দের শেষে যেন হারিয়ে না যায়।',
      ar: 'هاء خفية مرققة من أقصى الحلق يلزم بيانها عند الوقف.',
      ur: 'انتہائی حلق سے نرمی سے ادا کریں اور وقف پر واضح رکھیں۔',
    },
  },
  {
    letter: 'و',
    name: { en: 'Waw (واو)', bn: 'ওয়াও (و)', ar: 'واو', ur: 'واؤ (و)' },
    makhrajId: 16,
    sifatIds: ['jahr', 'rakhawah', 'istifal', 'infitah', 'ismat', 'leen'],
    tip: {
      en: 'Form a small rounded O with both lips (never bite lower lip like English V).',
      bn: 'দুই ঠোঁট পরিষ্কারভাবে গোল করে ওয়াও—নিচের ঠোঁটে দাঁত লাগাবেন না।',
      ar: 'ضم الشفتين للأمام مع فرجة صغيرة دون ملامسة الأسنان.',
      ur: 'دونوں ہونٹ گول کر کے ادا کریں، دانت نچلے ہونٹ پر نہ لگیں۔',
    },
  },
  {
    letter: 'ي',
    name: { en: 'Yaa (ياء)', bn: 'ইয়া (ي)', ar: 'ياء', ur: 'یاء (ي)' },
    makhrajId: 7,
    sifatIds: ['jahr', 'rakhawah', 'istifal', 'infitah', 'ismat', 'leen'],
    tip: {
      en: 'Middle tongue lifts lightly toward hard palate without nasal tone.',
      bn: 'জিহ্বার মাঝখান থেকে পরিষ্কার ইয়া; নাকের সুর ছাড়াই।',
      ar: 'من وسط اللسان مع ترك الغنة في النطق الطبيعي.',
      ur: 'زبان کے درمیانی حصے سے بغیر ناک کی آواز کے صاف ادا کریں۔',
    },
  },
];

// Handle special Uthmani letters mapping cleanly back to canonical 29 Arabic letters
export const LETTER_ALIAS: Record<string, string> = {
  أ: 'ء',
  إ: 'ء',
  آ: 'ا',
  ٱ: 'ا',
  ى: 'ا',
  ئ: 'ء',
  ؤ: 'ء',
  ة: 'ه',
  ـ: 'ا',
};

export function resolveLetterMeta(char: string): ArabicLetterMeta | null {
  const key = LETTER_ALIAS[char] || char;
  return ARABIC_LETTERS.find((x) => x.letter === key) || null;
}

export const QAIDA_CURRICULUM: QaidaLesson[] = [
  {
    id: 'nun_sakinah',
    badge: '4 Rules',
    title: {
      en: '1. Rules of Nun Sakinah & Tanween (نْ / ً ٍ ٌ)',
      bn: '১. নূন সাকিন ও তানভীনের ৪টি কায়েদা',
      ar: '١. أحكام النون الساكنة والتنوين (٤ أحكام)',
      ur: '۱. نون ساکن اور تنوین کے ۴ قواعد',
    },
    summary: {
      en: 'Depending on the letter immediately after Nun Sakinah or Tanween, there are 4 distinct Tajweed rules.',
      bn: 'নূন সাকিন অথবা তানভীনের পর কোন হরফ এসেছে তার ওপর ভিত্তি করে ৪টি প্রধান নিয়ম প্রযোজ্য হয়।',
      ar: 'تتغير طريقة نطق النون الساكنة والتنوين بحسب الحرف الذي يليهما إلى أربعة أحكام.',
      ur: 'نون ساکن یا تنوین کے بعد آنے والے حرف کے لحاظ سے چار بنیادی احکام لاگو ہوتے ہیں۔',
    },
    points: [
      {
        subtitle: {
          en: 'Izhar Halqi (Clear Throat Reading · ء هـ ع ح غ خ)',
          bn: 'ইযহার হালকী (স্পষ্ট উচ্চারণ · ৬টি হরফ: ء هـ ع ح غ خ)',
          ar: 'الإظهار الحلقي (ء هـ ع ح غ خ)',
          ur: 'اظہارِ حلقی (صاف پڑھنا · ۶ حروف: ء هـ ع ح غ خ)',
        },
        detail: {
          en: 'Pronounce Nun Sakinah/Tanween clearly from its makhraj with ZERO extra Ghunnah when followed by any of the 6 throat letters.',
          bn: 'হলকের ৬টি হরফ পরে এলে নূন সাকিন বা তানভীনকে গুন্নাহ ছাড়া একদম স্পষ্টভাবে উচ্চারণ করুন।',
          ar: 'إخراج النون الساكنة والتنوين من مخرجهما بوضوح تام من غير غنة زائدة.',
          ur: 'حلق کے ۶ حروف کے آنے پر نون ساکن اور تنوین کو بغیر اضافی غنہ کے صاف پڑھیں۔',
        },
        examples: [
          {
            ar: 'أَنْعَمْتَ · مَنْ آمَنَ · عَلِيمٌ حَكِيمٌ',
            note: {
              en: 'Clear Noon before ع, ء, ح',
              bn: 'ع, ء, ح-এর আগে স্পষ্ট নূন/তানভীন',
              ar: 'نطق واضح للنون عند العين والهمزة والحاء',
              ur: 'ع، ء اور ح سے پہلے نون کی واضح ادائیگی',
            },
          },
        ],
      },
      {
        subtitle: {
          en: 'Idgham (Merging · ي ر م ل و ن)',
          bn: 'ইদগাম (মিলিয়ে পড়া · ইয়ারমালূন ৬ হরফ)',
          ar: 'الإدغام (يرملون: بغنة في ينمو · بلا غنة في ل ر)',
          ur: 'ادغام (ملا کر پڑھنا · یرملون ۶ حروف)',
        },
        detail: {
          en: 'Merge into (ي ن م و) WITH 2-count Ghunnah, and into (ل ر) WITHOUT Ghunnah. Exception within 1 word (دُنْيَا, بُنْيَان, صِنْوَان, قِنْوَان) → Izhar Mutlaq.',
          bn: 'ي ن م و এলে ২ হরকত গুন্নাহসহ মিলিয়ে পড়ুন, আর ل ر এলে গুন্নাহ ছাড়া মিলিয়ে পড়ুন। এক শব্দে এলে (দুনইয়া ইত্যাদি) স্পষ্ট পড়তে হয়।',
          ar: 'إدغام بغنة في (ينمو)، وإدغام كامل بلا غنة في (ل ر). ويُستثنى كلمة واحدة كـ (دنيا).',
          ur: '(ی ن م و) پر غنہ کے ساتھ اور (ل ر) پر بغیر غنہ کے ملا کر پڑھیں۔',
        },
        examples: [
          {
            ar: 'مَنْ يَقُولُ · مِن رَّبِّهِمْ',
            note: {
              en: 'ي with Ghunnah · ر without Ghunnah',
              bn: 'ي গুন্নাহসহ · ر গুন্নাহ ছাড়া',
              ar: 'الياء بغنة · الراء بلا غنة',
              ur: 'ی غنہ کے ساتھ · ر بغیر غنہ کے',
            },
          },
        ],
      },
      {
        subtitle: {
          en: 'Iqlab (Convert to Hidden Meem · ب)',
          bn: 'ইকলাব (বদল করে মীম পড়া · ১টি হরফ: ب)',
          ar: 'الإقلاب (عند الباء فقط)',
          ur: 'اقلاب (ب کے آنے پر نون کو میم سے بدلنا)',
        },
        detail: {
          en: 'Before ب, Noon/Tanween changes into a gentle hidden Meem held for 2 counts.',
          bn: 'নূন সাকিন/তানভীনের পর ب এলে নূনকে মীম দিয়ে বদলে ২ হরকত গুন্নাহ করুন।',
          ar: 'تُقلب النون أو التنوين ميماً مخفاةً قبل الباء بمقدار حركتين.',
          ur: 'ب آنے پر نون/تنوین کو خفیہ میم میں بدل کر ۲ حرکات غنہ کریں۔',
        },
        examples: [
          {
            ar: 'مِنۢ بَعْدِ · سَمِيعٌۢ بَصِيرٌ',
            note: {
              en: 'Marked with small م above Nun/Tanween',
              bn: 'ছোট মীম (م) চিহ্ন দিয়ে চিহ্নিত থাকে',
              ar: 'تُرمز لها بميم صغيرة فوق النون',
              ur: 'اوپر چھوٹی میم (م) علامت بنی ہوتی ہے',
            },
          },
        ],
      },
      {
        subtitle: {
          en: 'Ikhfa Haqiqi (Concealed Sound · 15 Remaining Letters)',
          bn: 'ইখফা হাকীকী (গোপন গুন্নাহ · বাকি ১৫টি হরফ)',
          ar: 'الإخفاء الحقيقي (١٥ حرفاً: ص ذ ث ك ج ش ق س د ط ز ف ت ض ظ)',
          ur: 'اخفاءِ حقیقی (۱۵ حروف پر چھپا کر غنہ)',
        },
        detail: {
          en: 'Conceal Nun between clarity and merging with 2-count Ghunnah; the Ghunnah sounds heavy before heavy letters (ص ض ط ظ ق).',
          bn: 'বাকি ১৫ হরফে আওয়াজ গোপন করে ২ হরকত গুন্নাহ করুন; মোটা হরফের আগে গুন্নাহও মোটা হবে।',
          ar: 'نطق متوسط مع غنة حركتين، وتُفخم الغنة قبل حروف الاستعلاء (ص ض ط ظ ق).',
          ur: 'بقیہ ۱۵ حروف پر آواز چھپا کر ۲ حرکات غنہ کریں؛ موٹے حروف سے پہلے غنہ بھی موٹا ہوگا۔',
        },
      },
    ],
  },
  {
    id: 'meem_sakinah',
    badge: '3 Rules',
    title: {
      en: '2. Rules of Meem Sakinah (مْ)',
      bn: '২. মীম সাকিনের ৩টি কায়েদা',
      ar: '٢. أحكام الميم الساكنة (٣ أحكام)',
      ur: '۲. میم ساکن کے ۳ قواعد',
    },
    summary: {
      en: 'Clear and easy rules based on whether ب, م, or any other letter follows Meem Sakinah.',
      bn: 'মীম সাকিনের পর ب, م নাকি অন্য কোনো হরফ এসেছে তার ওপর নির্ভর করে ৩টি নিয়ম হয়।',
      ar: 'أحكام الميم الساكنة ثلاثة بحسب الحرف الذي يليها.',
      ur: 'میم ساکن کے بعد ب، م یا دیگر حروف آنے پر تین احکام ہوتے ہیں۔',
    },
    points: [
      {
        subtitle: {
          en: 'Ikhfa Shafawi (before ب · 2 Counts)',
          bn: 'ইখফায়ে শাফাবী (মীম সাকিনের পর ب এলে ২ হরকত গুন্নাহ)',
          ar: 'الإخفاء الشفوي (عند الباء · حركتان)',
          ur: 'اخفاء شفوی (م ساکن کے بعد ب آئے)',
        },
        detail: {
          en: 'Gently close lips over Meem Sakinah and hold 2-count Ghunnah before releasing ب.',
          bn: 'ঠোঁট হালকাভাবে স্পর্শ করে ২ হরকত গুন্নাহর পর ب পড়ুন।',
          ar: 'إخفاء الميم الساكنة عند الباء مع غنة حركتين بتلامس لطيف.',
          ur: 'ب سے پہلے م پر ۲ حرکات نرمی سے غنہ کریں۔',
        },
        examples: [
          {
            ar: 'تَرْمِيهِم بِحِجَارَةٍ · يَعْتَصِم بِاللَّهِ',
            note: {
              en: 'Soft Meem before ب',
              bn: 'ب-এর আগে মীমে গুন্নাহ',
              ar: 'غنة الميم قبل الباء',
              ur: 'ب سے پہلے میم پر غنہ',
            },
          },
        ],
      },
      {
        subtitle: {
          en: 'Idgham Shafawi (before م · 2 Counts)',
          bn: 'ইদগামে শাফাবী (মীম সাকিনের পর মীম এলে মিলিয়ে গুন্নাহ)',
          ar: 'الإدغام الشفوي (الميم في الميم · حركتان)',
          ur: 'ادغام شفوی (م کے بعد م آئے)',
        },
        detail: {
          en: 'Merge first Meem into second Meem making one doubled مّ with 2-count Ghunnah.',
          bn: 'দুটি মীম এক হয়ে তাশদীদযুক্ত মীম হিসেবে ২ হরকত গুন্নাহসহ পড়া হয়।',
          ar: 'إدغام الميم الساكنة في الميم المتحركة فتصيران ميماً مشددة بغنة.',
          ur: 'پہلی میم کو دوسری میم میں ملا کر مشدد پڑھیں اور ۲ حرکات غنہ کریں۔',
        },
        examples: [
          {
            ar: 'لَهُم مَّغْفِرَةٌ · أَطْعَمَهُم مِّن جُوعٍ',
            note: {
              en: 'Merged doubled مّ',
              bn: 'মীমে-মীমে মিলিয়ে গুন্নাহ',
              ar: 'إدغام الميم في الميم بغنة',
              ur: 'میم میں میم کا ادغام مع غنہ',
            },
          },
        ],
      },
      {
        subtitle: {
          en: 'Izhar Shafawi (Remaining 26 Letters · Clear)',
          bn: 'ইযহারে শাফাবী (বাকি ২৬ হরফে স্পষ্ট ও গুন্নাহ ছাড়া)',
          ar: 'الإظهار الشفوي (باقي ٢٦ حرفاً · واضح)',
          ur: 'اظہار شفوی (بقیہ ۲۶ حروف پر صاف پڑھنا)',
        },
        detail: {
          en: 'Pronounce Meem cleanly without stretching or nasal Ghunnah—especially careful before و and ف!',
          bn: 'কোনো গুন্নাহ ছাড়াই মীম স্পষ্ট উচ্চারণ করুন—বিশেষ করে و ও ف-এর আগে সতর্ক থাকুন।',
          ar: 'إظهار الميم بوضوح دون غنة، وتشتد الحذر عند الواو والفاء.',
          ur: 'میم کو بغیر غنہ کے صاف پڑھیں، خاص طور پر و اور ف سے پہلے احتیاط کریں۔',
        },
      },
    ],
  },
  {
    id: 'ahkam_madd',
    badge: '2–6 Beats',
    title: {
      en: '3. Complete Ahkam Al-Madd (Elongation)',
      bn: '৩. মদ্দের সকল প্রকার ও পরিমাণ (টান)',
      ar: '٣. أحكام المدود وأزمنتها (٢ – ٦ حركات)',
      ur: '۳. مد کے تمام اقسام اور مقدار',
    },
    summary: {
      en: 'Every Quranic elongation rule sorted by length from 2 counts up to 6 counts.',
      bn: 'কুরআনের সমস্ত মদ্দ বা টান ২ হরকত থেকে ৬ হরকত পর্যন্ত পরিমাপ অনুযায়ী সাজানো।',
      ar: 'جميع أنواع المدّ في القرآن الكريم مرتبةً حسب عدد الحركات.',
      ur: 'قرآن کے تمام مدود ان کی مقدار (۲ سے ۶ حرکات) کے مطابق۔',
    },
    points: [
      {
        subtitle: {
          en: '2 Counts (Madd Tabi’i, Badal, ‘Iwad, Silah Sughra)',
          bn: '১ আলিফ / ২ হরকত (মদ্দে তবায়ী, বদল, ইওয়াদ, সিলাহ সুগরা)',
          ar: 'حركتان (الطبيعي، البدل، العوض، الصلة الصغرى)',
          ur: '۲ حرکات (مد اصلی، بدل، عوض، صلہ صغریٰ)',
        },
        detail: {
          en: 'Alif after Fatha, Waw after Dammah, Ya after Kasrah, ءا (Badal), stopping on Fatha Tanween ً -> ا (Iwad), or Ha pronoun ending with short vowel.',
          bn: 'যবরের পর আলিফ, পেশের পর ওয়াও, যেরের পর ইয়া, দুই যবরে ওয়াকফ (মদ্দে ইওয়াদ) এবং হায়ের সিলাহ ২ হরকত টেনে পড়ুন।',
          ar: 'ثلاثة حروف المد الأصلية، والهمزة الممدودة (آدم)، والوقف على تنوين الفتح (عليماً)، وهاء الضمير.',
          ur: 'حروف مدہ، مد بدل، دو زبر پر وقف (مد عوض) اور ہائے کنایہ پر ۲ حرکات کھینچیں۔',
        },
      },
      {
        subtitle: {
          en: '4–5 Counts (Wajib Muttasil · Jaiz Munfasil · Silah Kubra)',
          bn: '৪–৫ হরকত (মদ্দে ওয়াজিব মুত্তাসিল · মদ্দে জায়েয মুনফাসিল · সিলাহ কুবরা)',
          ar: '٤–٥ حركات (الواجب المتصل · الجائز المنفصل · الصلة الكبرى)',
          ur: '۴ تا ۵ حرکات (مد واجب متصل · مد جائز منفصل · صلہ کبریٰ)',
        },
        detail: {
          en: 'Madd followed by Hamzah inside the SAME word (Wajib Muttasil: جَآءَ) or NEXT word (Jaiz Munfasil: بِمَآ أُنزِلَ).',
          bn: 'মদ্দের হরফের পর একই শব্দে হামযা এলে ওয়াজিব (৪-৫ হরকত), আর পরের শব্দের শুরুতে এলে জায়েয মুনফাসিল।',
          ar: 'أن يأتي بعد حرف المدّ همز في الكلمة نفسها (متصل) أو في أول الكلمة التالية (منفصل).',
          ur: 'حرف مد کے بعد ہمزہ اسی کلمے میں ہو تو مد واجب متصل، اور اگلے کلمے میں ہو تو مد جائز منفصل۔',
        },
      },
      {
        subtitle: {
          en: '2 / 4 / 6 Counts (Madd ‘Arid lis-Sukun & Madd Leen)',
          bn: '২ / ৪ / ৬ হরকত (মদ্দে আরিদ লিস্‌সুকুন ও মদ্দে লীন)',
          ar: '٢ / ٤ / ٦ حركات (العارض للسكون واللين)',
          ur: '۲ / ۴ / ۶ حرکات (مد عارض للسکون اور مد لین)',
        },
        detail: {
          en: 'Occurs when pausing on the last letter of a word right after a Madd or Leen letter (ٱلْعَـٰلَمِينَ · قُرَيْشٍ). Keep consistent length throughout your session.',
          bn: 'আয়াতের শেষে ওয়াকফ করার কারণে শেষ অক্ষরের আগের মদ্দ/লীন হরফে যে টান হয় (যেমন আল-আলামী-ন)। এক বসায় একই মাপ বজায় রাখুন।',
          ar: 'عند الوقف على حرفٍ يسبقه حرف مد أو لين؛ ويجوز فيه القصر والتوسط والمد.',
          ur: 'آیت کے آخر میں وقف کی وجہ سے ماقبل مد یا لین حرف پر؛ تلاوت میں ایک ہی مقدار قائم رکھیں۔',
        },
      },
      {
        subtitle: {
          en: '6 Counts Always (Madd Lazim Kalimi & Harfi)',
          bn: 'সর্বদা ৬ হরকত (মদ্দে লাযিম কালিমী ও হারফী)',
          ar: '٦ حركات وجوباً (المدّ اللازم الكلمي والحرفي)',
          ur: '۶ حرکات لازمی (مد لازم کلمی و حرفی)',
        },
        detail: {
          en: 'When an original Sukun or Shaddah immediately follows a Madd letter (ٱلضَّآلِّينَ · الٓمٓ · يسٓ). Stretch a full 6 counts.',
          bn: 'মদ্দের হরফের পর আসলি সাকিন বা তাশদীদ এলে (যেমন ওয়ালাদ-দোয়া-ল্লীন বা আলিফ-লা-ম মী-ম) পুরো ৬ হরকত টানতে হয়।',
          ar: 'أن يأتي بعد حرف المدّ سكون أصلي أو تشديد في كلمة أو في الحروف المقطعة.',
          ur: 'حرف مد کے بعد اصلی سکون یا تشدید آئے تو پورا ۶ حرکات لمبا کھینچیں۔',
        },
      },
    ],
  },
  {
    id: 'tafkheem_raa',
    badge: 'Heavy/Light',
    title: {
      en: '4. Tafkheem, Tarqeeq & Rules of Raa (ر)',
      bn: '৪. তাফখীম (মোটা), তারকীক (পাতলা) ও র (ر)-এর বিধান',
      ar: '٤. التفخيم والترقيق وأحكام الراء واللام',
      ur: '۴. تفخیم، ترقیق اور را (ر) کے احکام',
    },
    summary: {
      en: 'Master when letters are heavy vs light—especially Isti‘la letters, Alif, Lam of Allah, and Raa.',
      bn: 'কোন হরফ সবসময় মোটা, কোনটি চিকন এবং র (ر) ও আল্লাহ শব্দের লাম কখন মোটা/পাতলা হয় তা জানুন।',
      ar: 'ضوابط تفخيم الحروف وترقيقها ولا سيما حروف الاستعلاء ولام الجلالة والراء.',
      ur: 'کون سے حروف ہمیشہ موٹے رہتے ہیں اور را (ر) کب موٹی یا باریک ہوتی ہے۔',
    },
    points: [
      {
        subtitle: {
          en: 'Always Heavy (خ ص ض غ ط ق ظ)',
          bn: 'সর্বদা মোটা ৭টি হরফ (খুছ্ছা দ্বগত্বিন ক্বিয)',
          ar: 'مفخمة دائماً (خص ضغط قظ)',
          ur: 'ہمیشہ موٹے ۷ حروف (خص ضغط قظ)',
        },
        detail: {
          en: 'These 7 letters always stay heavy in all vowels, strongest when followed by Alif (قَالَ), and lightest (relative Tafkheem) on Kasrah (صِرَٰطَ).',
          bn: 'এই ৭টি হরফ সর্বদা মোটা হয়; যবর ও আলিফে সবচেয়ে বেশি মোটা এবং যেরে তুলনামূলক হালকা মোটা।',
          ar: 'حروف الاستعلاء مفخمة في كل أحوالها وأعلاها المفتوح وبعده ألف.',
          ur: 'حروف مستعلیہ ہمیشہ پُر ہوتے ہیں، زبر اور الف کے ساتھ سب سے زیادہ۔',
        },
      },
      {
        subtitle: {
          en: 'Raa (ر) Heavy vs Light Rules',
          bn: 'র (ر) মোটা ও চিকন পড়ার মূল নিয়ম',
          ar: 'أحكام الراء تفخيماً وترقيقاً',
          ur: 'را (ر) کے موٹا اور باریک ہونے کے قواعد',
        },
        detail: {
          en: 'HEAVY: Fatha/Dammah (رَبِّ), or Sukun preceded by Fatha/Dammah (ٱلْقُرْءَان). LIGHT: Kasrah (رِزْق), or Sukun preceded by original Kasrah without heavy letter after (فِرْعَوْن), or stopping after Ya (خَيْر · قَدِير).',
          bn: 'মোটা: র-তে যবর/পেশ থাকলে অথবা সাকিন র-এর আগে যবর/পেশ থাকলে। পাতলা: র-তে যের থাকলে, আগের আসল যেরের পর সাকিন হলে (ফিরআউন) বা ইয়া-র পর ওয়াকফে।',
          ar: 'تُفخم بالفتح والضم أو السكون بعدهما؛ وتُرقق بالكسر أو السكون بعد كسر أصلي أو ياء.',
          ur: 'زبر اور پیش والی را موٹی، اور زیر والی را باریک؛ ساکن را اپنے ماقبل حرکت کے تابع ہوتی ہے۔',
        },
      },
    ],
  },
  {
    id: 'qalqalah_waqf',
    badge: 'Stops & Signs',
    title: {
      en: '5. Qalqalah, Mushabahah Idgham & Waqf Signs',
      bn: '৫. কলকলা, মুতামাসিলাঈন ও কুরআনে ওয়াকফের চিহ্ন',
      ar: '٥. القلقلة، أنواع الإدغام وعلامات الوقف',
      ur: '۵. قلقلہ، ادغام کی اقسام اور علاماتِ وقف',
    },
    summary: {
      en: 'Learn the degrees of Qalqalah, joining similar consonants, and what every stop symbol in the Mushaf means.',
      bn: 'কলকলার স্তর, একই জাতীয় হরফের ইদগাম এবং কুরআন মাজীদের বিভিন্ন ওয়াকফ (থামার) চিহ্নের অর্থ।',
      ar: 'مراتب القلقلة، إدغام المتماثلين والمتجانسين، ودلالات رموز الوقف.',
      ur: 'قلقلہ کے درجات اور قرآن مجید میں وقف کی علامات کا مطلب۔',
    },
    points: [
      {
        subtitle: {
          en: 'Qalqalah Levels: Sughra vs Kubra (ق ط ب ج د)',
          bn: 'কলকলা সুগরা (শব্দের মাঝে) ও কুবরা (শব্দের শেষে ওয়াকফ)',
          ar: 'مراتب القلقلة: صغرى وكبرى',
          ur: 'قلقلہ صغریٰ (درمیان میں) اور کبریٰ (آیت کے آخر میں)',
        },
        detail: {
          en: 'Medium bounce in middle of word/reading (يَخْلُقُ / يَقْطَعُونَ); stronger bounce when stopping at word end (أَحَدْ), strongest when doubled (ٱلْحَقّ).',
          bn: 'শব্দের মাঝে সাকিন হলে হালকা/মাঝারি ধাক্কা, আর আয়াত বা শব্দের শেষে থামলে স্পষ্ট বড় ধাক্কা (কুবরা)।',
          ar: 'صغرى في وسط الكلمة أو الكلام، وكبرى عند الوقف على الحرف، وأشدها المشدد الموقوف عليه.',
          ur: 'لفظ کے درمیان میں ہلکا جھٹکا اور وقف کی جگہ پر نمایاں قلقلہ کیا جاتا ہے۔',
        },
      },
      {
        subtitle: {
          en: 'Mushaf Waqf (Stop) Marks',
          bn: 'কুরআনের ওয়াকফ বা থামার চিহ্নসমূহ',
          ar: 'علامات الوقف في المصحف الشريف',
          ur: 'قرآن مجید کی علاماتِ وقف',
        },
        detail: {
          en: 'مـ = Compulsory stop · لا = Do not stop · ج = Permissible either way · صلى = Better to continue · قلى = Better to stop · ط = Complete stop · ∴ ∴ = Stop at one only.',
          bn: 'مـ = অবশ্যিক থামা · لا = থামবেন না · ج = থামা বা না থামা সমান · صلى = মিলিয়ে পড়া উত্তম · قلى = থামা উত্তম · ط = সম্পূর্ণ থামা · ∴ ∴ = যেকোনো এক জায়গায় থামুন।',
          ar: 'مـ وقف لازم · لا ممنوع · ج جائز مستوي الطرفين · صلى الوصل أولى · قلى الوقف أولى · ∴ معانقة.',
          ur: 'مـ لازم وقف · لا نہ ٹھہریں · ج دونوں جائز · صلى ملا کر پڑھنا بہتر · قلى ٹھہرنا بہتر۔',
        },
      },
    ],
  },
];
