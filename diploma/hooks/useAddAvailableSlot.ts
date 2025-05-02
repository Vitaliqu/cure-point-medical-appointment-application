import { Dispatch, SetStateAction, useCallback } from 'react';
import { PaymentData, Slot } from '@/interfaces/interfaces';

const useAddAvailableSlot = ({
  selectedDate,
  selectedTime,
  setErrorMessage,
  setSuccessMessage,
  availableSlots,
  onUpdateAvailableSlots,
  setSelectedTime,
}: {
  selectedDate: string;
  selectedTime: string;
  setErrorMessage: (message: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  availableSlots: Slot[] | null;
  onUpdateAvailableSlots: (updatedSlots: Slot[]) => void;
  setSelectedTime: Dispatch<SetStateAction<string>>;
}) => {
  return useCallback(() => {
    if (!selectedDate || !selectedTime) {
      setErrorMessage('Please select both date and time.');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const updatedSlots = availableSlots ? [...availableSlots] : []; // Handle null case
    const existingSlotIndex = updatedSlots.findIndex((slot) => slot.date === selectedDate);

    if (existingSlotIndex >= 0) {
      const existingSlot = updatedSlots[existingSlotIndex];
      if (!existingSlot.time.includes(selectedTime)) {
        updatedSlots[existingSlotIndex] = {
          ...existingSlot,
          time: [...existingSlot.time, selectedTime].sort(),
        };
        onUpdateAvailableSlots(updatedSlots);
      } else {
        setSuccessMessage(null);
        setErrorMessage('This time slot already exists for the selected date.');
        setTimeout(() => setErrorMessage(null), 3000);
        return;
      }
    } else {
      const newSlot = { date: selectedDate, time: [selectedTime] };
      onUpdateAvailableSlots([...updatedSlots, newSlot]);
    }

    setSelectedTime('');
    setErrorMessage(null);
    setSuccessMessage('Slot created successfully.');
    setTimeout(() => setSuccessMessage(null), 3000);
  }, [
    availableSlots,
    onUpdateAvailableSlots,
    setErrorMessage,
    setSuccessMessage,
    selectedDate,
    selectedTime,
    setSelectedTime,
  ]);
};
export default useAddAvailableSlot;
