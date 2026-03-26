import { useState, useEffect, useCallback } from 'react';
import type { AppState, Surah, UserMode } from '@/types/quran';
import { STORAGE_KEY, getInitialState, ADMIN_USERNAME, ADMIN_PASSWORD } from '@/types/quran';

export function useLocalStorage() {
  const [state, setState] = useState<AppState>(getInitialState());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState({
          ...getInitialState(),
          ...parsed,
          userMode: 'user',
          surahs: parsed.surahs?.length > 0 ? parsed.surahs : getInitialState().surahs
        });
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      try {
        // Save everything EXCEPT userMode - always force 'user' on next load
        const stateToSave = {
          ...state,
          userMode: 'user' // Always save as 'user', never persist 'admin'
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [state, isLoaded]);

  // Auth functions
  const login = useCallback((username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setState(prev => ({ ...prev, userMode: 'admin' }));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setState(prev => ({ ...prev, userMode: 'user' }));
  }, []);

  const setUserMode = useCallback((mode: UserMode) => {
    setState(prev => ({ ...prev, userMode: mode }));
  }, []);

  const setSelectedSurahId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedSurahId: id }));
  }, []);

  const setTranslationMode = useCallback((mode: 'modern' | 'classical') => {
    setState(prev => ({ ...prev, translationMode: mode }));
  }, []);

  const setViewMode = useCallback((mode: 'block' | 'continuous') => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  // CRUD Operations for Surahs
  const addSurah = useCallback((nameMalay: string, nameArabicRumi: string) => {
    const newSurah: Surah = {
      id: `surah-${Date.now()}`,
      number: state.surahs.length + 1,
      nameMalay,
      nameArabicRumi,
      verses: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setState(prev => ({
      ...prev,
      surahs: [...prev.surahs, newSurah],
      selectedSurahId: newSurah.id
    }));
    return newSurah.id;
  }, [state.surahs.length]);

  const updateSurah = useCallback((id: string, nameMalay: string, nameArabicRumi: string) => {
    setState(prev => ({
      ...prev,
      surahs: prev.surahs.map(s => 
        s.id === id ? { ...s, nameMalay, nameArabicRumi, updatedAt: Date.now() } : s
      )
    }));
  }, []);

  const deleteSurah = useCallback((id: string) => {
    setState(prev => {
      const filtered = prev.surahs.filter(s => s.id !== id);
      // Renumber surahs
      const renumbered = filtered.map((s, idx) => ({ ...s, number: idx + 1 }));
      return {
        ...prev,
        surahs: renumbered,
        selectedSurahId: renumbered.length > 0 ? renumbered[0].id : null
      };
    });
  }, []);

  // Reorder Surahs
  const reorderSurahs = useCallback((surahIds: string[]) => {
    setState(prev => {
      const reordered = surahIds
        .map(id => prev.surahs.find(s => s.id === id))
        .filter((s): s is NonNullable<typeof s> => s !== undefined)
        .map((s, idx) => ({ ...s, number: idx + 1 }));
      return {
        ...prev,
        surahs: reordered
      };
    });
  }, []);

  // CRUD Operations for Verses
  const addVerse = useCallback((surahId: string, text: string, mode: 'modern' | 'classical') => {
    setState(prev => ({
      ...prev,
      surahs: prev.surahs.map(s => {
        if (s.id !== surahId) return s;
        const newVerse = {
          id: `verse-${surahId}-${Date.now()}`,
          number: s.verses.length + 1,
          modernMalay: mode === 'modern' ? text : 'Tiada terjemahan',
          classicalMalay: mode === 'classical' ? text : 'Tiada terjemahan'
        };
        return {
          ...s,
          verses: [...s.verses, newVerse],
          updatedAt: Date.now()
        };
      })
    }));
  }, []);

  const updateVerse = useCallback((surahId: string, verseId: string, text: string, mode: 'modern' | 'classical') => {
    setState(prev => ({
      ...prev,
      surahs: prev.surahs.map(s => {
        if (s.id !== surahId) return s;
        return {
          ...s,
          verses: s.verses.map(v => 
            v.id === verseId 
              ? { 
                  ...v, 
                  modernMalay: mode === 'modern' ? text : v.modernMalay,
                  classicalMalay: mode === 'classical' ? text : v.classicalMalay
                } 
              : v
          ),
          updatedAt: Date.now()
        };
      })
    }));
  }, []);

  const deleteVerse = useCallback((surahId: string, verseId: string) => {
    setState(prev => ({
      ...prev,
      surahs: prev.surahs.map(s => {
        if (s.id !== surahId) return s;
        const filtered = s.verses.filter(v => v.id !== verseId);
        // Renumber verses
        const renumbered = filtered.map((v, idx) => ({ ...v, number: idx + 1 }));
        return {
          ...s,
          verses: renumbered,
          updatedAt: Date.now()
        };
      })
    }));
  }, []);

  // Reorder Verses
  const reorderVerses = useCallback((surahId: string, verseIds: string[]) => {
    setState(prev => ({
      ...prev,
      surahs: prev.surahs.map(s => {
        if (s.id !== surahId) return s;
        const reordered = verseIds
          .map(id => s.verses.find(v => v.id === id))
          .filter((v): v is NonNullable<typeof v> => v !== undefined)
          .map((v, idx) => ({ ...v, number: idx + 1 }));
        return {
          ...s,
          verses: reordered,
          updatedAt: Date.now()
        };
      })
    }));
  }, []);

  const getSelectedSurah = useCallback(() => {
    return state.surahs.find(s => s.id === state.selectedSurahId) || null;
  }, [state.surahs, state.selectedSurahId]);

  const copyAllVerses = useCallback((surahId: string, mode: 'modern' | 'classical'): { plainText: string; htmlText: string } => {
    const surah = state.surahs.find(s => s.id === surahId);
    if (!surah) return { plainText: '', htmlText: '' };
    
    // Plain text version (for fallback)
    const plainText = surah.verses
      .map(v => {
        const text = mode === 'modern' ? v.modernMalay : v.classicalMalay;
        return `${v.number} ${text}`;
      })
      .join(' ');
    
    // HTML version with proper superscript tags for Word
    const htmlVerses = surah.verses
      .map(v => {
        const text = mode === 'modern' ? v.modernMalay : v.classicalMalay;
        return `<sup style="font-size: 0.75em; vertical-align: super; color: #d4af37;">${v.number}</sup> ${text}`;
      })
      .join(' ');
    
    const htmlText = `<html><body style="font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.8;">${htmlVerses}</body></html>`;
    
    return { plainText, htmlText };
  }, [state.surahs]);

  const exportData = useCallback(() => {
    return JSON.stringify(state.surahs, null, 2);
  }, [state.surahs]);

  const importData = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        setState(prev => ({
          ...prev,
          surahs: parsed,
          selectedSurahId: parsed[0]?.id || null
        }));
        return true;
      }
    } catch (error) {
      console.error('Error importing data:', error);
    }
    return false;
  }, []);

  return {
    state,
    isLoaded,
    isAuthenticated,
    login,
    logout,
    setUserMode,
    setSelectedSurahId,
    setTranslationMode,
    setViewMode,
    toggleSidebar,
    addSurah,
    updateSurah,
    deleteSurah,
    reorderSurahs,
    addVerse,
    updateVerse,
    deleteVerse,
    reorderVerses,
    getSelectedSurah,
    copyAllVerses,
    exportData,
    importData
  };
}
