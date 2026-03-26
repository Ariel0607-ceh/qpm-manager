import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { VerseDisplay } from '@/components/VerseDisplay';
import { LoginDialog } from '@/components/LoginDialog';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';
import { 
  Menu, 
  Settings, 
  Download, 
  Upload, 
  Trash2,
  BookOpen,
  User,
  Shield
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';

function App() {
  const {
    state,
    isLoaded,
    login,
    logout,
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
  } = useLocalStorage();

  const [importText, setImportText] = useState('');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const selectedSurah = getSelectedSurah();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + B to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const handleLogin = (username: string, password: string): boolean => {
    const success = login(username, password);
    if (success) {
      toast.success('Log masuk berjaya - Mod Pentadbir diaktifkan');
    }
    return success;
  };

  const handleLogout = () => {
    logout();
    toast.success('Log keluar berjaya - Mod Pengguna diaktifkan');
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qpm-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Data berjaya dieksport');
  };

  const handleImport = () => {
    if (importText.trim()) {
      const success = importData(importText.trim());
      if (success) {
        setImportText('');
        setIsImportDialogOpen(false);
        toast.success('Data berjaya diimport');
      } else {
        toast.error('Format data tidak sah');
      }
    }
  };

  const handleClearAll = () => {
    if (confirm('Adakah anda pasti mahu memadam SEMUA data? Tindakan ini tidak boleh dibatalkan.')) {
      localStorage.removeItem('qpm-data');
      window.location.reload();
    }
  };

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 
            border border-[#d4af37]/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BookOpen className="w-8 h-8 text-[#d4af37]" />
          </div>
          <p className="text-[#778da9]">Memuatkan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" 
      style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #0d1b2a 100%)' }}>
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'linear-gradient(135deg, #1b263b 0%, #0d1b2a 100%)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            color: '#e0e1dd'
          }
        }}
      />

      {/* Login Dialog */}
      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onLogin={handleLogin}
      />

      {/* Sidebar */}
      <Sidebar
        surahs={state.surahs}
        selectedSurahId={state.selectedSurahId}
        isOpen={state.sidebarOpen}
        userMode={state.userMode}
        onToggle={toggleSidebar}
        onSelectSurah={setSelectedSurahId}
        onAddSurah={addSurah}
        onUpdateSurah={updateSurah}
        onDeleteSurah={deleteSurah}
        onReorderSurahs={reorderSurahs}
        onLoginClick={() => setIsLoginDialogOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main 
        className={`flex-1 transition-all duration-500 custom-slide
          ${state.sidebarOpen ? 'md:ml-80' : 'md:ml-20'}
        `}
      >
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-[#0d1b2a]/70 
          border-b border-[#d4af37]/20 px-6 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="md:hidden text-[#e0e1dd] hover:bg-[#d4af37]/20"
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 
                  border border-[#d4af37]/30 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#d4af37]" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold text-[#e0e1dd]">QPM</h1>
                  <p className="text-xs text-[#778da9]">Al-Quran — Pustaka Melayu</p>
                </div>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {/* Mode Indicator */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1
                ${state.userMode === 'admin' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30'
                }`}
              >
                {state.userMode === 'admin' ? (
                  <>
                    <Shield className="w-3 h-3" />
                    <span>Pentadbir</span>
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3" />
                    <span>Pengguna</span>
                  </>
                )}
              </div>

              {/* Settings Dropdown - Admin Only */}
              {state.userMode === 'admin' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#e0e1dd] hover:bg-[#d4af37]/20"
                    >
                      <Settings className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end"
                    className="border-[#d4af37]/30"
                    style={{ 
                      background: 'linear-gradient(135deg, #1b263b 0%, #0d1b2a 100%)'
                    }}
                  >
                    <DropdownMenuItem 
                      onClick={handleExport}
                      className="text-[#e0e1dd] hover:bg-[#d4af37]/20 focus:bg-[#d4af37]/20 cursor-pointer"
                    >
                      <Download className="w-4 h-4 mr-2 text-[#d4af37]" />
                      Eksport Data
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setIsImportDialogOpen(true)}
                      className="text-[#e0e1dd] hover:bg-[#d4af37]/20 focus:bg-[#d4af37]/20 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2 text-[#d4af37]" />
                      Import Data
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleClearAll}
                      className="text-red-400 hover:bg-red-500/20 focus:bg-red-500/20 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Padam Semua Data
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <VerseDisplay
              surah={selectedSurah}
              translationMode={state.translationMode}
              viewMode={state.viewMode}
              userMode={state.userMode}
              onTranslationModeChange={setTranslationMode}
              onViewModeChange={setViewMode}
              onAddVerse={addVerse}
              onUpdateVerse={updateVerse}
              onDeleteVerse={deleteVerse}
              onReorderVerses={reorderVerses}
              onCopyAllVerses={copyAllVerses}
            />
          </div>
        </div>
      </main>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent 
          className="max-w-2xl border-[#d4af37]/30"
          style={{ 
            background: 'linear-gradient(135deg, #1b263b 0%, #0d1b2a 100%)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-[#e0e1dd] flex items-center space-x-2">
              <Upload className="w-5 h-5 text-[#d4af37]" />
              <span>Import Data</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-[#778da9]">
              Tampal data JSON yang dieksport sebelum ini. Tindakan ini akan menggantikan semua data sedia ada.
            </p>
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Tampal data JSON di sini..."
              rows={10}
              className="bg-[#0d1b2a]/50 border-[#d4af37]/30 text-[#e0e1dd] 
                placeholder:text-[#778da9]/50 focus:border-[#d4af37] font-mono text-sm"
            />
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={() => setIsImportDialogOpen(false)}
                className="flex-1 border-[#d4af37]/30 text-[#e0e1dd] hover:bg-[#d4af37]/10"
              >
                Batal
              </Button>
              <Button 
                onClick={handleImport}
                disabled={!importText.trim()}
                className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#b8960c] 
                  hover:from-[#e5c048] hover:to-[#c9a71d] text-[#0d1b2a] font-semibold
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Top right decoration */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full 
          bg-gradient-to-br from-[#d4af37]/5 to-transparent blur-3xl" />
        
        {/* Bottom left decoration */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full 
          bg-gradient-to-tr from-[#2d6a4f]/5 to-transparent blur-3xl" />
        
        {/* Center subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-[800px] h-[800px] rounded-full bg-gradient-radial from-[#d4af37]/3 to-transparent blur-3xl" />
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="fixed bottom-4 right-4 z-50 hidden lg:block">
        <div className="px-4 py-2 rounded-lg bg-[#1b263b]/80 border border-[#d4af37]/20 
          backdrop-blur-sm text-xs text-[#778da9]">
          <span className="text-[#d4af37]">Ctrl+B</span> Toggle Sidebar
        </div>
      </div>
    </div>
  );
}

export default App;
