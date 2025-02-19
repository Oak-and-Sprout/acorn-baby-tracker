import { Baby, Gender } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';

interface BabyModalProps {
  open: boolean;
  onClose: () => void;
  isEditing: boolean;
  baby: Baby | null;
}

const defaultFormData = {
  firstName: '',
  lastName: '',
  birthDate: '',
  gender: '',
  inactive: false,
  feedWarningTime: '03:00',
  diaperWarningTime: '02:00',
};

export default function BabyModal({
  open,
  onClose,
  isEditing,
  baby,
}: BabyModalProps) {
  const [formData, setFormData] = useState(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or baby changes
  useEffect(() => {
    if (baby && open) {
      const birthDate = baby.birthDate instanceof Date 
        ? baby.birthDate.toISOString().split('T')[0]
        : new Date(baby.birthDate as string).toISOString().split('T')[0];

      setFormData({
        firstName: baby.firstName,
        lastName: baby.lastName,
        birthDate,
        gender: baby.gender || '',
        inactive: baby.inactive || false,
        feedWarningTime: baby.feedWarningTime || '03:00',
        diaperWarningTime: baby.diaperWarningTime || '02:00',
      });
    } else if (!open) {
      setFormData(defaultFormData);
    }
  }, [baby, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/baby', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id: baby?.id,
          birthDate: new Date(formData.birthDate),
          gender: formData.gender as Gender,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save baby');
      }

      onClose();
    } catch (error) {
      console.error('Error saving baby:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(defaultFormData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="dialog-content">
        <DialogHeader className="dialog-header">
          <DialogTitle className="dialog-title">
            {isEditing ? 'Edit Baby' : 'Add New Baby'}
          </DialogTitle>
          <DialogDescription className="dialog-description">
            {isEditing 
              ? "Update your baby's information" 
              : "Enter your baby's information to start tracking"
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">First Name</label>
              <Input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full"
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <label className="form-label">Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full"
                placeholder="Enter last name"
                required
              />
            </div>
          </div>
          <div>
            <label className="form-label">Birth Date</label>
            <Input
              type="date"
              value={formData.birthDate}
              onChange={(e) =>
                setFormData({ ...formData, birthDate: e.target.value })
              }
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="form-label">Gender</label>
            <Select
              value={formData.gender}
              onValueChange={(value) =>
                setFormData({ ...formData, gender: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Feed Warning Time (hh:mm)</label>
              <Input
                type="text"
                pattern="[0-9]{2}:[0-9]{2}"
                value={formData.feedWarningTime}
                onChange={(e) =>
                  setFormData({ ...formData, feedWarningTime: e.target.value })
                }
                className="w-full"
                placeholder="03:00"
                required
              />
            </div>
            <div>
              <label className="form-label">Diaper Warning Time (hh:mm)</label>
              <Input
                type="text"
                pattern="[0-9]{2}:[0-9]{2}"
                value={formData.diaperWarningTime}
                onChange={(e) =>
                  setFormData({ ...formData, diaperWarningTime: e.target.value })
                }
                className="w-full"
                placeholder="02:00"
                required
              />
            </div>
          </div>
          {isEditing && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="inactive"
                checked={formData.inactive}
                onChange={(e) =>
                  setFormData({ ...formData, inactive: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="inactive" className="text-sm text-gray-700">
                Mark as Inactive
              </label>
            </div>
          )}
          <div className="flex justify-end gap-3 mt-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="hover:bg-slate-50"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? 'Saving...' 
                : isEditing 
                  ? 'Save Changes' 
                  : 'Add Baby'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
