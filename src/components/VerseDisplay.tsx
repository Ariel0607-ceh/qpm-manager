import { useState } from 'react';
import type { Surah, Verse, TranslationMode, ViewMode, UserMode } from '@/types/quran';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Slider } from '@/components/ui/slider';
import { 
  Plus, 
  Copy, 
  Check, 
  Edit2, 
  Trash2, 
  MoreVertical,
  BookOpen,
  Clock,
  Scroll,
  GripVertical,
  LayoutGrid,
  AlignJustify,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type
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
import { toast } from 'sonner';
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

interface VerseDisplayProps {
  surah: Surah | null;
  translationMode: TranslationMode;
  viewMode: ViewMode;
  userMode: UserMode;
  onTranslationModeChange: (mode: TranslationMode) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onAddVerse: (surahId: string, text: string, mode: TranslationMode) => void;
  onUpdateVerse: (surahId: string, verseId: string, text: string, mode: TranslationMode) => void;
  onDeleteVerse: (surahId: string, verseId: string) => void;
  onReorderVerses: (surahId: string, verseIds: string[]) => void;
  onCopyAllVerses: (surahId: string, mode: TranslationMode) => { plainText: string; htmlText: string };
}

interface SortableVerseItemProps {
  verse: Verse;
  userMode: UserMode;
  translationMode: TranslationMode;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableVerseItem({ verse, userMode, translationMode, onEdit, onDelete }: SortableVerseItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: verse.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const getVerseText = (v: Verse) => {
    return translationMode === 'modern' ? v.modernMalay : v.classicalMalay;
  };

  const getOtherText = (v: Verse) => {
    return translationMode === 'modern' ? v.classicalMalay : v.modernMalay;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative"
    >
      <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#1b263b]/80 to-[#0d1b2a]/80 
        border border-[#d4af37]/20 hover:border-[#d4af37]/40 transition-all duration-500
        hover:shadow-lg hover:shadow-[#d4af37]/10 hover:-translate-y-1">
        
        {/* Verse Number Badge */}
        <div className="absolute -top-3 left-6">
          <div className="px-4 py-1 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8960c] 
            text-[#0d1b2a] text-sm font-bold shadow-lg shadow-[#d4af37]/30">
            Ayat {verse.number}
          </div>
        </div>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex items-center space-x-1">
          {userMode === 'admin' && (
            <>
              <div 
                {...attributes} 
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-2 rounded-lg hover:bg-[#d4af37]/20 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <GripVertical className="w-4 h-4 text-[#778da9]" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-lg hover:bg-[#d4af37]/20 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    onClick={onEdit}
                    className="text-[#e0e1dd] hover:bg-[#d4af37]/20 focus:bg-[#d4af37]/20 cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4 mr-2 text-[#d4af37]" />
                    Sunting
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={onDelete}
                    className="text-red-400 hover:bg-red-500/20 focus:bg-red-500/20 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Padam
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        {/* Verse Text - No superscript in block view */}
        <div className="pt-4">
          <p className="text-xl leading-relaxed text-[#e0e1dd]"
            style={{ fontFamily: 'Inter, sans-serif', lineHeight: '2' }}>
            {getVerseText(verse)}
          </p>
        </div>

        {/* Translation Preview (showing the other mode) */}
        <div className="mt-4 pt-4 border-t border-[#d4af37]/10">
          <p className="text-sm text-[#778da9]/70 italic">
            <span className="text-[#d4af37]/50">
              {translationMode === 'modern' ? 'Melayu Klasik: ' : 'Melayu Moden: '}
            </span>
            {getOtherText(verse)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function VerseDisplay({
  surah,
  translationMode,
  viewMode,
  userMode,
  onTranslationModeChange,
  onViewModeChange,
  onAddVerse,
  onUpdateVerse,
  onDeleteVerse,
  onReorderVerses,
  onCopyAllVerses
}: VerseDisplayProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVerse, setEditingVerse] = useState<Verse | null>(null);
  const [newVerseText, setNewVerseText] = useState('');
  const [editVerseText, setEditVerseText] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Continuous view settings
  const [textSize, setTextSize] = useState(20); // Default 20px
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('justify');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  if (!surah) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#d4af37]/10 to-[#d4af37]/5 
          border border-[#d4af37]/20 flex items-center justify-center mb-6">
          <BookOpen className="w-12 h-12 text-[#d4af37]/50" />
        </div>
        <h2 className="text-2xl font-semibold text-[#e0e1dd] mb-2">
          Tiada Surah Dipilih
        </h2>
        <p className="text-[#778da9] max-w-md">
          Sila pilih sebuah surah dari sidebar untuk mula membaca.
        </p>
      </div>
    );
  }

  const handleAddVerse = () => {
    if (newVerseText.trim()) {
      onAddVerse(surah.id, newVerseText.trim(), translationMode);
      setNewVerseText('');
      setIsAddDialogOpen(false);
      toast.success('Ayat berjaya ditambah');
    }
  };

  const handleEditVerse = (verse: Verse) => {
    setEditingVerse(verse);
    const currentText = translationMode === 'modern' ? verse.modernMalay : verse.classicalMalay;
    setEditVerseText(currentText);
  };

  const handleSaveEdit = () => {
    if (editingVerse && editVerseText.trim()) {
      onUpdateVerse(surah.id, editingVerse.id, editVerseText.trim(), translationMode);
      setEditingVerse(null);
      toast.success('Ayat berjaya dikemaskini');
    }
  };

  const handleDeleteVerse = (verseId: string) => {
    if (confirm('Adakah anda pasti mahu memadam ayat ini?')) {
      onDeleteVerse(surah.id, verseId);
      toast.success('Ayat berjaya dipadam');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = surah.verses.findIndex(v => v.id === active.id);
      const newIndex = surah.verses.findIndex(v => v.id === over.id);
      const reordered = arrayMove(surah.verses, oldIndex, newIndex);
      onReorderVerses(surah.id, reordered.map(v => v.id));
    }
  };

  const handleCopyAll = async () => {
    const { plainText, htmlText } = onCopyAllVerses(surah.id, translationMode);
    try {
      // Use Clipboard API with both plain text and HTML
      const clipboardItem = new ClipboardItem({
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
        'text/html': new Blob([htmlText], { type: 'text/html' })
      });
      await navigator.clipboard.write([clipboardItem]);
      setCopied(true);
      toast.success('Semua ayat telah disalin ke papan keratan');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback to plain text if ClipboardItem is not supported
      try {
        await navigator.clipboard.writeText(plainText);
        setCopied(true);
        toast.success('Semua ayat telah disalin ke papan keratan');
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        toast.error('Gagal menyalin teks');
      }
    }
  };

  const getVerseText = (verse: Verse) => {
    return translationMode === 'modern' ? verse.modernMalay : verse.classicalMalay;
  };

  const getNextVerseNumber = () => {
    return surah.verses.length + 1;
  };

  const renderContinuousView = () => {
    return (
      <div className="space-y-4">
        {/* Text Size and Alignment Controls */}
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-[#1b263b]/50 border border-[#d4af37]/20">
          {/* Text Size Slider */}
          <div className="flex items-center space-x-3 flex-1 min-w-[200px]">
            <Type className="w-4 h-4 text-[#d4af37]" />
            <span className="text-sm text-[#778da9]">Saiz:</span>
            <Slider
              value={[textSize]}
              onValueChange={(value) => setTextSize(value[0])}
              min={14}
              max={32}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-[#d4af37] w-10 text-right">{textSize}px</span>
          </div>
          
          {/* Alignment Buttons */}
          <ToggleGroup 
            type="single" 
            value={textAlign}
            onValueChange={(v) => v && setTextAlign(v as typeof textAlign)}
            className="bg-[#0d1b2a]/50 border border-[#d4af37]/20 p-1 rounded-lg"
          >
            <ToggleGroupItem 
              value="left" 
              aria-label="Jajar Kiri"
              className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-[#d4af37] 
                data-[state=on]:to-[#b8960c] data-[state=on]:text-[#0d1b2a]
                text-[#778da9] px-3 py-2 transition-all duration-300"
            >
              <AlignLeft className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="center" 
              aria-label="Jajar Tengah"
              className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-[#d4af37] 
                data-[state=on]:to-[#b8960c] data-[state=on]:text-[#0d1b2a]
                text-[#778da9] px-3 py-2 transition-all duration-300"
            >
              <AlignCenter className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="right" 
              aria-label="Jajar Kanan"
              className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-[#d4af37] 
                data-[state=on]:to-[#b8960c] data-[state=on]:text-[#0d1b2a]
                text-[#778da9] px-3 py-2 transition-all duration-300"
            >
              <AlignRight className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="justify" 
              aria-label="Jajar Rata"
              className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-[#d4af37] 
                data-[state=on]:to-[#b8960c] data-[state=on]:text-[#0d1b2a]
                text-[#778da9] px-3 py-2 transition-all duration-300"
            >
              <AlignJustify className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Verses Content */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#1b263b]/80 to-[#0d1b2a]/80 
          border border-[#d4af37]/20">
          <p 
            className="leading-loose text-[#e0e1dd]"
            style={{ 
              fontSize: `${textSize}px`,
              textAlign: textAlign,
              lineHeight: '2.5'
            }}
          >
            {surah.verses.map((verse, idx) => (
              <span key={verse.id}>
                <sup className="text-[#d4af37] font-bold mr-1" style={{ fontSize: `${textSize * 0.65}px` }}>{verse.number}</sup>
                <span>{getVerseText(verse)}</span>
                {idx < surah.verses.length - 1 && <span className="mr-2"> </span>}
              </span>
            ))}
          </p>
        </div>
      </div>
    );
  };

  const renderBlockView = () => {
    if (surah.verses.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#d4af37]/10 to-[#d4af37]/5 
            border border-[#d4af37]/20 flex items-center justify-center mx-auto mb-6">
            <Plus className="w-10 h-10 text-[#d4af37]/50" />
          </div>
          <h3 className="text-xl font-semibold text-[#e0e1dd] mb-2">
            Tiada Ayat Lagi
          </h3>
          <p className="text-[#778da9] mb-6">
            Surah ini masih kosong.
          </p>
          {userMode === 'admin' && (
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-to-r from-[#d4af37] to-[#b8960c] 
                hover:from-[#e5c048] hover:to-[#c9a71d] text-[#0d1b2a] font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Ayat Pertama
            </Button>
          )}
        </div>
      );
    }

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={surah.verses.map(v => v.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-6">
            {surah.verses.map((verse) => (
              <SortableVerseItem
                key={verse.id}
                verse={verse}
                userMode={userMode}
                translationMode={translationMode}
                onEdit={() => handleEditVerse(verse)}
                onDelete={() => handleDeleteVerse(verse.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-[#0d1b2a]/80 border-b border-[#d4af37]/20">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* Surah Title */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/10 
                  border border-[#d4af37]/30 text-[#d4af37] text-sm font-medium">
                  Surah {surah.number}
                </span>
                <span className="text-[#778da9] text-sm">
                  {surah.verses.length} Ayat
                </span>
              </div>
              <h1 className="text-4xl font-bold text-[#e0e1dd] mb-1"
                style={{ fontFamily: 'Amiri Quran, serif' }}>
                {surah.nameMalay}
              </h1>
              <p className="text-[#778da9] text-lg font-arabic">{surah.nameArabicRumi}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleCopyAll}
                variant="outline"
                className="border-[#d4af37]/30 text-[#e0e1dd] hover:bg-[#d4af37]/10 
                  hover:border-[#d4af37]/50 transition-all duration-300"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-400" />
                    <span className="text-green-400">Disalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2 text-[#d4af37]" />
                    Salin Semua
                  </>
                )}
              </Button>
              {userMode === 'admin' && (
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-to-r from-[#d4af37] to-[#b8960c] 
                    hover:from-[#e5c048] hover:to-[#c9a71d] text-[#0d1b2a] font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Ayat
                </Button>
              )}
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Translation Mode Tabs */}
            <Tabs value={translationMode} onValueChange={(v) => onTranslationModeChange(v as TranslationMode)}>
              <TabsList className="bg-[#1b263b]/50 border border-[#d4af37]/20 p-1">
                <TabsTrigger 
                  value="modern"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4af37] 
                    data-[state=active]:to-[#b8960c] data-[state=active]:text-[#0d1b2a]
                    text-[#778da9] px-6 py-2 transition-all duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Melayu Moden</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="classical"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4af37] 
                    data-[state=active]:to-[#b8960c] data-[state=active]:text-[#0d1b2a]
                    text-[#778da9] px-6 py-2 transition-all duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <Scroll className="w-4 h-4" />
                    <span>Melayu Klasik</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* View Mode Toggle */}
            <ToggleGroup 
              type="single" 
              value={viewMode}
              onValueChange={(v) => v && onViewModeChange(v as ViewMode)}
              className="bg-[#1b263b]/50 border border-[#d4af37]/20 p-1 rounded-lg"
            >
              <ToggleGroupItem 
                value="block" 
                aria-label="Paparan Blok"
                className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-[#d4af37] 
                  data-[state=on]:to-[#b8960c] data-[state=on]:text-[#0d1b2a]
                  text-[#778da9] px-4 py-2 transition-all duration-300"
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                <span>Blok</span>
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="continuous" 
                aria-label="Paparan Berterusan"
                className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-[#d4af37] 
                  data-[state=on]:to-[#b8960c] data-[state=on]:text-[#0d1b2a]
                  text-[#778da9] px-4 py-2 transition-all duration-300"
              >
                <AlignJustify className="w-4 h-4 mr-2" />
                <span>Berterusan</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>

      {/* Verses List */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {viewMode === 'continuous' ? renderContinuousView() : renderBlockView()}
        </div>
        
        {/* Bottom Spacing */}
        <div className="h-20" />
      </ScrollArea>

      {/* Add Verse Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent 
          className="max-w-2xl border-[#d4af37]/30"
          style={{ 
            background: 'linear-gradient(135deg, #1b263b 0%, #0d1b2a 100%)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-[#e0e1dd] flex items-center space-x-2">
              <Plus className="w-5 h-5 text-[#d4af37]" />
              <span>Tambah Ayat Baharu</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* Verse Number Indicator */}
            <div className="flex items-center justify-center">
              <div className="px-6 py-2 rounded-full bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/10 
                border border-[#d4af37]/30">
                <span className="text-[#d4af37] font-bold">Ayat ke-{getNextVerseNumber()}</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-[#778da9] mb-2 flex items-center space-x-2">
                {translationMode === 'modern' ? (
                  <>
                    <Clock className="w-4 h-4 text-[#d4af37]" />
                    <span>Terjemahan Melayu Moden</span>
                  </>
                ) : (
                  <>
                    <Scroll className="w-4 h-4 text-[#d4af37]" />
                    <span>Terjemahan Melayu Klasik</span>
                  </>
                )}
              </label>
              <Textarea
                value={newVerseText}
                onChange={(e) => setNewVerseText(e.target.value)}
                placeholder={`Masukkan terjemahan ${translationMode === 'modern' ? 'Melayu Moden' : 'Melayu Klasik'}...`}
                rows={4}
                className="bg-[#0d1b2a]/50 border-[#d4af37]/30 text-[#e0e1dd] 
                  placeholder:text-[#778da9]/50 focus:border-[#d4af37] resize-none"
              />
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="flex-1 border-[#d4af37]/30 text-[#e0e1dd] hover:bg-[#d4af37]/10"
              >
                Batal
              </Button>
              <Button 
                onClick={handleAddVerse}
                disabled={!newVerseText.trim()}
                className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#b8960c] 
                  hover:from-[#e5c048] hover:to-[#c9a71d] text-[#0d1b2a] font-semibold
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tambah Ayat
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Verse Dialog */}
      <Dialog open={!!editingVerse} onOpenChange={() => setEditingVerse(null)}>
        <DialogContent 
          className="max-w-2xl border-[#d4af37]/30"
          style={{ 
            background: 'linear-gradient(135deg, #1b263b 0%, #0d1b2a 100%)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-[#e0e1dd] flex items-center space-x-2">
              <Edit2 className="w-5 h-5 text-[#d4af37]" />
              <span>Sunting Ayat {editingVerse?.number}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div>
              <label className="text-sm text-[#778da9] mb-2 flex items-center space-x-2">
                {translationMode === 'modern' ? (
                  <>
                    <Clock className="w-4 h-4 text-[#d4af37]" />
                    <span>Terjemahan Melayu Moden</span>
                  </>
                ) : (
                  <>
                    <Scroll className="w-4 h-4 text-[#d4af37]" />
                    <span>Terjemahan Melayu Klasik</span>
                  </>
                )}
              </label>
              <Textarea
                value={editVerseText}
                onChange={(e) => setEditVerseText(e.target.value)}
                placeholder={`Masukkan terjemahan ${translationMode === 'modern' ? 'Melayu Moden' : 'Melayu Klasik'}...`}
                rows={4}
                className="bg-[#0d1b2a]/50 border-[#d4af37]/30 text-[#e0e1dd] 
                  placeholder:text-[#778da9]/50 focus:border-[#d4af37] resize-none"
              />
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={() => setEditingVerse(null)}
                className="flex-1 border-[#d4af37]/30 text-[#e0e1dd] hover:bg-[#d4af37]/10"
              >
                Batal
              </Button>
              <Button 
                onClick={handleSaveEdit}
                disabled={!editVerseText.trim()}
                className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#b8960c] 
                  hover:from-[#e5c048] hover:to-[#c9a71d] text-[#0d1b2a] font-semibold
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
