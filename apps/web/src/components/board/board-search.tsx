'use client';

import { useRef } from 'react';
import { Search, X } from 'lucide-react';

interface BoardSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function BoardSearch({ value, onChange }: BoardSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex items-center">
      <div className="flex h-9 w-48 items-center rounded-md border border-border bg-muted/40 px-2.5 gap-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-background transition-all">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          role="searchbox"
          aria-label="Search tasks"
          placeholder="Search tasks..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-full flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
