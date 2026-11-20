import { TajweedRuleId } from '../data/tajweedData';

export interface TajweedCluster {
  raw: string;
  base: string;
  marks: string;
  rule?: TajweedRuleId;
  reasonKey?: string;
}

export interface TajweedWord {
  wordIndex: number;
  rawWord: string;
  clusters: TajweedCluster[];
  rulesPresent: TajweedRuleId[];
}

const HARAKAH_OR_MARK_RE = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/;
const VOWEL_RE = /[\u064B-\u0650\u0670]/;
const TANWEEN_RE = /[\u064B\u064C\u064D\u08F0-\u08F2]/;
const SUKUN_RE = /[\u0652\u06E1]/;
const SHADDAH = '\u0651';
const MADDAH = '\u0653';
const DAGGER_ALIF = '\u0670';
const SMALL_MEEM_HI = '\u06E2';
const SMALL_MEEM_LO = '\u06ED';
const ROUNDED_ZERO = '\u06DF';
const SMALL_WAW_YA = /[\u06E5\u06E6]/;

const QALQALAH_SET = new Set(['ق', 'ط', 'ب', 'ج', 'د']);
const IKHFA_SET = new Set([
  'ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك',
]);
const IDGHAM_GHUNNAH_SET = new Set(['ي', 'ن', 'م', 'و']);
const IDGHAM_NO_GHUNNAH_SET = new Set(['ل', 'ر']);
const ISTILA_SET = new Set(['خ', 'ص', 'ض', 'غ', 'ط', 'ق', 'ظ']);
const FATHA = '\u064E';
const DAMMAH = '\u064F';
const KASRAH = '\u0650';

const WAQF_ONLY_RE = /^[\u06D6-\u06DC\u06DE\u06E9\s]+$/;

interface RawWordInfo {
  wordIndex: number;
  rawWord: string;
  clusters: TajweedCluster[];
}

function splitWordToClusters(word: string): TajweedCluster[] {
  const clusters: TajweedCluster[] = [];
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    if (HARAKAH_OR_MARK_RE.test(ch) && clusters.length > 0) {
      clusters[clusters.length - 1].raw += ch;
      clusters[clusters.length - 1].marks += ch;
    } else {
      clusters.push({ raw: ch, base: ch, marks: '' });
    }
  }
  return clusters;
}

function isIgnorableBase(base: string): boolean {
  return (
    base === 'ٱ' ||
    base === 'ـ' ||
    WAQF_ONLY_RE.test(base) ||
    /[\u06D6-\u06DF\u06E9]/.test(base)
  );
}

function normalizeWordSimple(w: string): string {
  return w
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا');
}

const SAME_WORD_IZHAR_MUTLAQ = new Set(['دنيا', 'الدنيا', 'قنوان', 'صنوان', 'بنيان', 'بنين']);

