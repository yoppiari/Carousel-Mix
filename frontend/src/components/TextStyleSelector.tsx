import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextStyleOption {
  value: string;
  label: string;
  previewText: string;
  className: string;
  dropdownClass: string;
}

interface TextStyleSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  options: TextStyleOption[];
  className?: string;
}

export default function TextStyleSelector({
  value,
  onValueChange,
  options,
  className
}: TextStyleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    } else if (isOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      const currentIndex = options.findIndex(option => option.value === value);
      const nextIndex = event.key === 'ArrowDown'
        ? Math.min(currentIndex + 1, options.length - 1)
        : Math.max(currentIndex - 1, 0);

      onValueChange(options[nextIndex].value);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={cn("relative", className)}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input",
          "bg-background px-3 py-2 text-sm ring-offset-background",
          "placeholder:text-muted-foreground focus:outline-none focus:ring-2",
          "focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "hover:bg-accent hover:text-accent-foreground transition-colors"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          {selectedOption ? (
            <span className={cn("style-preview", selectedOption.dropdownClass)}>
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-muted-foreground">Select a style...</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 opacity-50 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={cn(
          "absolute top-full mt-1 w-full z-50 min-w-[8rem] overflow-hidden",
          "rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
          "animate-in fade-in-0 zoom-in-95"
        )}>
          <div className="max-h-64 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center",
                  "rounded-sm px-2 py-3 text-sm outline-none transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground",
                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  option.value === value && "bg-accent text-accent-foreground"
                )}
              >
                {/* Style Preview Container */}
                <div className="flex flex-col items-start gap-1 w-full">
                  <span className="text-xs text-muted-foreground">
                    {option.label}
                  </span>
                  <span
                    className={cn(
                      "style-preview text-dropdown-preview",
                      option.dropdownClass
                    )}
                  >
                    {option.previewText}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}