// Quran Types for QPM (Al-Quran — Pustaka Melayu)

export interface Verse {
  id: string;
  number: number;
  modernMalay: string;
  classicalMalay: string;
}

export interface Surah {
  id: string;
  number: number;
  nameMalay: string;      // Nama Surah dalam Bahasa Melayu
  nameArabicRumi: string; // Nama Surah dalam Arab (Rumi/Latin)
  verses: Verse[];
  createdAt: number;
  updatedAt: number;
}

export type TranslationMode = 'modern' | 'classical';
export type ViewMode = 'block' | 'continuous';
export type UserMode = 'user' | 'admin';

export interface AppState {
  surahs: Surah[];
  selectedSurahId: string | null;
  translationMode: TranslationMode;
  viewMode: ViewMode;
  sidebarOpen: boolean;
  userMode: UserMode;
}

export const STORAGE_KEY = 'qpm-data';
export const AUTH_KEY = 'qpm-auth';

// Default sample data
export const defaultSurahs: Surah[] = [
  {
    id: 'surah-1',
    number: 1,
    nameMalay: 'Al-Fatihah',
    nameArabicRumi: 'الفاتحة',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    verses: [
      {
        id: 'verse-1-1',
        number: 1,
        modernMalay: 'Dengan nama Allah, Yang Maha Pemurah, lagi Maha Mengasihani.',
        classicalMalay: 'Dengan menyebut nama Allah Yang Maha Pemurah lagi Maha Penyayang.'
      },
      {
        id: 'verse-1-2',
        number: 2,
        modernMalay: 'Segala puji tertentu bagi Allah, Tuhan yang memelihara dan mentadbirkan sekalian alam.',
        classicalMalay: 'Segala puji bagi Allah, Tuhan semesta alam.'
      },
      {
        id: 'verse-1-3',
        number: 3,
        modernMalay: 'Yang Maha Pemurah, lagi Maha Mengasihani.',
        classicalMalay: 'Yang Maha Pemurah lagi Maha Penyayang.'
      },
      {
        id: 'verse-1-4',
        number: 4,
        modernMalay: 'Yang Menguasai pemerintahan hari Pembalasan.',
        classicalMalay: 'Yang Menguasai hari pembalasan.'
      },
      {
        id: 'verse-1-5',
        number: 5,
        modernMalay: 'Hanya Engkaulah (Ya Allah) yang kami sembah, dan kepada Engkaulah sahaja kami memohon pertolongan.',
        classicalMalay: 'Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan.'
      },
      {
        id: 'verse-1-6',
        number: 6,
        modernMalay: 'Tunjukilah kami jalan yang lurus,',
        classicalMalay: 'Tunjukilah kami jalan yang lurus,'
      },
      {
        id: 'verse-1-7',
        number: 7,
        modernMalay: 'Iaitu jalan orang-orang yang Engkau telah kurniakan nikmat kepada mereka, bukan jalan orang-orang yang Engkau telah murkai, dan bukan pula jalan orang-orang yang sesat.',
        classicalMalay: 'Yaitu jalan orang-orang yang Engkau telah beri nikmat kepada mereka, bukan jalan mereka yang dimurkai dan bukan pula jalan mereka yang sesat.'
      }
    ]
  },
  {
    id: 'surah-2',
    number: 2,
    nameMalay: 'Al-Baqarah',
    nameArabicRumi: 'البقرة',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    verses: [
      {
        id: 'verse-2-1',
        number: 1,
        modernMalay: 'Alif. Lam. Mim.',
        classicalMalay: 'Alif Laam Miim.'
      },
      {
        id: 'verse-2-2',
        number: 2,
        modernMalay: 'Kitab (Al-Quran) ini tidak ada sebarang syak padanya; ia menjadi petunjuk bagi orang-orang yang bertakwa,',
        classicalMalay: 'Kitab (Al-Quran) ini tidak ada keraguan padanya; petunjuk bagi mereka yang bertakwa,'
      },
      {
        id: 'verse-2-3',
        number: 3,
        modernMalay: 'Iaitu orang-orang yang beriman dengan perkara yang ghaib, dan yang mendirikan sembahyang, dan yang membelanjakan sebahagian dari rezeki yang Kami berikan kepada mereka,',
        classicalMalay: 'Yaitu orang-orang yang beriman kepada yang ghaib, yang mendirikan shalat dan yang menafkahkan sebagian rezeki yang Kami berikan kepada mereka.'
      }
    ]
  }
];

export const getInitialState = (): AppState => ({
  surahs: defaultSurahs,
  selectedSurahId: defaultSurahs[0]?.id || null,
  translationMode: 'modern',
  viewMode: 'block',
  sidebarOpen: true,
  userMode: 'user'
});

// Admin credentials
export const ADMIN_USERNAME = 'Naufal';
export const ADMIN_PASSWORD = 'Naufal0607';
