import React, { useEffect, useMemo, useState } from 'react';
import {
  MAKHARIJ_17,
  MAKHARIJ_AREAS,
  SIFAT_LIST,
  SifatId,
  TAJWEED_RULES,
  TEACH_LANG_LABELS,
  TeachLang,
  resolveLetterMeta,
} from '../data/tajweedData';
import { TajweedWord } from '../utils/tajweedParser';

interface TajweedInspectorSheetProps {
  word: TajweedWord;
  ayahNumber: number;
  surahName: string;
  theme: 'light' | 'dark';
  teachLang: TeachLang;
  showEnSubtitle: boolean;
  onChangeTeachLang: (lang: TeachLang) => void;
  onToggleEnSubtitle: () => void;
  onPlayAyah: () => void;
  onOpenFullGuide: () => void;
  onClose: () => void;
}

const UI_TXT: Record<
  TeachLang,
  {
    title: string;
    tapLetterHint: string;
    tajweedRule: string;
    makhrajTitle: string;
    sifatTitle: string;
    howToPronounce: string;
    listenAyah: string;
    openGuide: string;
    close: string;
    enSubToggle: string;
    harakatLabel: string;
  }
> = {
  en: {
    title: 'Tajweed, Makhraj & Sifat Inspector',
    tapLetterHint: 'Tap any letter below to inspect its Makhraj & Sifat',
    tajweedRule: 'Active Tajweed Rule',
    makhrajTitle: 'Makhraj (Articulation Point)',
    sifatTitle: 'Sifat (Letter Characteristics)',
    howToPronounce: 'How to Pronounce',
    listenAyah: 'Listen Ayah',
    openGuide: 'Full Qaida Guide',
    close: 'Close',
    enSubToggle: 'English Subtitle',
    harakatLabel: 'Duration / Type',
  },
  bn: {
    title: 'তাজবীদ, মাখরাজ ও সিফাত টিচার প্যানেল',
    tapLetterHint: 'নিচের যেকোনো হরফে ট্যাপ করে তার মাখরাজ ও সিফাত দেখুন',
    tajweedRule: 'কার্যকর তাজবীদ নিয়ম',
    makhrajTitle: 'মাখরাজ (উচ্চারণস্থল)',
    sifatTitle: 'সিফাত (হরফের গুণাবলি)',
    howToPronounce: 'উচ্চারণ পদ্ধতি',
    listenAyah: 'আয়াত শুনুন',
    openGuide: 'সম্পূর্ণ কায়েদা গাইড',
    close: 'বন্ধ',
    enSubToggle: 'English সাবটাইটেল',
    harakatLabel: 'পরিমাণ / ধরন',
  },
  ar: {
    title: 'مُعلّم التجويد والمخارج والصفات',
    tapLetterHint: 'اضغط على أي حرف لعرض مخرجه وصفاته بالتفصيل',
    tajweedRule: 'حكم التجويد المطبّق',
    makhrajTitle: 'المخرج الدقيق للحرف',
    sifatTitle: 'صفات الحرف اللازمة والعارضة',
    howToPronounce: 'كيفية النطق الصحيح',
    listenAyah: 'استمع للآية',
    openGuide: 'دليل التجويد الكامل',
    close: 'إغلاق',
    enSubToggle: 'ترجمة إنجليزية للطلاب',
    harakatLabel: 'الزمن / المقدار',
  },
  ur: {
    title: 'تجوید، مخارج اور صفات انسپکٹر',
    tapLetterHint: 'نیچے کسی بھی حرف پر ٹیپ کر کے اس کا مخرج اور صفات دیکھیں',
    tajweedRule: 'تجوید کا قاعدہ',
    makhrajTitle: 'مخرج (ادائیگی کی جگہ)',
    sifatTitle: 'صفاتِ حروف',
    howToPronounce: 'ادائیگی کا طریقہ',
    listenAyah: 'آیت سنیں',
    openGuide: 'مکمل تجوید گائیڈ',
    close: 'بند کریں',
    enSubToggle: 'انگریزی سب ٹائٹل',
    harakatLabel: 'مقدار / نوعیت',
  },
};

