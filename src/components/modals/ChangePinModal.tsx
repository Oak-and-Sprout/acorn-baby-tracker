'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ChangePinModalProps {
  open: boolean;
  onClose: () => void;
  currentPin: string;
  onPinChange: (newPin: string) => void;
}

export default function ChangePinModal({
  open,
  onClose,
  currentPin,
  onPinChange,
}: ChangePinModalProps) {
  const [step, setStep] = useState<'verify' | 'new' | 'confirm'>('verify');
  const [verifyPin, setVerifyPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleVerifyPin = () => {
    if (verifyPin === currentPin) {
      setStep('new');
      setError('');
    } else {
      setError('Incorrect PIN');
      setVerifyPin('');
    }
  };

  const handleNewPin = () => {
    if (newPin.length < 6) {
      setError('PIN must be at least 6 digits');
      return;
    }
    if (newPin.length > 10) {
      setError('PIN cannot be longer than 10 digits');
      return;
    }
    setStep('confirm');
    setError('');
  };

  const handleConfirmPin = () => {
    if (newPin === confirmPin) {
      onPinChange(newPin);
      handleClose();
    } else {
      setError('PINs do not match');
      setConfirmPin('');
    }
  };

  const handleClose = () => {
    setStep('verify');
    setVerifyPin('');
    setNewPin('');
    setConfirmPin('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'verify' && 'Verify Current PIN'}
            {step === 'new' && 'Enter New PIN'}
            {step === 'confirm' && 'Confirm New PIN'}
          </DialogTitle>
          <DialogDescription>
            {step === 'verify' && 'Please enter your current PIN to continue'}
            {step === 'new' && 'Enter a new PIN between 6-10 digits'}
            {step === 'confirm' && 'Enter your new PIN again to confirm'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'verify' && (
            <div className="space-y-2">
              <Label>Current PIN</Label>
              <Input
                type="password"
                value={verifyPin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setVerifyPin(value);
                  setError('');
                }}
                placeholder="Enter current PIN"
                pattern="\d*"
              />
            </div>
          )}

          {step === 'new' && (
            <div className="space-y-2">
              <Label>New PIN</Label>
              <Input
                type="password"
                value={newPin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    setNewPin(value);
                    setError('');
                  }
                }}
                placeholder="Enter new PIN"
                minLength={6}
                maxLength={10}
                pattern="\d*"
              />
              <p className="text-sm text-gray-500">PIN must be between 6 and 10 digits</p>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-2">
              <Label>Confirm PIN</Label>
              <Input
                type="password"
                value={confirmPin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    setConfirmPin(value);
                    setError('');
                  }
                }}
                placeholder="Confirm new PIN"
                minLength={6}
                maxLength={10}
                pattern="\d*"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (step === 'verify') handleVerifyPin();
                else if (step === 'new') handleNewPin();
                else if (step === 'confirm') handleConfirmPin();
              }}
            >
              {step === 'verify' && 'Verify'}
              {step === 'new' && 'Next'}
              {step === 'confirm' && 'Change PIN'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