export function parseAyahTajweed(arabicText: string): TajweedWord[] {
  const rawWords = arabicText.trim().split(/\s+/).filter(Boolean);
  const wordInfos: RawWordInfo[] = rawWords.map((rawWord, idx) => ({
    wordIndex: idx,
    rawWord,
    clusters: splitWordToClusters(rawWord),
  }));

  // Helper to get next pronounced consonant cluster across word boundaries
  const findNextPronounced = (
    wIdx: number,
    cIdx: number
  ): { wIdx: number; cIdx: number; cluster: TajweedCluster } | null => {
    let wi = wIdx;
    let ci = cIdx + 1;
    while (wi < wordInfos.length) {
      const cls = wordInfos[wi].clusters;
      while (ci < cls.length) {
        const cl = cls[ci];
        if (!isIgnorableBase(cl.base)) {
          return { wIdx: wi, cIdx: ci, cluster: cl };
        }
        ci++;
      }
      wi++;
      ci = 0;
    }
    return null;
  };

  // Detect word Allah variations
  const allahWordIndices = new Set<number>();
  for (let w = 0; w < wordInfos.length; w++) {
    const simple = normalizeWordSimple(wordInfos[w].rawWord);
    if (
      simple === 'الله' ||
      simple === 'لله' ||
      simple === 'بالله' ||
      simple === 'تالله' ||
      simple === 'والله' ||
      simple === 'فلله' ||
      simple === 'ولله' ||
      simple === 'اللهم'
    ) {
      allahWordIndices.add(w);
    }
  }

  // Pass 1: Evaluate rules per cluster
  for (let w = 0; w < wordInfos.length; w++) {
    const clusters = wordInfos[w].clusters;
    const isAllah = allahWordIndices.has(w);
    const simpleWord = normalizeWordSimple(wordInfos[w].rawWord);
    const isEndOfAyah = w === wordInfos.length - 1;

    // Find last letter cluster index in final word for Waqf Qalqalah check
    let lastLetterIdx = -1;
    for (let k = clusters.length - 1; k >= 0; k--) {
      if (/[\u0621-\u064A]/.test(clusters[k].base)) {
        lastLetterIdx = k;
        break;
      }
    }

    for (let c = 0; c < clusters.length; c++) {
      const cl = clusters[c];
      const base = cl.base;
      const marks = cl.marks;
      const prev = c > 0 ? clusters[c - 1] : null;
      const nextSameWord = c + 1 < clusters.length ? clusters[c + 1] : null;

      // 1. Silent letters: Rounded Zero ۟ or Hamzatul Wasl ٱ mid-ayah
      if (marks.includes(ROUNDED_ZERO)) {
        cl.rule = 'silent';
        continue;
      }
      if (base === 'ٱ' && !(w === 0 && c === 0)) {
        cl.rule = 'silent';
        continue;
      }

      // 2. Allah word Lam (لّ)
      if (isAllah && base === 'ل' && marks.includes(SHADDAH)) {
        cl.rule = 'lam_allah';
        continue;
      }

      // 3. Wajib / Jaiz / Lazim Madd (Explicit Maddah ٓ)
      if (marks.includes(MADDAH) || nextSameWord?.marks.includes(MADDAH)) {
        if (marks.includes(MADDAH)) {
          cl.rule = 'madd_wajib';
          continue;
        }
      }

      // 4. Wajib Ghunnah (نّ / مّ with Shaddah, unless already part of Idgham target)
      if ((base === 'ن' || base === 'م') && marks.includes(SHADDAH)) {
        cl.rule = 'ghunnah';
        continue;
      }

      // 5. Explicit Iqlab small Meem mark (ۢ / ۭ)
      if (marks.includes(SMALL_MEEM_HI) || marks.includes(SMALL_MEEM_LO)) {
        cl.rule = 'iqlab';
        continue;
      }

      // 6. Nun Sakinah or Tanween rules
      const hasTanween = TANWEEN_RE.test(marks);
      const isBareOrSukunNun =
        base === 'ن' &&
        !marks.includes(SHADDAH) &&
        (SUKUN_RE.test(marks) || (!VOWEL_RE.test(marks) && !TANWEEN_RE.test(marks)));

      if (hasTanween || isBareOrSukunNun) {
        const nxt = findNextPronounced(w, c);
        if (nxt) {
          const nb = nxt.cluster.base;
          const sameWord = nxt.wIdx === w;
          if (nb === 'ب') {
            cl.rule = 'iqlab';
            continue;
          }
          if (IDGHAM_GHUNNAH_SET.has(nb)) {
            if (!sameWord || !SAME_WORD_IZHAR_MUTLAQ.has(simpleWord)) {
              cl.rule = 'idgham_ghunnah';
              continue;
            }
          }
          if (IDGHAM_NO_GHUNNAH_SET.has(nb)) {
            if (!sameWord) {
              cl.rule = 'idgham_no_ghunnah';
              continue;
            }
          }
          if (IKHFA_SET.has(nb)) {
            cl.rule = 'ikhfa';
            continue;
          }
        }
      }

      // 7. Meem Sakinah rules (bare م or مْ followed by ب or م)
      const isMeemSakinah =
        base === 'م' &&
        !marks.includes(SHADDAH) &&
        (SUKUN_RE.test(marks) || (!VOWEL_RE.test(marks) && !TANWEEN_RE.test(marks)));

      if (isMeemSakinah) {
        const nxt = findNextPronounced(w, c);
        if (nxt) {
          if (nxt.cluster.base === 'ب') {
            cl.rule = 'ikhfa';
            continue;
          }
          if (nxt.cluster.base === 'م') {
            cl.rule = 'idgham_ghunnah';
            continue;
          }
        }
      }

      // 8. Qalqalah (ق ط ب ج د with Sukun OR at end of Ayah waqf)
      if (QALQALAH_SET.has(base)) {
        const hasSukun = SUKUN_RE.test(marks);
        const atAyahStop = isEndOfAyah && c === lastLetterIdx;
        if (hasSukun || atAyahStop) {
          cl.rule = 'qalqalah';
          continue;
        }
      }

      // 9. Madd Asli / Silah / Dagger Alif
      if (marks.includes(DAGGER_ALIF) || SMALL_WAW_YA.test(marks)) {
        cl.rule = 'madd_asli';
        continue;
      }
      // Natural Alif/Waw/Ya Madd (unvoweled ا/ى after Fatha, و after Dammah, ي after Kasrah)
      if (
        !VOWEL_RE.test(marks) &&
        !marks.includes(SHADDAH) &&
        !SUKUN_RE.test(marks)
      ) {
        if ((base === 'ا' || base === 'ى') && prev?.marks.includes(FATHA)) {
          // Ensure not followed immediately by Shaddah/Sukun or Hamzatul Wasl
          const nxt = findNextPronounced(w, c);
          const sameWordHamza = nxt && nxt.wIdx === w && (nxt.cluster.base === 'ء' || nxt.cluster.base === 'ئ' || nxt.cluster.base === 'أ');
          cl.rule = sameWordHamza ? 'madd_wajib' : 'madd_asli';
          continue;
        }
        if (base === 'و' && prev?.marks.includes(DAMMAH)) {
          cl.rule = 'madd_asli';
          continue;
        }
        if (base === 'ي' && prev?.marks.includes(KASRAH)) {
          cl.rule = 'madd_asli';
          continue;
        }
      }

      // 10. Tafkheem (7 Isti'la letters & heavy Raa)
      if (ISTILA_SET.has(base)) {
        cl.rule = 'tafkheem';
        continue;
      }
      if (base === 'ر') {
        const isHeavyRaa =
          marks.includes(FATHA) ||
          marks.includes(DAMMAH) ||
          marks.includes('\u064B') ||
          marks.includes('\u064C') ||
          (SUKUN_RE.test(marks) && (prev?.marks.includes(FATHA) || prev?.marks.includes(DAMMAH)));
        if (isHeavyRaa) {
          cl.rule = 'tafkheem';
          continue;
        }
      }
    }
  }

  return wordInfos.map((wi) => {
    const set = new Set<TajweedRuleId>();
    wi.clusters.forEach((cl) => {
      if (cl.rule) set.add(cl.rule);
    });
    return {
      wordIndex: wi.wordIndex,
      rawWord: wi.rawWord,
      clusters: wi.clusters,
      rulesPresent: Array.from(set),
    };
  });
}
