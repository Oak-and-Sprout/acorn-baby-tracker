'use client';

import React, { useState, useEffect } from 'react';
import { SleepType, SleepQuality } from '@prisma/client';
import { SleepLogResponse } from '@/app/api/types';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { 
  FormPage, 
  FormPageContent, 
  FormPageFooter 
} from '@/src/components/ui/form-page';
import { useTimezone } from '@/app/context/timezone';

interface SleepFormProps {
  isOpen: boolean;
  onClose: () => void;
  isSleeping: boolean;
  onSleepToggle: () => void;
  babyId: string | undefined;
  initialTime: string;
  activity?: SleepLogResponse;
  onSuccess?: () => void;
}

export default function SleepForm({
  isOpen,
  onClose,
  isSleeping,
  onSleepToggle,
  babyId,
  initialTime,
  activity,
  onSuccess,
}: SleepFormProps) {
  const { formatDate, calculateDurationMinutes, toUTCString } = useTimezone();
  const [formData, setFormData] = useState({
    startTime: initialTime,
    endTime: '',
    type: '' as SleepType | '',
    location: '',
    quality: '' as SleepQuality | '',
  });
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Format date string to be compatible with datetime-local input
  const formatDateForInput = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    // Format as YYYY-MM-DDThh:mm in local time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (isOpen && !isInitialized) {
      if (activity) {
        // Editing mode - populate with activity data
        setFormData({
          startTime: formatDateForInput(activity.startTime),
          endTime: activity.endTime ? formatDateForInput(activity.endTime) : '',
          type: activity.type,
          location: activity.location || '',
          quality: activity.quality || '',
        });
        
        // Mark as initialized
        setIsInitialized(true);
      } else if (isSleeping && babyId) {
        // Ending sleep mode - fetch current sleep
        const fetchCurrentSleep = async () => {
          try {
            // Get auth token from localStorage
            const authToken = localStorage.getItem('authToken');

            const response = await fetch(`/api/sleep-log?babyId=${babyId}`, {
              headers: {
                'Authorization': authToken ? `Bearer ${authToken}` : ''
              }
            });
            if (!response.ok) return;
            
            const data = await response.json();
            if (!data.success) return;
            
            // Find the most recent sleep record without an end time
            const currentSleep = data.data.find((log: SleepLogResponse) => !log.endTime);
            if (currentSleep) {
                setFormData(prev => ({
                  ...prev,
                  startTime: formatDateForInput(currentSleep.startTime),
                  endTime: formatDateForInput(initialTime),
                  type: currentSleep.type,
                  location: currentSleep.location || '',
                  quality: 'GOOD', // Default to GOOD when ending sleep
                }));
            }
            
            // Mark as initialized
            setIsInitialized(true);
          } catch (error) {
            console.error('Error fetching current sleep:', error);
            // Mark as initialized even on error to prevent infinite retries
            setIsInitialized(true);
          }
        };
        fetchCurrentSleep();
      } else {
        // Starting new sleep
        setFormData(prev => ({
          ...prev,
          startTime: formatDateForInput(initialTime),
          endTime: isSleeping ? formatDateForInput(initialTime) : '',
          type: prev.type || 'NAP', // Default to NAP if not set
          location: prev.location,
          quality: isSleeping ? 'GOOD' : prev.quality,
        }));
        
        // Mark as initialized
        setIsInitialized(true);
      }
    } else if (!isOpen) {
      // Reset initialization flag and form when modal closes
      setIsInitialized(false);
      setFormData({
        startTime: initialTime,
        endTime: '',
        type: '' as SleepType | '',
        location: '',
        quality: '' as SleepQuality | '',
      });
    }
  }, [isOpen, initialTime, isSleeping, babyId, activity?.id, isInitialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!babyId) return;

    // Validate required fields
    if (!formData.type || !formData.startTime || (isSleeping && !formData.endTime)) {
      console.error('Required fields missing');
      return;
    }

    setLoading(true);

    try {
      // Convert local times to UTC ISO strings using the timezone context
      const localStartDate = new Date(formData.startTime);
      const utcStartTime = toUTCString(localStartDate);
      
      // Only convert end time if it exists
      let utcEndTime = null;
      if (formData.endTime) {
        const localEndDate = new Date(formData.endTime);
        utcEndTime = toUTCString(localEndDate);
      }
      
      console.log('Original start time (local):', formData.startTime);
      console.log('Converted start time (UTC):', utcStartTime);
      if (utcEndTime) {
        console.log('Original end time (local):', formData.endTime);
        console.log('Converted end time (UTC):', utcEndTime);
      }
      
      // Calculate duration using the timezone context if both start and end times are provided
      const duration = utcEndTime ? 
        calculateDurationMinutes(utcStartTime, utcEndTime) : 
        null;

      let response;
      
      if (activity) {
        // Editing mode - update existing record
        const payload = {
          startTime: utcStartTime,
          endTime: utcEndTime,
          duration,
          type: formData.type,
          location: formData.location || null,
          quality: formData.quality || null,
        };

        // Get auth token from localStorage
        const authToken = localStorage.getItem('authToken');

        response = await fetch(`/api/sleep-log?id=${activity.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken ? `Bearer ${authToken}` : '',
          },
          body: JSON.stringify(payload),
        });
      } else if (isSleeping) {
        // Ending sleep - update existing record
        // Get auth token from localStorage
        const authToken = localStorage.getItem('authToken');

        const sleepResponse = await fetch(`/api/sleep-log?babyId=${babyId}`, {
          headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : ''
          }
        });
        if (!sleepResponse.ok) throw new Error('Failed to fetch sleep logs');
        const sleepData = await sleepResponse.json();
        if (!sleepData.success) throw new Error('Failed to fetch sleep logs');
        
        const currentSleep = sleepData.data.find((log: SleepLogResponse) => !log.endTime);
        if (!currentSleep) throw new Error('No ongoing sleep record found');

        response = await fetch(`/api/sleep-log?id=${currentSleep.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken ? `Bearer ${authToken}` : '',
          },
          body: JSON.stringify({
            endTime: utcEndTime,
            duration,
            quality: formData.quality || null,
          }),
        });
      } else {
        // Starting new sleep
        const payload = {
          babyId,
          startTime: utcStartTime,
          endTime: null,
          duration: null,
          type: formData.type,
          location: formData.location || null,
          quality: null,
        };

        // Get auth token from localStorage
        const authToken = localStorage.getItem('authToken');

        response = await fetch('/api/sleep-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken ? `Bearer ${authToken}` : '',
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save sleep log');
      }

      onClose();
      if (!activity) onSleepToggle(); // Only toggle sleep state when not editing
      onSuccess?.();
      
      // Reset form data
      setFormData({
        startTime: initialTime,
        endTime: '',
        type: '' as SleepType | '',
        location: '',
        quality: '' as SleepQuality | '',
      });
    } catch (error) {
      console.error('Error saving sleep log:', error);
    } finally {
      setLoading(false);
    }
  };

  const isEditMode = !!activity;
  const title = isEditMode ? 'Edit Sleep Record' : (isSleeping ? 'End Sleep Session' : 'Start Sleep Session');
  const description = isEditMode 
    ? 'Update sleep record details'
    : (isSleeping ? 'Record when your baby woke up and how well they slept' : 'Record when your baby is going to sleep');

  return (
    <FormPage
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
    >
      <form onSubmit={handleSubmit}>
        <FormPageContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Start Time</label>
                <Input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full"
                  required
                  tabIndex={-1}
                  disabled={(isSleeping && !isEditMode) || loading} // Only disabled when ending sleep and not editing
                />
              </div>
              {(isSleeping || isEditMode) && (
                <div>
                  <label className="form-label">End Time</label>
                  <Input
                    type="datetime-local"
                    value={formData.endTime || initialTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full"
                    required={isSleeping}
                    tabIndex={-1}
                    disabled={loading}
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value: SleepType) =>
                    setFormData({ ...formData, type: value })
                  }
                  disabled={(isSleeping && !isEditMode) || loading} // Only disabled when ending sleep and not editing
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAP">Nap</SelectItem>
                    <SelectItem value="NIGHT_SLEEP">Night Sleep</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="form-label">Location</label>
                <Select
                  value={formData.location}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, location: value })
                  }
                  disabled={(isSleeping && !isEditMode) || loading} // Only disabled when ending sleep and not editing
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Crib">Crib</SelectItem>
                    <SelectItem value="Car Seat">Car Seat</SelectItem>
                    <SelectItem value="Parents Room">Parents Room</SelectItem>
                    <SelectItem value="Contact">Contact</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(isSleeping || (isEditMode && formData.endTime)) && (
              <div>
                <label className="form-label">Sleep Quality</label>
                <Select
                  value={formData.quality}
                  onValueChange={(value: SleepQuality) =>
                    setFormData({ ...formData, quality: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="How well did they sleep?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POOR">Poor</SelectItem>
                    <SelectItem value="FAIR">Fair</SelectItem>
                    <SelectItem value="GOOD">Good</SelectItem>
                    <SelectItem value="EXCELLENT">Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </FormPageContent>
        <FormPageFooter>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={loading}
            >
              {isEditMode ? 'Update Sleep' : (isSleeping ? 'End Sleep' : 'Start Sleep')}
            </Button>
          </div>
        </FormPageFooter>
      </form>
    </FormPage>
  );
}
