import { Baby } from '@prisma/client';

/**
 * Types for the BabyQuickInfo component
 */

/**
 * Tab types
 */
export type Tab = 'notifications' | 'contacts' | 'stats';

/**
 * Props for the BabyQuickInfo component
 */
export interface BabyQuickInfoProps {
  /**
   * Whether the form is open
   */
  isOpen: boolean;
  
  /**
   * Function to call when the form should be closed
   */
  onClose: () => void;
  
  /**
   * The currently selected baby
   */
  selectedBaby: Baby | null;
  
  /**
   * Function to calculate the age of a baby
   */
  calculateAge?: (birthDate: Date) => string;
}

/**
 * Props for the NotificationsTab component
 */
export interface NotificationsTabProps {
  /**
   * Last activities data for the baby
   */
  lastActivities: any;
  
  /**
   * Upcoming events data for the baby
   */
  upcomingEvents: any[];
  
  /**
   * The currently selected baby
   */
  selectedBaby: Baby;
}

/**
 * Props for the ContactsTab component
 */
export interface ContactsTabProps {
  /**
   * Contacts data
   */
  contacts: any[];
  
  /**
   * The currently selected baby
   */
  selectedBaby: Baby;
}

/**
 * Props for the StatsTab component
 */
export interface StatsTabProps {
  /**
   * Activities data for the baby
   */
  activities: any[];
  
  /**
   * The currently selected baby
   */
  selectedBaby: Baby;
  
  /**
   * Function to calculate the age of a baby
   */
  calculateAge?: (birthDate: Date) => string;
}

/**
 * Last activities data structure
 */
export interface LastActivitiesData {
  lastDiaper: {
    id: string;
    time: string;
    type: string;
    condition: string;
    caretakerName?: string;
  } | null;
  
  lastBath: {
    id: string;
    time: string;
    soapUsed: boolean;
    caretakerName?: string;
  } | null;
  
  lastMeasurements: {
    height: {
      id: string;
      date: string;
      value: number;
      unit: string;
      caretakerName?: string;
    } | null;
    
    weight: {
      id: string;
      date: string;
      value: number;
      unit: string;
      caretakerName?: string;
    } | null;
    
    headCircumference: {
      id: string;
      date: string;
      value: number;
      unit: string;
      caretakerName?: string;
    } | null;
  };
  
  lastNote: {
    id: string;
    time: string;
    content: string;
    caretakerName?: string;
  } | null;
}
