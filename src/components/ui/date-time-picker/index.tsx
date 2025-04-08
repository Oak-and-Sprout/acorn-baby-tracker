'use client';

import React, { useState, useEffect, useRef } from 'react';
import './date-time-picker.css';
import { Calendar } from '@/src/components/ui/calendar';
import { TimeEntry } from '@/src/components/ui/time-entry';
import { cn } from '@/src/lib/utils';
import { format, isValid } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover';

// Import types and styles
import { DateTimePickerProps } from './date-time-picker.types';
import {
  dateTimePickerContainerStyles,
  dateTimePickerButtonStyles,
  dateTimePickerPopoverContentStyles,
  dateTimePickerCalendarContainerStyles,
  dateTimePickerTimeContainerStyles,
  dateTimePickerFooterStyles,
  dateTimePickerDoneButtonStyles,
} from './date-time-picker.styles';

/**
 * DateTimePicker Component
 * 
 * A component that combines the Calendar for date selection and TimeEntry for time selection,
 * using two separate buttons with popovers.
 * 
 * Features:
 * - Two buttons for date and time selection
 * - Calendar component for date selection in a popover
 * - TimeEntry component for time selection in a popover with a done button
 * - Fixed dimensions for both popovers (360px height, 350px width)
 * - Bottom-aware positioning with margin
 */
export function DateTimePicker({
  value,
  onChange,
  className,
  disabled = false,
  placeholder = "Select date and time...",
}: DateTimePickerProps) {
  // Ensure we have a valid date
  const [date, setDate] = useState<Date>(() => {
    // Check if value is a valid Date
    if (value instanceof Date && isValid(value)) {
      return value;
    }
    // Fallback to current date
    return new Date();
  });
  
  // State for popovers
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  
  // Update the date when the value prop changes
  useEffect(() => {
    if (value instanceof Date && isValid(value)) {
      setDate(value);
    }
  }, [value]);
  
  // Handle date selection from Calendar
  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    
    // Create a new date with the selected date but keep the time from the current value
    const updatedDate = new Date(newDate);
    updatedDate.setHours(date.getHours());
    updatedDate.setMinutes(date.getMinutes());
    updatedDate.setSeconds(0);
    updatedDate.setMilliseconds(0);
    
    setDate(updatedDate);
    onChange(updatedDate);
    
    // Close the date popover when a date is selected
    setDateOpen(false);
  };
  
  // Handle time change from TimeEntry
  const handleTimeChange = (newDate: Date) => {
    setDate(newDate);
    onChange(newDate);
  };
  
  // Format the date for display
  const formatDate = (date: Date | null): string => {
    if (!date || !isValid(date)) return 'Select date';
    try {
      return format(date, 'MMM d, yyyy'); // e.g., "Apr 7, 2025"
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Select date';
    }
  };
  
  // Format the time for display
  const formatTime = (date: Date | null): string => {
    if (!date || !isValid(date)) return 'Select time';
    try {
      return format(date, 'h:mm a'); // e.g., "1:55 PM"
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Select time';
    }
  };
  
  // Handle done button click for time selection
  const handleTimeDone = () => {
    setTimeOpen(false);
  };
  
  return (
    <div className={cn(dateTimePickerContainerStyles, "date-time-picker-container", className)}>
      {/* Date Button with Popover */}
      <Popover open={dateOpen} onOpenChange={setDateOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(dateTimePickerButtonStyles, "date-time-picker-button")}
            disabled={disabled}
          >
            <CalendarIcon className="h-4 w-4 date-time-picker-calendar-icon" />
            <span>{formatDate(date)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className={cn(dateTimePickerPopoverContentStyles, "date-time-picker-popover")}
          align="start"
          sideOffset={4}
        >
          <div className={dateTimePickerCalendarContainerStyles}>
            <Calendar
              selected={date}
              onSelect={handleDateSelect}
              isDateDisabled={disabled ? () => true : undefined}
              initialFocus
              variant="date-time-picker"
              className="mx-auto"
            />
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Time Button with Popover */}
      <Popover open={timeOpen} onOpenChange={setTimeOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(dateTimePickerButtonStyles, "date-time-picker-button")}
            disabled={disabled}
          >
            <Clock className="h-4 w-4 date-time-picker-clock-icon" />
            <span>{formatTime(date)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className={cn(dateTimePickerPopoverContentStyles, "date-time-picker-popover")}
          align="start"
          sideOffset={4}
        >
          <div className={dateTimePickerTimeContainerStyles}>
            <TimeEntry
              value={date}
              onChange={handleTimeChange}
              disabled={disabled}
              className="mx-auto w-full"
            />
          </div>
          
          {/* Footer with done button */}
          <div className={cn(dateTimePickerFooterStyles, "date-time-picker-footer")}>
            <Button
              variant="default"
              size="sm"
              onClick={handleTimeDone}
              className={cn(dateTimePickerDoneButtonStyles, "date-time-picker-done-button")}
            >
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DateTimePicker;