export const TajweedInspectorSheet: React.FC<TajweedInspectorSheetProps> = ({
  word,
  ayahNumber,
  surahName,
  theme,
  teachLang,
  showEnSubtitle,
  onChangeTeachLang,
  onToggleEnSubtitle,
  onPlayAyah,
  onOpenFullGuide,
  onClose,
}) => {
  const letters = useMemo(
    () => word.clusters.filter((c) => /[\u0621-\u064A\u0671]/.test(c.base)),
    [word.clusters]
  );

  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [selectedSifat, setSelectedSifat] = useState<SifatId | null>(null);

  useEffect(() => {
    const ruledIdx = letters.findIndex((c) => Boolean(c.rule));
    setSelectedIdx(ruledIdx >= 0 ? ruledIdx : 0);
    setSelectedSifat(null);
  }, [letters, word.rawWord]);

  const activeCluster = letters[selectedIdx] || letters[0] || word.clusters[0];
  const ruleMeta = activeCluster?.rule ? TAJWEED_RULES[activeCluster.rule] : null;
  const letterMeta = activeCluster ? resolveLetterMeta(activeCluster.base) : null;
  const makhraj = letterMeta
    ? MAKHARIJ_17.find((m) => m.id === letterMeta.makhrajId) || MAKHARIJ_17[0]
    : null;
  const area = makhraj ? MAKHARIJ_AREAS[makhraj.area] : null;
  const ui = UI_TXT[teachLang];
  const showDualEn = showEnSubtitle && teachLang !== 'en';
  const activeSifatMeta = selectedSifat
    ? SIFAT_LIST[selectedSifat]
    : letterMeta?.sifatIds[0]
    ? SIFAT_LIST[letterMeta.sifatIds[0]]
    : null;

  return (
    <div
      id="sh"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet tj-sheet">
        <div className="top" style={{ gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: 16.5, margin: 0 }}>{ui.title}</h2>
            <div className="mut sm" style={{ margin: '2px 0 0' }}>
              {surahName} · Ayah {ayahNumber}
            </div>
          </div>
          <button className="chip" onClick={onClose}>
            {ui.close}
          </button>
        </div>

        {/* 4-Language Switcher + English Student Subtitle Toggle */}
        <div className="rw" style={{ marginTop: 10 }}>
          {(['en', 'bn', 'ar', 'ur'] as TeachLang[]).map((lng) => (
            <button
              key={lng}
              className="chip"
              style={{ minHeight: 34, padding: '0 11px', fontSize: 12 }}
              aria-pressed={teachLang === lng}
              onClick={() => onChangeTeachLang(lng)}
            >
              {TEACH_LANG_LABELS[lng]}
            </button>
          ))}
          {teachLang !== 'en' && (
            <button
              className="chip"
              style={{ minHeight: 34, padding: '0 11px', fontSize: 12 }}
              aria-pressed={showEnSubtitle}
              onClick={onToggleEnSubtitle}
            >
              {showEnSubtitle ? '✓ ' : ''}
              {ui.enSubToggle}
            </button>
          )}
        </div>

        {/* Word Interactive Letter Ribbon (RTL) */}
        <div className="card tj-word-stage" style={{ marginTop: 10 }}>
          <div className="ar tj-word-big" lang="ar" dir="rtl">
            {word.rawWord}
          </div>
          <p className="mut sm" style={{ textAlign: 'center', margin: '4px 0 10px' }}>
            {ui.tapLetterHint}
          </p>
          <div className="tj-letter-strip" dir="rtl">
            {letters.map((cl, idx) => {
              const r = cl.rule ? TAJWEED_RULES[cl.rule] : null;
              const col = r
                ? theme === 'dark'
                  ? r.colorDark
                  : r.colorLight
                : undefined;
              const isSel = idx === selectedIdx;
              return (
                <button
                  key={`${cl.raw}-${idx}`}
                  type="button"
                  className={`tj-tile${isSel ? ' on' : ''}`}
                  style={
                    col
                      ? {
                          borderColor: col,
                          color: isSel ? '#fff' : col,
                          background: isSel
                            ? col
                            : theme === 'dark'
                            ? r?.bgDark
                            : r?.bgLight,
                        }
                      : undefined
                  }
                  onClick={() => {
                    setSelectedIdx(idx);
                    setSelectedSifat(null);
                  }}
                >
                  <span className="ar" lang="ar">
                    {cl.raw}
                  </span>
                  {r && <i style={{ background: col }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Tajweed Rule Card (if cluster has a Tajweed rule) */}
        {ruleMeta && (
          <div
            className="card tj-rule-box"
            style={{
              borderLeft: `4px solid ${
                theme === 'dark' ? ruleMeta.colorDark : ruleMeta.colorLight
              }`,
            }}
          >
            <div className="top" style={{ marginBottom: 6 }}>
              <span
                className="tj-badge"
                style={{
                  background: theme === 'dark' ? ruleMeta.bgDark : ruleMeta.bgLight,
                  color: theme === 'dark' ? ruleMeta.colorDark : ruleMeta.colorLight,
                }}
              >
                {ui.tajweedRule}
              </span>
              <span className="mut" style={{ fontSize: 11.5, fontWeight: 700 }}>
                {ui.harakatLabel}: {ruleMeta.harakat}
              </span>
            </div>

            <b style={{ fontSize: 15.5, display: 'block' }}>{ruleMeta.name[teachLang]}</b>
            {showDualEn && (
              <div className="tj-en-sub">{ruleMeta.name.en}</div>
            )}

            <p style={{ margin: '6px 0 4px', fontSize: 13.5, lineHeight: 1.55 }}>
              {ruleMeta.shortDesc[teachLang]}
            </p>
            {showDualEn && (
              <p className="tj-en-p">{ruleMeta.shortDesc.en}</p>
            )}

            <div className="tj-howto">
              <b>{ui.howToPronounce}:</b> {ruleMeta.howTo[teachLang]}
              {showDualEn && <div className="tj-en-p">{ruleMeta.howTo.en}</div>}
            </div>
          </div>
        )}

        {/* Exact Makhraj Card */}
        {letterMeta && makhraj && area && (
          <div className="card">
            <div className="tj-makhraj-head">
              <div className="tj-letter-hero ar" lang="ar">
                {activeCluster.raw}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="tj-badge" style={{ background: `${area.color}20`, color: area.color }}>
                  {area.name[teachLang]}
                </span>
                <b style={{ display: 'block', fontSize: 15.5, marginTop: 4 }}>
                  {letterMeta.name[teachLang]}
                </b>
                {showDualEn && (
                  <div className="tj-en-sub">
                    {letterMeta.name.en} · {area.name.en}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div className="mut sm" style={{ margin: '0 0 2px', fontWeight: 700 }}>
                {ui.makhrajTitle}
              </div>
              <b style={{ fontSize: 14, display: 'block' }}>{makhraj.name[teachLang]}</b>
              {showDualEn && <div className="tj-en-sub">{makhraj.name.en}</div>}
              <p style={{ margin: '4px 0', fontSize: 13.5, lineHeight: 1.55 }}>
                {makhraj.detail[teachLang]}
              </p>
              {showDualEn && <p className="tj-en-p">{makhraj.detail.en}</p>}
            </div>

            <div className="tj-howto" style={{ marginTop: 8 }}>
              <b>{ui.howToPronounce}:</b> {letterMeta.tip[teachLang]}
              {showDualEn && <div className="tj-en-p">{letterMeta.tip.en}</div>}
            </div>
          </div>
        )}

        {/* Sifat (Attributes) Interactive Cards */}
        {letterMeta && (
          <div className="card">
            <div className="mut sm" style={{ margin: '0 0 8px', fontWeight: 700 }}>
              {ui.sifatTitle}
            </div>
            <div className="rw" style={{ marginTop: 0 }}>
              {letterMeta.sifatIds.map((sid) => {
                const sm = SIFAT_LIST[sid];
                const active = activeSifatMeta?.id === sid;
                return (
                  <button
                    key={sid}
                    type="button"
                    className="chip"
                    style={{ minHeight: 34, padding: '0 11px', fontSize: 12 }}
                    aria-pressed={active}
                    onClick={() => setSelectedSifat(sid)}
                  >
                    {sm.name[teachLang]}
                  </button>
                );
              })}
            </div>

            {activeSifatMeta && (
              <div className="tj-howto" style={{ marginTop: 10 }}>
                <div className="top">
                  <b>{activeSifatMeta.name[teachLang]}</b>
                  <span className="ar" style={{ fontSize: 14, color: 'var(--pri)' }}>
                    {activeSifatMeta.lettersLabel}
                  </span>
                </div>
                {showDualEn && <div className="tj-en-sub">{activeSifatMeta.name.en}</div>}
                <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.5 }}>
                  {activeSifatMeta.detail[teachLang]}
                </p>
                {showDualEn && <p className="tj-en-p">{activeSifatMeta.detail.en}</p>}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="rw" style={{ marginTop: 4, paddingBottom: 8 }}>
          <button className="chip on" onClick={onPlayAyah}>
            ▶ {ui.listenAyah} {ayahNumber}
          </button>
          <button className="chip" onClick={onOpenFullGuide}>
            🎓 {ui.openGuide}
          </button>
        </div>
      </div>
    </div>
  );
};
