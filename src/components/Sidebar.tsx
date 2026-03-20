import { useState, useRef, useEffect } from 'react';
import type { Surah, UserMode } from '@/types/quran';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  BookOpen, 
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  GripVertical,
  LogIn,
  LogOut
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SidebarProps {
  surahs: Surah[];
  selectedSurahId: string | null;
  isOpen: boolean;
  userMode: UserMode;
  onToggle: () => void;
  onSelectSurah: (id: string) => void;
  onAddSurah: (nameMalay: string, nameArabicRumi: string) => void;
  onUpdateSurah: (id: string, nameMalay: string, nameArabicRumi: string) => void;
  onDeleteSurah: (id: string) => void;
  onReorderSurahs: (surahIds: string[]) => void;
  onLoginClick: () => void;
  onLogout: () => void;
}

interface SortableSurahItemProps {
  surah: Surah;
  isSelected: boolean;
  userMode: UserMode;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableSurahItem({ surah, isSelected, userMode, onSelect, onEdit, onDelete }: SortableSurahItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: surah.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-300
        ${isSelected 
          ? 'bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/5 border border-[#d4af37]/40' 
          : 'bg-[#0d1b2a]/30 border border-transparent hover:bg-[#0d1b2a]/50 hover:border-[#d4af37]/20'
        }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {userMode === 'admin' && (
            <div 
              {...attributes} 
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-[#d4af37]/20"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4 text-[#778da9]" />
            </div>
          )}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold
            ${isSelected 
              ? 'bg-gradient-to-br from-[#d4af37] to-[#b8960c] text-[#0d1b2a]' 
              : 'bg-[#1b263b] text-[#778da9] group-hover:text-[#d4af37]'
            }`}
          >
            {surah.number}
          </div>
          <div>
            <p className={`font-medium text-sm ${isSelected ? 'text-[#d4af37]' : 'text-[#e0e1dd]'}`}>
              {surah.nameMalay}
            </p>
            <p className="text-xs text-[#778da9] font-arabic">{surah.nameArabicRumi}</p>
          </div>
        </div>
        
        {userMode === 'admin' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button 
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200
                  p-1.5 rounded-lg hover:bg-[#d4af37]/20"
              >
                <MoreVertical className="w-4 h-4 text-[#778da9]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              className="border-[#d4af37]/30"
              style={{ 
                background: 'linear-gradient(135deg, #1b263b 0%, #0d1b2a 100%)'
              }}
            >
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="text-[#e0e1dd] hover:bg-[#d4af37]/20 focus:bg-[#d4af37]/20 cursor-pointer"
              >
                <Edit2 className="w-4 h-4 mr-2 text-[#d4af37]" />
                Sunting
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-red-400 hover:bg-red-500/20 focus:bg-red-500/20 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Padam
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export function Sidebar({
  surahs,
  selectedSurahId,
  isOpen,
  userMode,
  onToggle,
  onSelectSurah,
  onAddSurah,
  onUpdateSurah,
  onDeleteSurah,
  onReorderSurahs,
  onLoginClick,
  onLogout
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [newSurahNameMalay, setNewSurahNameMalay] = useState('');
  const [newSurahNameArabic, setNewSurahNameArabic] = useState('');
  const [editingSurah, setEditingSurah] = useState<Surah | null>(null);
  const [editNameMalay, setEditNameMalay] = useState('');
  const [editNameArabic, setEditNameArabic] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const filteredSurahs = surahs.filter(s => 
    s.nameMalay.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nameArabicRumi.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.number.toString().includes(searchQuery)
  );

  const handleAddSurah = () => {
    if (newSurahNameMalay.trim() && newSurahNameArabic.trim()) {
      onAddSurah(newSurahNameMalay.trim(), newSurahNameArabic.trim());
      setNewSurahNameMalay('');
      setNewSurahNameArabic('');
      setIsAddDialogOpen(false);
    }
  };

  const handleEditSurah = (surah: Surah) => {
    setEditingSurah(surah);
    setEditNameMalay(surah.nameMalay);
    setEditNameArabic(surah.nameArabicRumi);
  };

  const handleSaveEdit = () => {
    if (editingSurah && editNameMalay.trim() && editNameArabic.trim()) {
      onUpdateSurah(editingSurah.id, editNameMalay.trim(), editNameArabic.trim());
      setEditingSurah(null);
    }
  };

  const handleDeleteSurah = (id: string) => {
    if (confirm('Adakah anda pasti mahu memadam surah ini? Tindakan ini tidak boleh dibatalkan.')) {
      onDeleteSurah(id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = surahs.findIndex(s => s.id === active.id);
      const newIndex = surahs.findIndex(s => s.id === over.id);
      const reordered = arrayMove(surahs, oldIndex, newIndex);
      onReorderSurahs(reordered.map(s => s.id));
    }
  };

  // Click outside to close on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 768 && isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]
          ${isOpen ? 'w-80 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'}
        `}
        style={{
          background: 'linear-gradient(180deg, rgba(27, 38, 59, 0.95) 0%, rgba(13, 27, 42, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(212, 175, 55, 0.2)'
        }}
      >
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full 
            bg-gradient-to-br from-[#d4af37] to-[#b8960c]
            flex items-center justify-center shadow-lg shadow-[#d4af37]/30
            hover:scale-110 transition-transform duration-300 z-50"
        >
          {isOpen ? (
            <ChevronLeft className="w-5 h-5 text-[#0d1b2a]" />
          ) : (
            <ChevronRight className="w-5 h-5 text-[#0d1b2a]" />
          )}
        </button>

        {/* Collapsed State - Icon Only */}
        {!isOpen && (
          <div className="flex flex-col items-center py-8 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 
              border border-[#d4af37]/30 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#d4af37]" />
            </div>
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
            <div className="flex flex-col space-y-3">
              {surahs.slice(0, 5).map((surah) => (
                <button
                  key={surah.id}
                  onClick={() => onSelectSurah(surah.id)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium
                    transition-all duration-300
                    ${selectedSurahId === surah.id 
                      ? 'bg-gradient-to-br from-[#d4af37] to-[#b8960c] text-[#0d1b2a]' 
                      : 'bg-[#1b263b]/50 text-[#778da9] hover:bg-[#d4af37]/20 hover:text-[#d4af37]'
                    }`}
                  title={`${surah.number}. ${surah.nameMalay}`}
                >
                  {surah.number}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Expanded State - Full Content */}
        {isOpen && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-[#d4af37]/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 
                    border border-[#d4af37]/30 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#d4af37]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#e0e1dd]">Senarai Surah</h2>
                    <p className="text-xs text-[#778da9]">{surahs.length} Surah</p>
                  </div>
                </div>
                {userMode === 'admin' && (
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="icon"
                        className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#b8960c] 
                          hover:from-[#e5c048] hover:to-[#c9a71d] text-[#0d1b2a]"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent 
                      className="border-[#d4af37]/30"
                      style={{ 
                        background: 'linear-gradient(135deg, #1b263b 0%, #0d1b2a 100%)',
                        backdropFilter: 'blur(20px)'
                      }}
                    >
                      <DialogHeader>
                        <DialogTitle className="text-[#e0e1dd] flex items-center space-x-2">
                          <Plus className="w-5 h-5 text-[#d4af37]" />
                          <span>Tambah Surah Baharu</span>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <label className="text-sm text-[#778da9] mb-2 block">Nama Surah (Bahasa Melayu)</label>
                          <Input
                            value={newSurahNameMalay}
                            onChange={(e) => setNewSurahNameMalay(e.target.value)}
                            placeholder="Contoh: Al-Fatihah"
                            className="bg-[#0d1b2a]/50 border-[#d4af37]/30 text-[#e0e1dd] 
                              placeholder:text-[#778da9]/50 focus:border-[#d4af37]"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-[#778da9] mb-2 block">Nama Surah (Rumi/Arab)</label>
                          <Input
                            value={newSurahNameArabic}
                            onChange={(e) => setNewSurahNameArabic(e.target.value)}
                            placeholder="Contoh: الفاتحة"
                            className="bg-[#0d1b2a]/50 border-[#d4af37]/30 text-[#e0e1dd] 
                              placeholder:text-[#778da9]/50 focus:border-[#d4af37] font-arabic"
                          />
                        </div>
                        <Button 
                          onClick={handleAddSurah}
                          disabled={!newSurahNameMalay.trim() || !newSurahNameArabic.trim()}
                          className="w-full bg-gradient-to-r from-[#d4af37] to-[#b8960c] 
                            hover:from-[#e5c048] hover:to-[#c9a71d] text-[#0d1b2a] font-semibold
                            disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Tambah Surah
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#778da9]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari surah..."
                  className="pl-10 bg-[#0d1b2a]/50 border-[#d4af37]/20 text-[#e0e1dd] 
                    placeholder:text-[#778da9]/50 focus:border-[#d4af37]/50 text-sm"
                />
              </div>
            </div>

            {/* Surah List with Drag and Drop */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {filteredSurahs.length === 0 && searchQuery.trim() !== '' ? (
                  <div className="text-center py-8">
                    <p className="text-red-400 text-sm">
                      Maaf, surah &quot;{searchQuery}&quot; tidak dijumpai.
                    </p>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={filteredSurahs.map(s => s.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {filteredSurahs.map((surah) => (
                        <SortableSurahItem
                          key={surah.id}
                          surah={surah}
                          isSelected={selectedSurahId === surah.id}
                          userMode={userMode}
                          onSelect={() => onSelectSurah(surah.id)}
                          onEdit={() => handleEditSurah(surah)}
                          onDelete={() => handleDeleteSurah(surah.id)}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </ScrollArea>

            {/* Footer with Login/Logout */}
            <div className="p-4 border-t border-[#d4af37]/20">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#778da9]/60">
                  QPM - Pustaka Melayu
                </p>
                {userMode === 'admin' ? (
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Log Keluar</span>
                  </button>
                ) : (
                  <button
                    onClick={onLoginClick}
                    className="flex items-center space-x-1 text-xs text-[#d4af37] hover:text-[#e5c048] transition-colors"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Mod Pentadbir</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingSurah} onOpenChange={() => setEditingSurah(null)}>
        <DialogContent 
          className="border-[#d4af37]/30"
          style={{ 
            background: 'linear-gradient(135deg, #1b263b 0%, #0d1b2a 100%)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-[#e0e1dd] flex items-center space-x-2">
              <Edit2 className="w-5 h-5 text-[#d4af37]" />
              <span>Sunting Surah</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm text-[#778da9] mb-2 block">Nama Surah (Bahasa Melayu)</label>
              <Input
                value={editNameMalay}
                onChange={(e) => setEditNameMalay(e.target.value)}
                placeholder="Contoh: Al-Fatihah"
                className="bg-[#0d1b2a]/50 border-[#d4af37]/30 text-[#e0e1dd] 
                  placeholder:text-[#778da9]/50 focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="text-sm text-[#778da9] mb-2 block">Nama Surah (Rumi/Arab)</label>
              <Input
                value={editNameArabic}
                onChange={(e) => setEditNameArabic(e.target.value)}
                placeholder="Contoh: الفاتحة"
                className="bg-[#0d1b2a]/50 border-[#d4af37]/30 text-[#e0e1dd] 
                  placeholder:text-[#778da9]/50 focus:border-[#d4af37] font-arabic"
              />
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={() => setEditingSurah(null)}
                className="flex-1 border-[#d4af37]/30 text-[#e0e1dd] hover:bg-[#d4af37]/10"
              >
                Batal
              </Button>
              <Button 
                onClick={handleSaveEdit}
                disabled={!editNameMalay.trim() || !editNameArabic.trim()}
                className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#b8960c] 
                  hover:from-[#e5c048] hover:to-[#c9a71d] text-[#0d1b2a] font-semibold
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
