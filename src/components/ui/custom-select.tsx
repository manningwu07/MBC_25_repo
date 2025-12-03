'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface Option {
  name: string;
  address: string;
}

interface CustomSelectProps {
  options: Option[];
  placeholder?: string;
  onSelect: (address: string) => void;
}

export function CustomSelect({ options, placeholder = "Select Wallet...", onSelect }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Option | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (opt: Option) => {
    setSelected(opt);
    setIsOpen(false);
    onSelect(opt.address);
  };

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black/50 border border-white/20 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-[#14F195]/50 transition-colors"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="p-1.5 bg-[#14F195]/10 rounded-full text-[#14F195]">
            <Wallet size={14} />
          </div>
          <span className={clsx("text-sm truncate", selected ? "text-white" : "text-gray-400")}>
            {selected ? selected.name : placeholder}
          </span>
        </div>
        <ChevronDown size={16} className={clsx("text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#1A1D2D] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl"
          >
            {options.map((opt) => (
              <div
                key={opt.address}
                onClick={() => handleSelect(opt)}
                className="p-3 hover:bg-white/5 cursor-pointer flex items-center justify-between group"
              >
                <div>
                    <p className="text-sm text-gray-200 font-medium group-hover:text-white">{opt.name}</p>
                    <p className="text-[10px] text-gray-500 font-mono truncate max-w-[180px]">{opt.address}</p>
                </div>
                {selected?.address === opt.address && <Check size={14} className="text-[#14F195]" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}