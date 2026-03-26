import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => boolean;
}

export function LoginDialog({ isOpen, onClose, onLogin }: LoginDialogProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Clear fields when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setUsername('');
      setPassword('');
      setError('');
      setShowPassword(false);
    }
  }, [isOpen]);

  // Clear error when user types in either field
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Sila masukkan nama pengguna dan kata laluan');
      return;
    }

    const success = onLogin(username.trim(), password.trim());
    if (success) {
      setUsername('');
      setPassword('');
      onClose();
    } else {
      setError('Nama pengguna atau kata laluan tidak sah');
    }
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setError('');
    setShowPassword(false);
    onClose();
  };

  // Check if both fields are filled
  const isFormValid = username.trim() !== '' && password.trim() !== '';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <DialogContent 
        className="max-w-md border-[#d4af37]/30"
        style={{ 
          background: 'linear-gradient(135deg, #1b263b 0%, #0d1b2a 100%)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-[#e0e1dd] text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 
                border border-[#d4af37]/30 flex items-center justify-center">
                <Lock className="w-8 h-8 text-[#d4af37]" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Mod Pentadbir</h2>
                <p className="text-sm text-[#778da9] font-normal mt-1">
                  Log masuk untuk menguruskan kandungan
                </p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="text-sm text-[#778da9] mb-2 block">Nama Pengguna</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#778da9]" />
              <Input
                value={username}
                onChange={handleUsernameChange}
                placeholder="Masukkan nama pengguna"
                className="pl-10 bg-[#0d1b2a]/50 border-[#d4af37]/30 text-[#e0e1dd] 
                  placeholder:text-[#778da9]/50 focus:border-[#d4af37]"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm text-[#778da9] mb-2 block">Kata Laluan</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#778da9]" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Masukkan kata laluan"
                className="pl-10 pr-10 bg-[#0d1b2a]/50 border-[#d4af37]/30 text-[#e0e1dd] 
                  placeholder:text-[#778da9]/50 focus:border-[#d4af37]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#778da9] hover:text-[#d4af37] transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-2">
            <Button 
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-[#d4af37]/30 text-[#e0e1dd] hover:bg-[#d4af37]/10"
            >
              Batal
            </Button>
            <Button 
              type="submit"
              disabled={!isFormValid}
              className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#b8960c] 
                hover:from-[#e5c048] hover:to-[#c9a71d] text-[#0d1b2a] font-semibold
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Log Masuk
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}