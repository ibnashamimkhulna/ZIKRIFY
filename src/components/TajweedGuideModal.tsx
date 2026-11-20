import React, { useState } from 'react';
import {
  ARABIC_LETTERS,
  MAKHARIJ_17,
  MAKHARIJ_AREAS,
  MakhrajAreaId,
  QAIDA_CURRICULUM,
  SIFAT_LIST,
  SifatId,
  TAJWEED_RULES,
  TEACH_LANG_LABELS,
  TeachLang,
  resolveLetterMeta,
} from '../data/tajweedData';

interface TajweedGuideModalProps {
  theme: 'light' | 'dark';
  teachLang: TeachLang;
  showEnSubtitle: boolean;
  onChangeTeachLang: (lang: TeachLang) => void;
  onToggleEnSubtitle: () => void;
  onClose: () => void;
}

type GuideTab = 'qaida' | 'makhraj' | 'sifat' | 'colors';

const GUIDE_TEXT: Record<
  TeachLang,
  {
    header: string;
    sub: string;
    tabs: Record<GuideTab, string>;
    close: string;
    enSub: string;
    oppositePairs: string;
    specialSifat: string;
    letterExplorer: string;
    tapLetterDesc: string;
    heavyBadge: string;
    lightBadge: string;
    examplesLabel: string;
  }
> = {
  en: {
    header: 'Tajweed, Makhraj & Sifat Academy',
    sub: 'Complete rules & articulation points in Arabic, English, Bengali & Urdu',
    tabs: {
      qaida: 'Qaida & Rules',
      makhraj: '17 Makharij',
      sifat: 'Sifat & Letters',
      colors: 'Color Guide',
    },
    close: 'Close',
    enSub: 'English Subtitle',
    oppositePairs: 'Permanent Opposite Sifat Pairs',
    specialSifat: 'Special Non-Opposite Sifat',
    letterExplorer: '29 Arabic Letters Makhraj & Sifat Explorer',
    tapLetterDesc: 'Tap any letter below to teach its Makhraj, Sifat & articulation tip',
    heavyBadge: 'Heavy (Tafkheem)',
    lightBadge: 'Light (Tarqeeq)',
    examplesLabel: 'Quranic Examples',
  },
  bn: {
    header: 'সম্পূর্ণ তাজবীদ, কায়েদা, মাখরাজ ও সিফাত',
    sub: 'আরবি, ইংরেজি, বাংলা ও উর্দু ভাষায় কুরআন শিক্ষার পূর্ণাঙ্গ গাইড',
    tabs: {
      qaida: 'কায়েদা ও নিয়ম',
      makhraj: '১৭ মাখরাজ',
      sifat: 'সিফাত ও হরফ',
      colors: 'কালার গাইড',
    },
    close: 'বন্ধ',
    enSub: 'English সাবটাইটেল',
    oppositePairs: 'স্থায়ী বিপরীতমুখী সিফাত (জোড়া)',
    specialSifat: 'বিশেষ সিফাত (গাইরে মুতাযাদ্দাহ)',
    letterExplorer: 'আরবি ২৯ হরফের মাখরাজ ও সিফাত চার্ট',
    tapLetterDesc: 'যেকোনো হরফে ট্যাপ করে তার মাখরাজ, সিফাত ও উচ্চারণ পদ্ধতি দেখুন',
    heavyBadge: 'মোটা (তাফখীম)',
    lightBadge: 'পাতলা (তারকীক)',
    examplesLabel: 'কুরআনের উদাহরণ',
  },
  ar: {
    header: 'موسوعة التجويد والمخارج والصفات',
    sub: 'جميع أحكام القراءة باللغات الأربع لتعليم الطلاب',
    tabs: {
      qaida: 'القواعد والأحكام',
      makhraj: 'المخارج ١٧',
      sifat: 'الصفات والحروف',
      colors: 'دليل الألوان',
    },
    close: 'إغلاق',
    enSub: 'ترجمة إنجليزية للطلاب',
    oppositePairs: 'الصفات اللازمة المتضادة',
    specialSifat: 'الصفات التي لا ضد لها',
    letterExplorer: 'مخارج وصفات الحروف الهجائية (٢٩ حرفاً)',
    tapLetterDesc: 'اضغط على أي حرف لعرض مخرجه وصفاته وطريقة تعليمه',
    heavyBadge: 'مفخّم',
    lightBadge: 'مرقّق',
    examplesLabel: 'أمثلة قرآنية',
  },
  ur: {
    header: 'مکمل تجوید، قواعد، مخارج اور صفات',
    sub: 'عربی، انگریزی، بنگالی اور اردو میں قرآن سکھانے کی مکمل گائیڈ',
    tabs: {
      qaida: 'قواعد و احکام',
      makhraj: '۱۷ مخارج',
      sifat: 'صفات و حروف',
      colors: 'رنگوں کی پہچان',
    },
    close: 'بند کریں',
    enSub: 'انگریزی سب ٹائٹل',
    oppositePairs: 'متضاد صفاتِ لازمہ',
    specialSifat: 'غیر متضاد خاص صفات',
    letterExplorer: '۲۹ عربی حروف کے مخارج اور صفات',
    tapLetterDesc: 'کسی بھی حرف پر ٹیپ کر کے اس کا مخرج اور صفات دیکھیں',
    heavyBadge: 'مفخم (موٹا)',
    lightBadge: 'مرقق (باریک)',
    examplesLabel: 'قرآنی مثالیں',
  },
};

