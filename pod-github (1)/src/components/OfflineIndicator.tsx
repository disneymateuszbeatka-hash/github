import React from 'react';
import { useOnlineStatus } from '../utils/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600/95 text-white px-4 py-2.5 shadow-xl border border-amber-400/40 backdrop-blur-md animate-bounce">
      <span className="p-1 rounded-lg bg-black/20">
        <WifiOff className="w-4 h-4 text-amber-100" />
      </span>
      <div className="text-xs">
        <span className="font-bold block">Tryb Offline aktywny</span>
        <span className="text-[11px] text-amber-100">
          Wszystkie wpisy są zapisywane w pamięci urządzenia.
        </span>
      </div>
    </div>
  );
}
