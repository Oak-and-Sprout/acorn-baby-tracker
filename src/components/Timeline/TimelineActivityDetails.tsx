import { Button } from '@/src/components/ui/button';
import { Trash2, Pencil } from 'lucide-react';
import {
  FormPage,
  FormPageContent,
  FormPageFooter
} from '@/src/components/ui/form-page';
import { TimelineActivityDetailsProps } from './types';
import { getActivityDetails } from './utils';
import { useTheme } from '@/src/context/theme';
import './timeline-activity-details.css';

const TimelineActivityDetails = ({
  activity,
  settings,
  isOpen,
  onClose,
  onDelete,
  onEdit,
}: TimelineActivityDetailsProps) => {
  const { theme } = useTheme();
  
  if (!activity) return null;

  const activityDetails = getActivityDetails(activity, settings);
  
  const handleEdit = () => {
    if (activity) {
      // Check for pump activity first since it can also have duration
      if ('leftAmount' in activity || 'rightAmount' in activity) {
        onEdit(activity, 'pump');
      }
      else if ('duration' in activity) onEdit(activity, 'sleep');
      else if ('amount' in activity) onEdit(activity, 'feed');
      else if ('condition' in activity) onEdit(activity, 'diaper');
      else if ('content' in activity) onEdit(activity, 'note');
      else if ('soapUsed' in activity) onEdit(activity, 'bath');
      else if ('title' in activity && 'category' in activity) onEdit(activity, 'milestone');
      else if ('value' in activity && 'unit' in activity) onEdit(activity, 'measurement');
    }
  };

  return (
    <FormPage 
      isOpen={isOpen} 
      onClose={onClose}
      title={activityDetails.title}
    >
      <FormPageContent>
        <div className="space-y-4 p-4">
          {activityDetails.details.map((detail, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 timeline-details-label">{detail.label}:</span>
              <span className="text-sm text-gray-900 dark:text-gray-200 timeline-details-value">{detail.value}</span>
            </div>
          ))}
        </div>
      </FormPageContent>
      <FormPageFooter>
        <div className="flex justify-between w-full px-4 py-2">
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => onDelete(activity)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={handleEdit}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </FormPageFooter>
    </FormPage>
  );
};

export default TimelineActivityDetails;
