"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PlusCircle, Trash2, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from "@/components/ui/badge";

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
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
  onOptionAction?: (option: AutocompleteOption) => void;
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
  onBlur,
  onOptionAction,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  const internalInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  React.useImperativeHandle(ref, () => internalInputRef.current as HTMLInputElement);

  useEffect(() => {
    const selectedOption = options.find(option => option.value === value);
    setSearchText(selectedOption ? selectedOption.label : '');
  }, [value, options]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = useMemo(() => {
    if (!searchText) return [];
    const lowercasedInput = searchText.toLowerCase();
    return options.filter(option =>
      option.label.toLowerCase().includes(lowercasedInput)
    );
  }, [searchText, options]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions]);

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
    
    if (newSearchText.trim().length > 0) {
        setIsOpen(true);
    } else {
        setIsOpen(false);
    }

    if (value && options.find(o => o.value === value)?.label !== newSearchText) {
      onValueChange('');
    }
  }
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (searchText.trim().length > 0) {
        setIsOpen(true);
    }
    onFocus?.(e);
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
        const selectedOption = options.find(option => option.value === value);
        setSearchText(selectedOption ? selectedOption.label : '');
        setIsOpen(false);
      }
    }, 150);
    onBlur?.(e);
  };
  
  const showCreateOption = onCreateNew && searchText.trim().length > 0 && !options.some(o => o.label.toLowerCase() === searchText.trim().toLowerCase());
  const hasContentToShow = filteredOptions.length > 0 || showCreateOption;

  return (
    <div className="relative w-full" ref={containerRef}>
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
          className={cn("w-full", searchText && !disabled && "pr-10", className)}
          autoComplete="off"
          {...props}
        />
        {searchText && !disabled && (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors z-10"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onValueChange('');
              setSearchText('');
              setIsOpen(false);
              internalInputRef.current?.focus();
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isOpen && hasContentToShow && (
            <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
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
                          "flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                          highlightedIndex === index ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        )}
                      >
                        <div className="flex flex-col items-start min-w-0">
                          <div className="flex items-center gap-2 w-full">
                            <span className="truncate">{option.label}</span>
                            {option.badge && (
                              <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-bold uppercase rounded-full shrink-0">
                                {option.badge}
                              </Badge>
                            )}
                          </div>
                          {option.description && (
                            <span className={cn(
                              "text-xs transition-colors truncate w-full",
                              highlightedIndex === index ? "text-primary-foreground/90" : "text-muted-foreground"
                            )}>{option.description}</span>
                          )}
                        </div>
                        {onOptionAction && (
                            <button
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    onOptionAction(option);
                                }}
                                className={cn(
                                  "p-1.5 rounded-full transition-all shadow-sm bg-destructive text-white hover:bg-destructive/90 ml-2"
                                )}
                            >
                                <Trash2 className="h-3.5 w-3.5"/>
                            </button>
                        )}
                      </div>
                  ))}

                  {showCreateOption && (
                    <div
                      onMouseDown={(e) => {
                        e.preventDefault();
                        createNewOption();
                      }}
                      className={cn(
                        "flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors font-bold",
                        highlightedIndex === filteredOptions.length 
                          ? "bg-primary text-primary-foreground" 
                          : "text-primary hover:bg-muted"
                      )}
                    >
                      <PlusCircle className="mr-2 h-4 w-4 inline" />
                      Crear "{searchText.trim()}"
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
        )}
    </div>
  );
});
AutocompleteInput.displayName = "AutocompleteInput";