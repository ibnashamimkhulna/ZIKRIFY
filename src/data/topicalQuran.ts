export interface TopicalAyah {
  surahNumber: number;
  surahNameEn: string;
  surahNameBn: string;
  ayahNumber: number;
  ar: string;
  bn: string;
  en: string;
  topicId: string;
}

export interface QuranTopic {
  id: string;
  titleBn: string;
  titleEn: string;
  icon: string;
  descriptionBn: string;
}

export const QURAN_TOPICS: QuranTopic[] = [
  {
    id: 'duas',
    titleBn: 'দোয়া ও রব্বানা',
    titleEn: 'Quranic Duas',
    icon: '🤲',
    descriptionBn: 'পবিত্র কুরআনের অত্যন্ত বরকতপূর্ণ দোয়া ও রব্বানা আয়াতসমূহ',
  },
  {
    id: 'parents',
    titleBn: 'পিতা-মাতার সম্মান',
    titleEn: 'Rights of Parents',
    icon: '❤️',
    descriptionBn: 'মা-বাবার প্রতি সদ্ব্যবহার, কৃতজ্ঞতা ও তাদের জন্য দোয়া',
  },
  {
    id: 'salah',
    titleBn: 'সালাত ও নামাজ',
    titleEn: 'Salah & Prayer',
    icon: '🕌',
    descriptionBn: 'নিয়মিত নামাজ কায়েম, একাগ্রতা ও অন্তরের প্রশান্তি',
  },
  {
    id: 'fasting',
    titleBn: 'রোজা ও সিয়াম',
    titleEn: 'Fasting & Ramadan',
    icon: '🌙',
    descriptionBn: 'পবিত্র রমজানের মাহাত্ম্য, রোজার বিধান ও তাকওয়া অর্জন',
  },
  {
    id: 'sabr',
    titleBn: 'ধৈর্য ও তাওয়াক্কুল',
    titleEn: 'Patience & Trust',
    icon: '🛡️',
    descriptionBn: 'কঠিন মুহূর্তে সবর, আল্লাহর ওপর ভরসা ও অবিচলতা',
  },
  {
    id: 'jannah',
    titleBn: 'জান্নাত ও নেয়ামত',
    titleEn: 'Jannah & Rewards',
    icon: '🌿',
    descriptionBn: 'মুত্তাকীদের চিরস্থায়ী জান্নাত ও অতুলনীয় সুসংবাদ',
  },
  {
    id: 'tawbah',
    titleBn: 'তওবা ও ক্ষমা',
    titleEn: 'Repentance & Mercy',
    icon: '⚖️',
    descriptionBn: 'আল্লাহর অসীম রহমত, ক্ষমা প্রার্থনা ও পাপমোচনের পথ',
  },
  {
    id: 'charity',
    titleBn: 'যাকাত ও দান-সদকা',
    titleEn: 'Charity & Zakat',
    icon: '💰',
    descriptionBn: 'সম্পদের পবিত্রতা, গরীবের হক ও আল্লাহর রাস্তায় ব্যয়',
  },
  {
    id: 'character',
    titleBn: 'চরিত্র ও সদাচার',
    titleEn: 'Ethics & Good Deeds',
    icon: '💎',
    descriptionBn: 'সততা, উত্তম আচরণ, গীবত বর্জন ও ইনসাফ কায়েম',
  },
  {
    id: 'virtuous',
    titleBn: 'শ্রেষ্ঠ আয়াতসমূহ',
    titleEn: 'Virtuous Ayahs',
    icon: '🌟',
    descriptionBn: 'আয়াতুল কুরসী, আমানার রাসুল ও বিশেষ বরকতময় আয়াত',
  },
];

