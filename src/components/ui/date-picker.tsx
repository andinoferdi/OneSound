'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  format?: string;
  withInput?: boolean;
}

function formatDate(date: Date | undefined, formatStr: string = 'PPP') {
  if (!date) {
    return '';
  }
  return format(date, formatStr);
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled = false,
  className,
  format: displayFormat = 'PPP',
  withInput = false
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [month, setMonth] = React.useState<Date | undefined>(value || new Date());
  const [inputValue, setInputValue] = React.useState(formatDate(value, displayFormat));

  React.useEffect(() => {
    if (value !== date) {
      setDate(value);
      setInputValue(formatDate(value, displayFormat));
      if (value) {
        setMonth(value);
      }
    }
  }, [value, date, displayFormat]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setInputValue(formatDate(selectedDate, displayFormat));
    setOpen(false);
    onChange?.(selectedDate);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    try {
      if (newValue) {
        let parsedDate: Date | undefined;
        const dateMatch = newValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (dateMatch) {
          const year = parseInt(dateMatch[1], 10);
          const month = parseInt(dateMatch[2], 10) - 1;
          const day = parseInt(dateMatch[3], 10);
          parsedDate = new Date(year, month, day);
        } else {
          parsedDate = new Date(newValue);
        }
        if (isValidDate(parsedDate)) {
          setDate(parsedDate);
          setMonth(parsedDate);
          onChange?.(parsedDate);
        }
      } else {
        setDate(undefined);
        onChange?.(undefined);
      }
    } catch {
    }
  };

  const handleInputBlur = () => {
    if (date) {
      setInputValue(formatDate(date, displayFormat));
    } else {
      setInputValue('');
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
    }
  };

  if (withInput) {
    return (
      <div className={cn('relative', className)}>
        <Input
          value={inputValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          disabled={disabled}
          className='pr-10'
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              disabled={disabled}
              className='absolute top-0 right-0 h-full px-3 hover:bg-transparent'>
              <CalendarIcon className='text-muted-foreground h-4 w-4' />
              <span className='sr-only'>Open calendar</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              mode='single'
              selected={date}
              onSelect={handleDateSelect}
              month={month}
              onMonthChange={setMonth}
              captionLayout='dropdown'
              startMonth={new Date(1970, 0)}
              endMonth={new Date(2050, 11)}
              disabled={disabled}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Button-only version (original Shadcn style)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          disabled={disabled}
          className={cn('w-[280px] justify-start text-left font-normal', !date && 'text-muted-foreground', className)}>
          <CalendarIcon className='mr-2 h-4 w-4' />
          {date ? formatDate(date, displayFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={handleDateSelect}
          month={month}
          onMonthChange={setMonth}
          captionLayout='dropdown'
          startMonth={new Date(1970, 0)}
          endMonth={new Date(2050, 11)}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}

// Export additional variants for specific use cases
export function DatePickerButton(props: Omit<DatePickerProps, 'withInput'>) {
  return <DatePicker {...props} withInput={false} />;
}

export function DatePickerInput(props: Omit<DatePickerProps, 'withInput'>) {
  return <DatePicker {...props} withInput={true} />;
}
