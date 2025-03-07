import { ReactNode } from 'react';
import { SleepLogResponse, FeedLogResponse, DiaperLogResponse, MoodLogResponse, NoteResponse } from '@/app/api/types';

export type ActivityType = SleepLogResponse | FeedLogResponse | DiaperLogResponse | MoodLogResponse | NoteResponse;

export type ActivityTileVariant = 'sleep' | 'feed' | 'diaper' | 'note' | 'default';

export interface ActivityTileProps {
  /**
   * The activity data to display
   */
  activity: ActivityType;
  
  /**
   * Optional callback when the activity tile is clicked
   */
  onClick?: () => void;
  
  /**
   * Optional custom icon to display
   */
  icon?: ReactNode;
  
  /**
   * Optional custom title to display
   */
  title?: string;
  
  /**
   * Optional custom description to display
   */
  description?: string;
  
  /**
   * Optional variant to override the default styling based on activity type
   */
  variant?: ActivityTileVariant;
  
  /**
   * Optional additional CSS classes
   */
  className?: string;
}

export interface ActivityTileIconProps {
  /**
   * The activity data to determine the icon
   */
  activity: ActivityType;
  
  /**
   * Optional additional CSS classes
   */
  className?: string;
}

export interface ActivityTileContentProps {
  /**
   * The activity data to display
   */
  activity: ActivityType;
  
  /**
   * Optional custom title to display
   */
  title?: string;
  
  /**
   * Optional custom description to display
   */
  description?: string;
  
  /**
   * Optional additional CSS classes
   */
  className?: string;
}
