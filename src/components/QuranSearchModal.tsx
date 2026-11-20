import React, { useMemo, useState } from 'react';
import { ALL_SURAHS, AyahItem, SurahMeta, normalizeArabic, toBengaliDigits } from '../data/quran';
import { QURAN_TOPICS, TOPICAL_AYAHS, TopicalAyah } from '../data/topicalQuran';

export interface QuranSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSurahAndAyah: (surahNumber: number, ayahIndex: number, targetTab: 0 | 1) => void;
  onOpenQuoteCard: (surahNumber: number, ayahNumber: number, ayahItem: AyahItem) => void;
  onToast: (msg: string) => void;
}

export function QuranSearchModal({
  isOpen,
  onClose,
  onSelectSurahAndAyah,
  onOpenQuoteCard,
  onToast,
}: QuranSearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Filter Surahs based on query
  const matchedSurahs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return ALL_SURAHS.filter((s) => {
      const numMatch = String(s.number) === q;
      const enMatch = s.en.toLowerCase().includes(q);
      const bnMatch = s.bn.toLowerCase().includes(q);
      const arMatch = normalizeArabic(s.ar).includes(normalizeArabic(q));
      return numMatch || enMatch || bnMatch || arMatch;
    }).slice(0, 10);
  }, [query]);

  // Check if query is a direct reference like "2:255" or "18:10"
  const directRef = useMemo(() => {
    const q = query.trim();
    const match = q.match(/^(\d+)[\s:,\.\/-]+(\d+)$/);
    if (!match) return null;
    const sNum = parseInt(match[1], 10);
    const aNum = parseInt(match[2], 10);
    if (sNum >= 1 && sNum <= 114) {
      const sMeta = ALL_SURAHS.find((s) => s.number === sNum);
      if (sMeta && aNum >= 1 && aNum <= sMeta.ayahs) {
        return { surah: sMeta, ayahNumber: aNum };
      }
    }
    return null;
  }, [query]);

  // Filter Topical Ayahs based on selected topic OR search query in text
  const matchedAyahs = useMemo(() => {
    const q = query.trim().toLowerCase();

    // 1. If topic selected and no query or query matches within topic
    if (selectedTopicId) {
      const topicList = TOPICAL_AYAHS.filter((a) => a.topicId === selectedTopicId);
      if (!q) return topicList;
      return topicList.filter(
        (a) =>
          a.bn.toLowerCase().includes(q) ||
          a.en.toLowerCase().includes(q) ||
          normalizeArabic(a.ar).includes(normalizeArabic(q)) ||
          a.surahNameBn.toLowerCase().includes(q) ||
          a.surahNameEn.toLowerCase().includes(q)
      );
    }

    // 2. If query entered without topic selected
    if (!q) return [];

    return TOPICAL_AYAHS.filter(
      (a) =>
        a.bn.toLowerCase().includes(q) ||
        a.en.toLowerCase().includes(q) ||
        normalizeArabic(a.ar).includes(normalizeArabic(q)) ||
        a.surahNameBn.toLowerCase().includes(q) ||
        a.surahNameEn.toLowerCase().includes(q)
    );
  }, [query, selectedTopicId]);

  if (!isOpen) return null;

  return (
    <div
      className="quote-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Universal Quran Search"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="search-modal-container">
        {/* Header */}
        <div className="search-modal-head">
          <div className="search-modal-title">
            <b>🔍 সার্বজনীন কুরআন সার্চ ও বিষয়ভিত্তিক অনুসন্ধান</b>
            <span>সূরা, বিষয় (রোজা, দোয়া, পিতা-মাতা, জান্নাত) বা আয়াত নম্বর লিখে খুঁজুন</span>
          </div>
          <button className="chip" onClick={onClose} aria-label="Close">
            ✕ বন্ধ
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="search-input-box">
          <span className="search-icon">🔍</span>
          <input
            type="search"
            className="search-main-input"
            placeholder="যেমন: বাকারা, পিতা-মাতা, দোয়া, ক্ষমা, ২:২৫৫, Yasin..."
            value={query}
            autoFocus
            onChange={(e) => {
              setQuery(e.target.value);
              if (selectedTopicId && e.target.value) {
                // Keep topic filter active or allow global search
              }
            }}
          />
          {query && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setQuery('')}
              aria-label="Clear"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Topic Filters (বিষয়ভিত্তিক কুরআন) */}
        <div className="search-topics-section">
          <div className="search-topics-header">
            <b>বিষয়ভিত্তিক কুরআন (Topical Quick Access):</b>
            {selectedTopicId && (
              <button
                type="button"
                className="chip sm"
                onClick={() => setSelectedTopicId(null)}
              >
                ✕ ফিল্টার মুছুন
              </button>
            )}
          </div>
          <div className="search-topic-chips-row">
            {QURAN_TOPICS.map((topic) => {
              const isSelected = selectedTopicId === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  className={`search-topic-chip${isSelected ? ' act' : ''}`}
                  onClick={() => {
                    setSelectedTopicId(isSelected ? null : topic.id);
                  }}
                >
                  <span className="topic-icon">{topic.icon}</span>
                  <span className="topic-name">{topic.titleBn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Results Area */}
        <div className="search-results-area">
          {/* Direct Reference Match (e.g. 2:255) */}
          {directRef && (
            <div className="search-direct-ref-card">
              <div className="direct-ref-info">
                <b>📌 সুনির্দিষ্ট আয়াত পাওয়া গেছে:</b>
                <span>
                  {directRef.surah.bn} ({directRef.surah.en}) • আয়াত{' '}
                  {toBengaliDigits(directRef.ayahNumber)}
                </span>
              </div>
              <div className="direct-ref-actions">
                <button
                  className="chip on"
                  onClick={() => {
                    onSelectSurahAndAyah(directRef.surah.number, directRef.ayahNumber - 1, 1);
                    onClose();
                  }}
                >
                  📖 সরাসরি পড়ুন
                </button>
                <button
                  className="chip"
                  onClick={() => {
                    onSelectSurahAndAyah(directRef.surah.number, 0, 0);
                    onClose();
                  }}
                >
                  🎧 তিলাওয়াত শুনুন
                </button>
              </div>
            </div>
          )}

          {/* Surah Matches */}
          {matchedSurahs.length > 0 && (
            <div className="search-section-block">
              <div className="search-section-title">
                🕌 মিল পাওয়া সূরাসমূহ ({matchedSurahs.length})
              </div>
              <div className="search-surah-grid">
                {matchedSurahs.map((s) => (
                  <div key={s.number} className="search-surah-card">
                    <div className="search-surah-left">
                      <span className="search-surah-num">{toBengaliDigits(s.number)}</span>
                      <div className="search-surah-meta">
                        <b>{s.bn}</b>
                        <span>
                          {s.en} • {toBengaliDigits(s.ayahs)} আয়াত
                        </span>
                      </div>
                    </div>
                    <div className="search-surah-actions">
                      <button
                        className="chip sm on"
                        onClick={() => {
                          onSelectSurahAndAyah(s.number, 0, 1);
                          onClose();
                        }}
                      >
                        📖 পড়ুন
                      </button>
                      <button
                        className="chip sm"
                        onClick={() => {
                          onSelectSurahAndAyah(s.number, 0, 0);
                          onClose();
                        }}
                      >
                        🎧 শুনুন
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ayah Matches (From Topical Index or Search query) */}
          {matchedAyahs.length > 0 && (
            <div className="search-section-block">
              <div className="search-section-title">
                📖 সংশ্লিষ্ট আয়াতসমূহ ({matchedAyahs.length})
              </div>
              <div className="search-ayahs-list">
                {matchedAyahs.map((ayah, idx) => (
                  <div key={`${ayah.surahNumber}-${ayah.ayahNumber}-${idx}`} className="search-ayah-card">
                    <div className="search-ayah-top">
                      <span className="search-ayah-badge">
                        {ayah.surahNameBn} ({toBengaliDigits(ayah.surahNumber)}:
                        {toBengaliDigits(ayah.ayahNumber)})
                      </span>
                      <div className="search-ayah-buttons">
                        <button
                          className="chip sm"
                          onClick={() => {
                            onSelectSurahAndAyah(ayah.surahNumber, ayah.ayahNumber - 1, 1);
                            onClose();
                          }}
                        >
                          📖 পড়ুন
                        </button>
                        <button
                          className="chip sm"
                          onClick={() => {
                            onSelectSurahAndAyah(ayah.surahNumber, 0, 0);
                            onClose();
                          }}
                        >
                          🎧 শুনুন
                        </button>
                        <button
                          className="chip sm on"
                          onClick={() => {
                            onOpenQuoteCard(ayah.surahNumber, ayah.ayahNumber, {
                              ar: ayah.ar,
                              bn: ayah.bn,
                              en: ayah.en,
                            });
                          }}
                        >
                          🎨 কোট কার্ড
                        </button>
                        <button
                          className="chip sm"
                          onClick={async () => {
                            try {
                              const text = `${ayah.ar}\n\n"${ayah.bn}"\n\n— ${ayah.surahNameBn} (${ayah.surahNumber}:${ayah.ayahNumber})`;
                              await navigator.clipboard.writeText(text);
                              onToast('আয়াত ও অর্থ ক্লিপবোর্ডে কপি হয়েছে!');
                            } catch {
                              onToast('কপি করতে সমস্যা হয়েছে।');
                            }
                          }}
                        >
                          📋 কপি
                        </button>
                      </div>
                    </div>

                    <div className="search-ayah-ar ar" dir="rtl" lang="ar">
                      {ayah.ar}
                    </div>

                    <div className="search-ayah-bn">
                      “{ayah.bn}”
                    </div>

                    {ayah.en && (
                      <div className="search-ayah-en">
                        {ayah.en}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!directRef && matchedSurahs.length === 0 && matchedAyahs.length === 0 && (
            <div className="search-empty-state">
              <span className="search-empty-icon">📖</span>
              <b>
                {query
                  ? 'কোনো ফলাফল পাওয়া যায়নি'
                  : 'পবিত্র কুরআনের যেকোনো সূরা, বিষয় বা আয়াত খুঁজুন'}
              </b>
              <p>
                {query
                  ? 'দয়া করে অন্য কোনো শব্দ যেমন: "দয়া", "রোজা", "নামাজ", "জান্নাত" ইত্যাদি দিয়ে চেষ্টা করুন।'
                  : 'উপরের বিষয়ের যেকোনো বাটনে (যেমন: দোয়া, পিতা-মাতা, রোজা) ক্লিক করে সাথে সাথে বরকতময় আয়াতগুলো পড়তে পারেন।'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