export const TOPICAL_AYAHS: TopicalAyah[] = [
  // 1. Duas
  {
    topicId: 'duas',
    surahNumber: 2,
    surahNameEn: 'Al-Baqarah',
    surahNameBn: 'সূরা আল-বাকারা',
    ayahNumber: 201,
    ar: 'رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةًۭ وَفِى ٱلْـَٔاخِرَةِ حَسَنَةًۭ وَقِنَا عَذَابَ ٱلنَّارِ',
    bn: 'হে আমাদের প্রতিপালক! আমাদের ইহকালে কল্যাণ দিন এবং পরকালেও কল্যাণ দিন এবং আমাদের জাহান্নামের শাস্তি থেকে রক্ষা করুন।',
    en: 'Our Lord, give us in this world that which is good and in the Hereafter that which is good and protect us from the punishment of the Fire.',
  },
  {
    topicId: 'duas',
    surahNumber: 2,
    surahNameEn: 'Al-Baqarah',
    surahNameBn: 'সূরা আল-বাকারা',
    ayahNumber: 286,
    ar: 'رَبَّنَا لَا تُؤَاخِذْنَآ إِن نَّسِينَآ أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَآ إِصْرًۭا كَمَا حَمَلْتَهُۥ عَلَى ٱلَّذِينَ مِن قَبْلِنَا',
    bn: 'হে আমাদের রব! আমরা যদি ভুলে যাই কিংবা ভুল করি, তবে আপনি আমাদের পাকড়াও করবেন না। হে আমাদের রব! আমাদের পূর্ববর্তীদের ওপর যেমন ভারী বোঝা অর্পণ করেছিলেন, আমাদের ওপর তেমন বোঝা অর্পণ করবেন না।',
    en: 'Our Lord, do not impose blame upon us if we have forgotten or erred. Our Lord, and lay not upon us a burden like that which You laid upon those before us.',
  },
  {
    topicId: 'duas',
    surahNumber: 3,
    surahNameEn: 'Ali ‘Imran',
    surahNameBn: 'সূরা আলে-ইমরান',
    ayahNumber: 8,
    ar: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ ٱلْوَهَّابُ',
    bn: 'হে আমাদের রব! সরল পথ প্রদর্শনের পর আপনি আমাদের অন্তরকে সত্যলঙ্ঘনকারী করবেন না এবং আপনার নিকট থেকে আমাদের অনুগ্রহ দান করুন। নিশ্চয়ই আপনি পরম দাতা।',
    en: 'Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower.',
  },
  {
    topicId: 'duas',
    surahNumber: 25,
    surahNameEn: 'Al-Furqan',
    surahNameBn: 'সূরা আল-ফুরকান',
    ayahNumber: 74,
    ar: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَٰجِنَا وَذُرِّيَّـٰتِنَا قُرَّةَ أَعْيُنٍۢ وَٱجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    bn: 'হে আমাদের প্রতিপালক! আমাদের জীবনসঙ্গী ও সন্তানদের আমাদের জন্য চোখের শীতলতা বানিয়ে দিন এবং আমাদের মুত্তাকীদের নেতা বানিয়ে দিন।',
    en: 'Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous.',
  },
  {
    topicId: 'duas',
    surahNumber: 20,
    surahNameEn: 'Ta-Ha',
    surahNameBn: 'সূরা ত্বা-হা',
    ayahNumber: 114,
    ar: 'رَّبِّ زِدْنِى عِلْمًۭا',
    bn: 'হে আমার রব! আমার জ্ঞান বৃদ্ধি করে দিন।',
    en: 'My Lord, increase me in knowledge.',
  },
  {
    topicId: 'duas',
    surahNumber: 7,
    surahNameEn: 'Al-A’raf',
    surahNameBn: 'সূরা আল-আ’রাফ',
    ayahNumber: 23,
    ar: 'رَبَّنَا ظَلَمْنَآ أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ ٱلْخَـٰسِرِينَ',
    bn: 'হে আমাদের প্রতিপালক! আমরা নিজেদের প্রতি অন্যায় করেছি। যদি আপনি আমাদের ক্ষমা না করেন এবং দয়া না করেন, তবে নিশ্চয়ই আমরা ক্ষতিগ্রস্তদের অন্তর্ভুক্ত হয়ে যাব।',
    en: 'Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.',
  },

  // 2. Parents
  {
    topicId: 'parents',
    surahNumber: 17,
    surahNameEn: 'Al-Isra',
    surahNameBn: 'সূরা বনী ইসরাঈল',
    ayahNumber: 23,
    ar: '۞ وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوٓا۟ إِلَّآ إِيَّاهُ وَبِٱلْوَٰلِدَيْنِ إِحْسَـٰنًا ۚ إِمَّا يَبْلُغَنَّ عِندَكَ ٱلْكِبَرَ أَحَدُهُمَآ أَوْ كِلَاهُمَا فَلَا تَقُل لَّهُمَآ أُفٍّۢ وَلَا تَنْهَرْهُمَا وَقُل لَّهُمَا قَوْلًۭا كَرِيمًۭا',
    bn: 'তোমার রব নির্দেশ দিয়েছেন যে, তোমরা তাঁকে ছাড়া অন্য কারও ইবাদত করবে না এবং পিতা-মাতার সাথে সদ্ব্যবহার করবে। তাঁদের একজন বা উভয়ে যদি তোমার জীবদ্দশায় বার্ধক্যে উপনীত হন, তবে তাঁদের ‘উহ্’ পর্যন্ত বলবে না, তাঁদের ধমক দেবে না এবং তাঁদের সাথে সম্মানসূচক নম্র কথা বলবে।',
    en: 'And your Lord has decreed that you not worship except Him, and to parents, good treatment. Whether one or both of them reach old age with you, say not to them "uff," and do not repel them but speak to them a noble word.',
  },
  {
    topicId: 'parents',
    surahNumber: 17,
    surahNameEn: 'Al-Isra',
    surahNameBn: 'সূরা বনী ইসরাঈল',
    ayahNumber: 24,
    ar: 'وَٱخْفِضْ لَهُمَا جَنَاحَ ٱلذُّلِّ مِنَ ٱلرَّحْمَةِ وَقُل رَّبِّ ٱرْحَمْهُمَا كَمَا رَبَّيَانِى صَغِيرًۭا',
    bn: 'আর তাঁদের প্রতি ভালোবাসায় বিনয়ের ডানা অবনমিত করে দাও এবং বল: হে আমার রব! তাঁদের প্রতি দয়া করুন, যেমন তাঁরা শৈশবে আমাকে স্নেহভরে লালন-পালন করেছিলেন।',
    en: 'And lower to them the wing of humility out of mercy and say, "My Lord, have mercy upon them as they brought me up when I was small."',
  },
  {
    topicId: 'parents',
    surahNumber: 31,
    surahNameEn: 'Luqman',
    surahNameBn: 'সূরা লোকমান',
    ayahNumber: 14,
    ar: 'وَوَصَّيْنَا ٱلْإِنسَـٰنَ بِوَٰلِدَيْهِ حَمَلَتْهُ أُمُّهُۥ وَهْنًا عَلَىٰ وَهْنٍۢ وَفِصَـٰلُهُۥ فِى عَامَيْنِ أَنِ ٱشْكُرْ لِى وَلِوَٰلِدَيْكَ إِلَىَّ ٱلْمَصِيرُ',
    bn: 'আর আমি মানুষকে তার পিতা-মাতার প্রতি সদয় ব্যবহারের নির্দেশ দিয়েছি। তার মা কষ্টের পর কষ্ট সহ্য করে তাকে গর্ভে ধারণ করেছে এবং তার দুধ ছাড়ানো হয় দু’বছরে। সুতরাং আমার প্রতি ও তোমার পিতা-মাতার প্রতি কৃতজ্ঞ হও; আমারই নিকট প্রত্যাবর্তন।',
    en: 'And We have enjoined upon man care for his parents. His mother carried him, increasing in weakness upon weakness, and his weaning is in two years. Be grateful to Me and to your parents; to Me is the final destination.',
  },

  // 3. Salah
  {
    topicId: 'salah',
    surahNumber: 2,
    surahNameEn: 'Al-Baqarah',
    surahNameBn: 'সূরা আল-বাকারা',
    ayahNumber: 45,
    ar: 'وَٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى ٱلْخَـٰشِعِينَ',
    bn: 'আর তোমরা ধৈর্য ও সালাতের মাধ্যমে সাহায্য প্রার্থনা কর। নিশ্চয়ই এটি অত্যন্ত কঠিন কাজ, তবে বিনম্র খোদাভীরুদের জন্য নয়।',
    en: 'And seek help through patience and prayer, and indeed, it is difficult except for the humbly submissive to Allah.',
  },
  {
    topicId: 'salah',
    surahNumber: 29,
    surahNameEn: 'Al-’Ankabut',
    surahNameBn: 'সূরা আল-আনকাবুত',
    ayahNumber: 45,
    ar: 'إِنَّ ٱلصَّلَوٰةَ تَنْهَىٰ عَنِ ٱلْفَحْشَآءِ وَٱلْمُنكَرِ ۗ وَلَذِكْرُ ٱللَّهِ أَكْبَرُ',
    bn: 'নিশ্চয়ই সালাত মানুষকে অশ্লীল ও মন্দ কাজ থেকে বিরত রাখে। আর আল্লাহর স্মরণই তো সর্বশ্রেষ্ঠ।',
    en: 'Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater.',
  },
  {
    topicId: 'salah',
    surahNumber: 20,
    surahNameEn: 'Ta-Ha',
    surahNameBn: 'সূরা ত্বা-হা',
    ayahNumber: 14,
    ar: 'إِنَّنِىٓ أَنَا ٱللَّهُ لَآ إِلَـٰهَ إِلَّآ أَنَا۠ فَٱعْبُدْنِى وَأَقِمِ ٱلصَّلَوٰةَ لِذِكْرِىٓ',
    bn: 'নিশ্চয়ই আমিই আল্লাহ, আমি ব্যতীত সত্য কোনো উপাস্য নেই। অতএব আমারই ইবাদত কর এবং আমার স্মরণের উদ্দেশ্যে সালাত কায়েম কর।',
    en: 'Indeed, I am Allah. There is no deity except Me, so worship Me and establish prayer for My remembrance.',
  },

  // 4. Fasting & Ramadan
  {
    topicId: 'fasting',
    surahNumber: 2,
    surahNameEn: 'Al-Baqarah',
    surahNameBn: 'সূরা আল-বাকারা',
    ayahNumber: 183,
    ar: 'يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ كُتِبَ عَلَيْكُمُ ٱلصِّيَامُ كَمَا كُتِبَ عَلَى ٱلَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
    bn: 'হে মুমিনগণ! তোমাদের ওপর রোজা ফরজ করা হয়েছে, যেমনিভাবে তোমাদের পূর্ববর্তীদের ওপর ফরজ করা হয়েছিল; যাতে করে তোমরা তাকওয়া (আল্লাহভীতি) অর্জন করতে পার।',
    en: 'O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous.',
  },
  {
    topicId: 'fasting',
    surahNumber: 2,
    surahNameEn: 'Al-Baqarah',
    surahNameBn: 'সূরা আল-বাকারা',
    ayahNumber: 185,
    ar: 'شَهْرُ رَمَضَانَ ٱلَّذِىٓ أُنزِلَ فِيهِ ٱلْقُرْءَانُ هُدًۭى لِّلنَّاسِ وَبَيِّنَـٰتٍۢ مِّنَ ٱلْهُدَىٰ وَٱلْفُرْقَانِ ۚ فَمَن شَهِدَ مِنكُمُ ٱلشَّهْرَ فَلْيَصُمْهُ',
    bn: 'রমজান মাসই হলো সেই মাস, যাতে নাযিল করা হয়েছে কুরআন—যা মানবজাতির জন্য হেদায়েত এবং সৎপথের সুস্পষ্ট নিদর্শন ও সত্য-মিথ্যার পার্থক্যকারী। সুতরাং তোমাদের মধ্যে যে এ মাস পাবে, সে যেন রোজা রাখে।',
    en: 'The month of Ramadan in which was revealed the Quran, a guidance for the people and clear proofs of guidance and criterion. So whoever sights the month, let him fast it.',
  },

  // 5. Sabr & Tawakkul
  {
    topicId: 'sabr',
    surahNumber: 2,
    surahNameEn: 'Al-Baqarah',
    surahNameBn: 'সূরা আল-বাকারা',
    ayahNumber: 153,
    ar: 'يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّـٰبِرِينَ',
    bn: 'হে মুমিনগণ! তোমরা ধৈর্য ও সালাতের মাধ্যমে সাহায্য প্রার্থনা কর। নিশ্চয়ই আল্লাহ ধৈর্যশীলদের সাথে আছেন।',
    en: 'O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.',
  },
  {
    topicId: 'sabr',
    surahNumber: 65,
    surahNameEn: 'At-Talaq',
    surahNameBn: 'সূরা আত-ত্বালাক',
    ayahNumber: 3,
    ar: 'وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ ۚ إِنَّ ٱللَّهَ بَـٰلِغُ أَمْرِهِۦ',
    bn: 'এবং তিনি তাকে এমন উৎস থেকে রিজিক দান করবেন যা সে কল্পনাও করেনি। আর যে ব্যক্তি আল্লাহর ওপর তাওয়াক্কুল (ভরসা) করে, তার জন্য তিনিই যথেষ্ট। আল্লাহ তাঁর কাজ সম্পন্ন করবেনই।',
    en: 'And will provide for him from where he does not expect. And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose.',
  },
  {
    topicId: 'sabr',
    surahNumber: 94,
    surahNameEn: 'Ash-Sharh',
    surahNameBn: 'সূরা আল-ইনশিরাহ',
    ayahNumber: 6,
    ar: 'إِنَّ مَعَ ٱلْعُسْرِ يُسْرًۭا',
    bn: 'নিশ্চয়ই কষ্টের সাথেই তো স্বস্তি রয়েছে।',
    en: 'Indeed, with hardship will be ease.',
  },

  // 6. Jannah
  {
    topicId: 'jannah',
    surahNumber: 3,
    surahNameEn: 'Ali ‘Imran',
    surahNameBn: 'সূরা আলে-ইমরান',
    ayahNumber: 133,
    ar: '۞ وَسَارِعُوٓا۟ إِلَىٰ مَغْفِرَةٍۢ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا ٱلسَّمَـٰوَٰتُ وَٱلْأَرْضُ أُعِدَّتْ لِلْمُتَّقِينَ',
    bn: 'আর তোমরা তোমাদের রবের পক্ষ থেকে ক্ষমা এবং সেই জান্নাতের দিকে দ্রুত ধাবিত হও, যার প্রশস্ততা আসমান ও যমিনের মতো; যা মুত্তাকীদের জন্য প্রস্তুত রাখা হয়েছে।',
    en: 'And hasten to forgiveness from your Lord and a garden as wide as the heavens and earth, prepared for the righteous.',
  },
  {
    topicId: 'jannah',
    surahNumber: 2,
    surahNameEn: 'Al-Baqarah',
    surahNameBn: 'সূরা আল-বাকারা',
    ayahNumber: 25,
    ar: 'وَبَشِّرِ ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ أَنَّ لَهُمْ جَنَّـٰتٍۢ تَجْرِى مِن تَحْتِهَا ٱلْأَنْهَـٰرُ',
    bn: 'আর যারা ঈমান এনেছে এবং সৎকাজ করেছে, আপনি তাদের সুসংবাদ দিন যে তাদের জন্য রয়েছে এমন জান্নাত, যার পাদদেশে নদীসমূহ প্রবাহিত।',
    en: 'And give good tidings to those who believe and do righteous deeds that they will have gardens beneath which rivers flow.',
  },

  // 7. Tawbah & Forgiveness
  {
    topicId: 'tawbah',
    surahNumber: 39,
    surahNameEn: 'Az-Zumar',
    surahNameBn: 'সূরা আয-যুমার',
    ayahNumber: 53,
    ar: '۞ قُلْ يَـٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا ۚ إِنَّهُۥ هُوَ ٱلْغَفُورُ ٱلرَّحِيمُ',
    bn: 'বলুন: হে আমার বান্দাগণ, যারা নিজেদের ওপর অবিচার করেছ! তোমরা আল্লাহর রহমত থেকে নিরাশ হয়ো না। নিশ্চয়ই আল্লাহ সমস্ত পাপ ক্ষমা করে দেন। তিনি তো পরম ক্ষমাশীল, পরম দয়ালু।',
    en: 'Say, "O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful."',
  },
  {
    topicId: 'tawbah',
    surahNumber: 4,
    surahNameEn: 'An-Nisa',
    surahNameBn: 'সূরা আন-নিসা',
    ayahNumber: 110,
    ar: 'وَمَن يَعْمَلْ سُوٓءًا أَوْ يَظْلِمْ نَفْسَهُۥ ثُمَّ يَسْتَغْفِرِ ٱللَّهَ يَجِدِ ٱللَّهَ غَفُورًۭا رَّحِيمًۭا',
    bn: 'যে ব্যক্তি কোনো মন্দ কাজ করে কিংবা নিজের ওপর জুলুম করে, অতঃপর আল্লাহর কাছে ক্ষমা প্রার্থনা করে, সে আল্লাহকে অতি ক্ষমাশীল ও পরম দয়ালু হিসেবে পাবে।',
    en: 'And whoever does a wrong or wrongs himself but then seeks forgiveness of Allah will find Allah Forgiving and Merciful.',
  },

  // 8. Charity & Zakat
  {
    topicId: 'charity',
    surahNumber: 2,
    surahNameEn: 'Al-Baqarah',
    surahNameBn: 'সূরা আল-বাকারা',
    ayahNumber: 261,
    ar: 'مَّثَلُ ٱلَّذِينَ يُنفِقُونَ أَمْوَٰلَهُمْ فِى سَبِيلِ ٱللَّهِ كَمَثَلِ حَبَّةٍ أَنۢبَتَتْ سَبْعَ سَنَابِلَ فِى كُلِّ سُنۢبُلَةٍۢ مِّا۟ئَةُ حَبَّةٍۢ ۗ وَٱللَّهُ يُضَـٰعِفُ لِمَن يَشَآءُ',
    bn: 'যারা আল্লাহর রাস্তায় নিজেদের ধন-সম্পদ ব্যয় করে, তাদের দৃষ্টান্ত একটি বীজের মতো, যা থেকে সাতটি শীষ জন্মায় এবং প্রতিটি শীষে থাকে একশত দানা। আল্লাহ যাকে ইচ্ছা বহুগুণ বৃদ্ধি করে দেন।',
    en: 'The example of those who spend their wealth in the way of Allah is like a seed of grain which grows seven spikes; in each spike is a hundred grains. And Allah multiplies for whom He wills.',
  },
  {
    topicId: 'charity',
    surahNumber: 2,
    surahNameEn: 'Al-Baqarah',
    surahNameBn: 'সূরা আল-বাকারা',
    ayahNumber: 274,
    ar: 'ٱلَّذِينَ يُنفِقُونَ أَمْوَٰلَهُم بِٱلَّيْلِ وَٱلنَّهَارِ سِرًّۭا وَعَلَانِيَةًۭ فَلَهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ وَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ',
    bn: 'যারা নিজেদের ধন-সম্পদ রাতে ও দিনে, গোপনে ও প্রকাশ্যে ব্যয় করে, তাদের প্রতিদান তাদের রবের নিকট রয়েছে। তাদের কোনো ভয় থাকবে না এবং তারা দুঃখিতও হবে না।',
    en: 'Those who spend their wealth by night and by day, secretly and publicly, will have their reward with their Lord. And no fear will there be concerning them, nor will they grieve.',
  },

  // 9. Ethics & Good Character
  {
    topicId: 'character',
    surahNumber: 49,
    surahNameEn: 'Al-Hujurat',
    surahNameBn: 'সূরা আল-হুজুরাত',
    ayahNumber: 10,
    ar: 'إِنَّمَا ٱلْمُؤْمِنُونَ إِخْوَةٌۭ فَأَصْلِحُوا۟ بَيْنَ أَخَوَيْكُمْ ۚ وَٱتَّقُوا۟ ٱللَّهَ لَعَلَّكُمْ تُرْحَمُونَ',
    bn: 'মুমিনরা তো পরস্পর ভাই ভাই। সুতরাং তোমরা তোমাদের দুই ভাইয়ের মাঝে মীমাংসা করে দাও এবং আল্লাহকে ভয় কর, যাতে তোমরা অনুগ্রহপ্রাপ্ত হতে পার।',
    en: 'The believers are but brothers, so make settlement between your brothers. And fear Allah that you may receive mercy.',
  },
  {
    topicId: 'character',
    surahNumber: 41,
    surahNameEn: 'Fussilat',
    surahNameBn: 'সূরা ফুসসিলাত',
    ayahNumber: 34,
    ar: 'وَلَا تَسْتَوِى ٱلْحَسَنَةُ وَلَا ٱلسَّيِّئَةُ ۚ ٱدْفَعْ بِٱلَّتِى هِىَ أَحْسَنُ فَإِذَا ٱلَّذِى بَيْنَكَ وَبَيْنَهُۥ عَدَٰوَةٌۭ كَأَنَّهُۥ وَلِىٌّ حَمِيمٌۭ',
    bn: 'ভালো ও মন্দ কখনো সমান হতে পারে না। মন্দকে প্রতিহত কর সর্বোত্তম উপায়ে; ফলে তোমার সাথে যার শত্রুতা ছিল, সে তখন অন্তরঙ্গ বন্ধুর মতো হয়ে যাবে।',
    en: 'And not equal are the good deed and the bad. Repel [evil] by that [deed] which is better; and thereupon the one whom between you and him was enmity will become as though he was a devoted friend.',
  },

  // 10. Virtuous & Famous Ayahs
  {
    topicId: 'virtuous',
    surahNumber: 2,
    surahNameEn: 'Al-Baqarah',
    surahNameBn: 'সূরা আল-বাকারা',
    ayahNumber: 255,
    ar: 'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌۭ وَلَا نَوْمٌۭ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍۢ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ',
    bn: 'আল্লাহ, তিনি ছাড়া কোনো সত্য উপাস্য নেই, তিনি চিরঞ্জীব, সর্বসত্তার ধারক। তন্দ্রা বা নিদ্রা তাঁকে স্পর্শ করে না। আসমান ও যমীনে যা কিছু রয়েছে সবই তাঁর। কে আছে যে তাঁর অনুমতি ছাড়া তাঁর নিকট সুপারিশ করবে? তাদের সামনে ও পেছনে যা কিছু আছে তা তিনি জানেন। আর তাঁর ইচ্ছানুযায়ী জ্ঞান ছাড়া অন্য কোনো কিছুই তারা আয়ত্ত করতে পারে না। তাঁর কুরসী সমস্ত আকাশমন্ডলী ও পৃথিবীকে পরিবেষ্টিত করে রেখেছে। আর এ দুটির রক্ষণাবেক্ষণ তাঁকে বিন্দুমাত্র ক্লান্ত করে না। তিনি সুউচ্চ, সর্বশ্রেষ্ঠ। (আয়াতুল কুরসী)',
    en: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
  },
  {
    topicId: 'virtuous',
    surahNumber: 59,
    surahNameEn: 'Al-Hashr',
    surahNameBn: 'সূরা আল-হাশর',
    ayahNumber: 22,
    ar: 'هُوَ ٱللَّهُ ٱلَّذِى لَآ إِلَـٰهَ إِلَّا هُوَ ۖ عَـٰلِمُ ٱلْغَيْبِ وَٱلشَّهَـٰدَةِ ۖ هُوَ ٱلرَّحْمَـٰنُ ٱلرَّحِيمُ',
    bn: 'তিনিই আল্লাহ, যিনি ছাড়া কোনো সত্য ইলাহ নেই; তিনি অদৃশ্য ও দৃশ্যের পরিজ্ঞাতা, তিনি পরম করুণাময়, অতি দয়ালু।',
    en: 'He is Allah, other than whom there is no deity, Knower of the unseen and the witnessed. He is the Entirely Merciful, the Especially Merciful.',
  },
  {
    topicId: 'virtuous',
    surahNumber: 112,
    surahNameEn: 'Al-Ikhlas',
    surahNameBn: 'সূরা আল-ইখলাস',
    ayahNumber: 1,
    ar: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
    bn: 'বলুন: তিনিই আল্লাহ, এক-অদ্বিতীয়।',
    en: 'Say, "He is Allah, [who is] One."',
  },
];