export const TajweedGuideModal: React.FC<TajweedGuideModalProps> = ({
  theme,
  teachLang,
  showEnSubtitle,
  onChangeTeachLang,
  onToggleEnSubtitle,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('qaida');
  const [areaFilter, setAreaFilter] = useState<'all' | MakhrajAreaId>('all');
  const [selectedChar, setSelectedChar] = useState<string>('ض');

  const ui = GUIDE_TEXT[teachLang];
  const showDualEn = showEnSubtitle && teachLang !== 'en';
  const activeLetterMeta = resolveLetterMeta(selectedChar) || ARABIC_LETTERS[0];
  const activeLetterMakhraj =
    MAKHARIJ_17.find((m) => m.id === activeLetterMeta.makhrajId) || MAKHARIJ_17[0];
  const activeArea = MAKHARIJ_AREAS[activeLetterMakhraj.area];

  const allSifat = Object.values(SIFAT_LIST);
  const oppositeSifat = allSifat.filter((s) => s.category === 'opposite');
  const specialSifat = allSifat.filter((s) => s.category === 'special');

  return (
    <div
      id="sh"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet tj-guide-sheet" style={{ maxHeight: '92%', display: 'flex', flexDirection: 'column' }}>
        <div className="top" style={{ gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: 17, margin: 0 }}>{ui.header}</h2>
            <div className="mut sm" style={{ margin: '2px 0 0' }}>
              {ui.sub}
            </div>
          </div>
          <button className="chip" onClick={onClose}>
            {ui.close}
          </button>
        </div>

        {/* Language Pills + English Student Subtitle */}
        <div className="rw" style={{ marginTop: 8 }}>
          {(['en', 'bn', 'ar', 'ur'] as TeachLang[]).map((lng) => (
            <button
              key={lng}
              className="chip"
              style={{ minHeight: 32, padding: '0 10px', fontSize: 12 }}
              aria-pressed={teachLang === lng}
              onClick={() => onChangeTeachLang(lng)}
            >
              {TEACH_LANG_LABELS[lng]}
            </button>
          ))}
          {teachLang !== 'en' && (
            <button
              className="chip"
              style={{ minHeight: 32, padding: '0 10px', fontSize: 12 }}
              aria-pressed={showEnSubtitle}
              onClick={onToggleEnSubtitle}
            >
              {showEnSubtitle ? '✓ ' : ''}
              {ui.enSub}
            </button>
          )}
        </div>

        {/* Navigation Tabs inside Encyclopedia */}
        <div className="seg" style={{ margin: '10px 0' }}>
          {(['qaida', 'makhraj', 'sifat', 'colors'] as GuideTab[]).map((tb) => (
            <button
              key={tb}
              className={activeTab === tb ? 'on' : ''}
              style={{ fontSize: 11.5, padding: '0 4px' }}
              onClick={() => setActiveTab(tb)}
            >
              {ui.tabs[tb]}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 12 }}>
          {/* TAB 1: QAIDA & ALL TAJWEED RULES */}
          {activeTab === 'qaida' && (
            <div>
              {QAIDA_CURRICULUM.map((lesson) => (
                <div className="card" key={lesson.id}>
                  <div className="top" style={{ marginBottom: 4 }}>
                    <b style={{ fontSize: 15 }}>{lesson.title[teachLang]}</b>
                    <span className="tj-badge">{lesson.badge}</span>
                  </div>
                  {showDualEn && <div className="tj-en-sub">{lesson.title.en}</div>}
                  <p className="mut" style={{ fontSize: 13, margin: '4px 0 8px' }}>
                    {lesson.summary[teachLang]}
                  </p>
                  {showDualEn && <p className="tj-en-p">{lesson.summary.en}</p>}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {lesson.points.map((pt, idx) => (
                      <div key={idx} className="tj-lesson-point">
                        <b style={{ fontSize: 13.5, display: 'block', color: 'var(--pri)' }}>
                          {pt.subtitle[teachLang]}
                        </b>
                        {showDualEn && <div className="tj-en-sub">{pt.subtitle.en}</div>}
                        <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.55 }}>
                          {pt.detail[teachLang]}
                        </p>
                        {showDualEn && <p className="tj-en-p">{pt.detail.en}</p>}
                        {pt.examples && pt.examples.length > 0 && (
                          <div className="tj-ex-box">
                            <span className="mut" style={{ fontSize: 11, fontWeight: 700 }}>
                              {ui.examplesLabel}
                            </span>
                            {pt.examples.map((ex, eIdx) => (
                              <div key={eIdx} style={{ marginTop: 4 }}>
                                <div className="ar" lang="ar" dir="rtl" style={{ fontSize: 21 }}>
                                  {ex.ar}
                                </div>
                                <div className="mut" style={{ fontSize: 12 }}>
                                  {ex.note[teachLang]}
                                  {showDualEn ? ` · ${ex.note.en}` : ''}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: 17 MAKHARIJ */}
          {activeTab === 'makhraj' && (
            <div>
              {/* 5 Area Organ Filter Cards */}
              <div className="rw sc" style={{ marginTop: 0, marginBottom: 10 }}>
                <button
                  className="chip"
                  aria-pressed={areaFilter === 'all'}
                  onClick={() => setAreaFilter('all')}
                >
                  All 17 Makharij
                </button>
                {(Object.keys(MAKHARIJ_AREAS) as MakhrajAreaId[]).map((aid) => (
                  <button
                    key={aid}
                    className="chip"
                    aria-pressed={areaFilter === aid}
                    onClick={() => setAreaFilter(aid)}
                  >
                    {MAKHARIJ_AREAS[aid].name[teachLang]}
                  </button>
                ))}
              </div>

              {MAKHARIJ_17.filter((m) => areaFilter === 'all' || m.area === areaFilter).map(
                (m) => {
                  const area = MAKHARIJ_AREAS[m.area];
                  return (
                    <div
                      className="card"
                      key={m.id}
                      style={{ borderLeft: `4px solid ${area.color}` }}
                    >
                      <div className="top" style={{ gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <span
                            className="tj-badge"
                            style={{ background: `${area.color}20`, color: area.color }}
                          >
                            {area.name[teachLang]}
                          </span>
                          <b style={{ display: 'block', fontSize: 14.5, marginTop: 4 }}>
                            {m.name[teachLang]}
                          </b>
                          {showDualEn && <div className="tj-en-sub">{m.name.en}</div>}
                        </div>
                        <div className="ar" dir="rtl" style={{ fontSize: 22, color: area.color }}>
                          {m.letters.join(' · ')}
                        </div>
                      </div>
                      <p style={{ margin: '6px 0 8px', fontSize: 13, lineHeight: 1.55 }}>
                        {m.detail[teachLang]}
                      </p>
                      {showDualEn && <p className="tj-en-p">{m.detail.en}</p>}
                      <div className="rw" style={{ marginTop: 4 }}>
                        {m.letters.map((ltr) => (
                          <button
                            key={ltr}
                            className="chip"
                            style={{ minHeight: 34, fontSize: 16 }}
                            onClick={() => {
                              setSelectedChar(ltr);
                              setActiveTab('sifat');
                            }}
                          >
                            <span className="ar">{ltr}</span> → {ui.tabs.sifat}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}

          {/* TAB 3: SIFAT AL-HURUF & 29 ARABIC LETTERS EXPLORER */}
          {activeTab === 'sifat' && (
            <div>
              {/* Interactive 29-letter Chart */}
              <div className="card">
                <b>{ui.letterExplorer}</b>
                <p className="mut sm" style={{ marginTop: 2 }}>
                  {ui.tapLetterDesc}
                </p>

                <div className="tj-alpha-grid" dir="rtl">
                  {ARABIC_LETTERS.map((item) => (
                    <button
                      key={item.letter}
                      type="button"
                      className={`tj-alpha-btn${selectedChar === item.letter ? ' on' : ''}`}
                      onClick={() => setSelectedChar(item.letter)}
                    >
                      <span className="ar">{item.letter}</span>
                    </button>
                  ))}
                </div>

                {/* Selected Letter Deep Profile */}
                <div className="tj-howto" style={{ marginTop: 12 }}>
                  <div className="tj-makhraj-head">
                    <div className="tj-letter-hero ar" lang="ar">
                      {activeLetterMeta.letter}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span
                        className="tj-badge"
                        style={{
                          background: activeLetterMeta.heavy ? '#DBEAFE' : '#DCFCE7',
                          color: activeLetterMeta.heavy ? '#1D4ED8' : '#15803D',
                        }}
                      >
                        {activeLetterMeta.heavy ? ui.heavyBadge : ui.lightBadge}
                      </span>
                      <b style={{ display: 'block', fontSize: 15, marginTop: 3 }}>
                        {activeLetterMeta.name[teachLang]}
                      </b>
                      {showDualEn && (
                        <div className="tj-en-sub">{activeLetterMeta.name.en}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13 }}>
                    <b>{activeLetterMakhraj.name[teachLang]}</b>
                    <span style={{ color: activeArea.color, marginLeft: 6 }}>
                      ({activeArea.name[teachLang]})
                    </span>
                    <div style={{ marginTop: 4 }}>{activeLetterMeta.tip[teachLang]}</div>
                    {showDualEn && (
                      <div className="tj-en-p">
                        {activeLetterMakhraj.name.en}: {activeLetterMeta.tip.en}
                      </div>
                    )}
                    <div className="rw" style={{ marginTop: 8 }}>
                      {activeLetterMeta.sifatIds.map((sid: SifatId) => (
                        <span key={sid} className="tj-badge">
                          {SIFAT_LIST[sid].name[teachLang]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Opposite Sifat Pairs */}
              <div className="card">
                <b>{ui.oppositePairs}</b>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                  {oppositeSifat.map((s) => (
                    <div key={s.id} className="tj-lesson-point">
                      <div className="top">
                        <b style={{ fontSize: 13.5 }}>{s.name[teachLang]}</b>
                        <span className="ar" style={{ color: 'var(--pri)', fontSize: 14 }}>
                          {s.lettersLabel}
                        </span>
                      </div>
                      {showDualEn && <div className="tj-en-sub">{s.name.en}</div>}
                      <p style={{ margin: '4px 0 0', fontSize: 12.8 }}>{s.detail[teachLang]}</p>
                      {showDualEn && <p className="tj-en-p">{s.detail.en}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Sifat */}
              <div className="card">
                <b>{ui.specialSifat}</b>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                  {specialSifat.map((s) => (
                    <div key={s.id} className="tj-lesson-point">
                      <div className="top">
                        <b style={{ fontSize: 13.5 }}>{s.name[teachLang]}</b>
                        <span className="ar" style={{ color: 'var(--pri)', fontSize: 14 }}>
                          {s.lettersLabel}
                        </span>
                      </div>
                      {showDualEn && <div className="tj-en-sub">{s.name.en}</div>}
                      <p style={{ margin: '4px 0 0', fontSize: 12.8 }}>{s.detail[teachLang]}</p>
                      {showDualEn && <p className="tj-en-p">{s.detail.en}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TAJWEED COLOR LEGEND */}
          {activeTab === 'colors' && (
            <div>
              {Object.values(TAJWEED_RULES).map((rule) => {
                const col = theme === 'dark' ? rule.colorDark : rule.colorLight;
                const bg = theme === 'dark' ? rule.bgDark : rule.bgLight;
                return (
                  <div
                    className="card"
                    key={rule.id}
                    style={{ borderLeft: `5px solid ${col}` }}
                  >
                    <div className="top">
                      <span className="tj-badge" style={{ background: bg, color: col }}>
                        {rule.harakat}
                      </span>
                      <span className="ar" lang="ar" dir="rtl" style={{ fontSize: 20, color: col }}>
                        {rule.exampleAr}
                      </span>
                    </div>
                    <b style={{ fontSize: 15, display: 'block', marginTop: 4, color: col }}>
                      {rule.name[teachLang]}
                    </b>
                    {showDualEn && <div className="tj-en-sub">{rule.name.en}</div>}
                    <p style={{ margin: '4px 0', fontSize: 13 }}>{rule.shortDesc[teachLang]}</p>
                    {showDualEn && <p className="tj-en-p">{rule.shortDesc.en}</p>}
                    <div className="tj-howto">
                      {rule.howTo[teachLang]}
                      {showDualEn && <div className="tj-en-p">{rule.howTo.en}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
