
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PlusCircle, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from './button';

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
}

interface AutocompleteInputProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'value' | 'onChange'> {
  id?: string;
  options: AutocompleteOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onCreateNew?: (inputValue: string) => Promise<string | null | undefined | void>;
  onEnterKey?: () => void;
}

export const AutocompleteInput = React.forwardRef<
  HTMLInputElement,
  AutocompleteInputProps
>(({
  id,
  options,
  value,
  onValueChange,
  placeholder,
  disabled,
  className,
  onCreateNew,
  onEnterKey,
  onFocus,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const internalInputRef = useRef<HTMLInputElement>(null);

  React.useImperativeHandle(ref, () => internalInputRef.current as HTMLInputElement);

  useEffect(() => {
    const selectedOption = options.find(option => option.value === value);
    setSearchText(selectedOption ? selectedOption.label : '');
  }, [value, options]);

  const filteredOptions = useMemo(() => {
    if (!searchText) return options;
    const lowercasedInput = searchText.toLowerCase();
    return options.filter(option =>
      option.label.toLowerCase().includes(lowercasedInput)
    );
  }, [searchText, options]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions]);

  const clearInput = () => {
    onValueChange('');
    setSearchText('');
    internalInputRef.current?.focus();
  };

  const selectOption = (selectedValue: string) => {
    onValueChange(selectedValue);
    setIsOpen(false);
    onEnterKey?.();
  };
  
  const createNewOption = async () => {
    if (onCreateNew && searchText) {
        const newId = await onCreateNew(searchText.trim());
        if (newId) {
            onValueChange(newId);
        }
    }
    setIsOpen(false);
    onEnterKey?.();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isOpen) {
        onEnterKey?.();
        return;
      }
      
      const showCreate = onCreateNew && searchText.trim() && !options.some(o => o.label.toLowerCase() === searchText.trim().toLowerCase());
      if (filteredOptions.length === 0 && !showCreate) return;

      if (highlightedIndex < filteredOptions.length) {
        selectOption(filteredOptions[highlightedIndex].value);
      } else if (showCreate) {
        createNewOption();
      }
      return;
    }

    if (!isOpen) return;

    const showCreate = onCreateNew && searchText.trim() && !options.some(o => o.label.toLowerCase() === searchText.trim().toLowerCase());
    const totalOptions = filteredOptions.length + (showCreate ? 1 : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (totalOptions > 0) setHighlightedIndex((prev) => (prev + 1) % totalOptions);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (totalOptions > 0) setHighlightedIndex((prev) => (prev - 1 + totalOptions) % totalOptions);
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchText = e.target.value;
    setSearchText(newSearchText);
    
    if (newSearchText === '') {
        onValueChange(''); 
    }

    if (!isOpen && newSearchText) {
      setIsOpen(true);
    } else if (isOpen && !newSearchText && filteredOptions.length === options.length) {
      setIsOpen(false);
    }
  }
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
    if(options.length > 0) setIsOpen(true); 
    onFocus?.(e);
  }

  const handleBlur = () => {
    // Timeout to allow click event to register before blurring
    setTimeout(() => {
        const selectedOption = options.find(option => option.value === value);
        if (searchText !== (selectedOption?.label || '')) {
            setSearchText(selectedOption ? selectedOption.label : '');
        }
        setIsOpen(false);
    }, 150);
  };
  
  const showCreateOption = onCreateNew && searchText.trim().length > 0 && !options.some(o => o.label.toLowerCase() === searchText.trim().toLowerCase());

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
            <Input
              id={id}
              ref={internalInputRef}
              value={searchText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={disabled}
              className={cn("w-full pr-8", className)}
              autoComplete="off"
              {...props}
            />
            {searchText && (
                <Button
                    type="button"
                    aria-label="Clear input"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        clearInput();
                    }}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
      </PopoverTrigger>
      
      <PopoverContent 
          className="w-[--radix-popover-trigger-width] p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
            <ScrollArea className="max-h-60">
              <div className="p-1">
                {filteredOptions.map((option, index) => (
                    <div
                      key={option.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectOption(option.value);
                      }}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none",
                        highlightedIndex === index && "bg-accent text-accent-foreground"
                      )}
                    >
                      <div className="flex flex-col items-start">
                        <span className="truncate">{option.label}</span>
                        {option.description && (
                          <span className="text-xs opacity-90">{option.description}</span>
                        )}
                      </div>
                    </div>
                ))}

                {showCreateOption && (
                  <div
                    onMouseDown={(e) => {
                      e.preventDefault();
                      createNewOption();
                    }}
                    className={cn(
                      "flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none text-primary",
                      highlightedIndex === filteredOptions.length && "bg-accent text-accent-foreground"
                    )}
                  >
                    <PlusCircle className="mr-2 h-4 w-4 inline" />
                    Crear "{searchText.trim()}"
                  </div>
                )}

                {filteredOptions.length === 0 && !showCreateOption && (
                   <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No se encontraron resultados.
                  </div>
                )}
              </div>
            </ScrollArea>
        </PopoverContent>
    </Popover>
  );
});
AutocompleteInput.displayName = "AutocompleteInput";
