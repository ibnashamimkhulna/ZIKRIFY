# ZIKRIFY — Quran Audio, Read, Tajweed & Hifz PWA

**Developed by Graphico Global · For MAHADUL FURQAN**

ZIKRIFY is an installable offline-first Progressive Web App (PWA) for listening to the complete 30 Juz (114 Surahs) of the Holy Quran, reading in Mushaf / Ayah / Meaning modes with 4-language Tajweed, Makhraj & Sifat teaching tools, practicing Hifz memorization, playing local media, and reading Hifz Quran PDFs.

## Included Reciters (10 Qaris)
1. Mishary Alafasy
2. Abdul Basit
3. As-Sudais
4. Maher Al-Muaiqly
5. Saad Al-Ghamdi
6. Al-Minshawi
7. Ahmad Al-Nufais
8. Badr Al-Turki
9. Abdul Badi Ghaylan (عبد البديع محمد غيلان)
10. Abdul Aziz Shukri (عبد العزيز شكري)

## Quick Start (Local Development)

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Deploy on GitHub Pages

This repository includes `.github/workflows/deploy.yml` for automatic deployment to GitHub Pages:
1. Push this repository to GitHub.
2. Open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` builds with the repository's `VITE_BASE_PATH` and publishes the installable offline PWA automatically.
