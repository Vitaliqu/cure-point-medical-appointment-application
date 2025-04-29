import React, { useCallback, useState } from 'react';
import { Pencil, Trash } from 'lucide-react';
import { AvailableTimePickerProps, Slot } from '@/interfaces/interfaces';

const AvailableTimePicker: React.FC<AvailableTimePickerProps> = ({
  availableSlots,
  onUpdateAvailableSlots,
  setErrorMessage,
  setSuccessMessage,
}) => {
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [editedTimes, setEditedTimes] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleAddAvailableSlot = useCallback(() => {
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
  }, [availableSlots, onUpdateAvailableSlots, selectedDate, selectedTime, setSelectedTime]);

  const handleRemoveTime = useCallback(
    (slotDate: string, timeToRemove: string) => {
      if (!availableSlots) return;
      const updatedSlots = availableSlots.map((slot) => {
        if (slot.date === slotDate) {
          return { ...slot, time: slot.time.filter((t) => t !== timeToRemove).sort() };
        }
        return slot;
      });
      onUpdateAvailableSlots(updatedSlots.filter((slot) => slot.time.length > 0));
    },
    [availableSlots, onUpdateAvailableSlots],
  );

  const handleEditSlot = useCallback(
    (slotToEdit: Slot) => {
      setEditingSlot(slotToEdit);
      setEditedTimes([...slotToEdit.time]);
      setSelectedDate(slotToEdit.date);
    },
    [setSelectedDate],
  );

  const handleEditedTimeChange = useCallback(
    (index: number, newTime: string) => {
      const newTimes = [...editedTimes];
      newTimes[index] = newTime;
      setEditedTimes(newTimes);
    },
    [editedTimes],
  );

  const handleAddTimeInEdit = useCallback(() => {
    if (selectedTime && !editedTimes.includes(selectedTime)) {
      setEditedTimes([...editedTimes, selectedTime].sort());
      setSelectedTime('');
    }
  }, [editedTimes, selectedTime, setSelectedTime]);

  const handleSaveEditedSlot = useCallback(() => {
    if (!editingSlot || !availableSlots) return;
    const updatedSlots = availableSlots.map((slot) =>
      slot.date === editingSlot.date ? { ...slot, time: editedTimes.sort() } : slot,
    );
    onUpdateAvailableSlots(updatedSlots.filter((slot) => slot.time.length > 0));
    setEditingSlot(null);
    setEditedTimes([]);
    setSelectedDate('');
  }, [availableSlots, editedTimes, editingSlot, onUpdateAvailableSlots, setSelectedDate]);

  const handleCancelEdit = useCallback(() => {
    setEditingSlot(null);
    setEditedTimes([]);
    setSelectedDate('');
  }, [setSelectedDate]);

  const handleDeleteSlot = useCallback(
    (slotToDelete: Slot) => {
      if (!availableSlots) return;
      const updatedSlots = availableSlots.filter((slot) => slot.date !== slotToDelete.date);
      onUpdateAvailableSlots(updatedSlots);
    },
    [availableSlots, onUpdateAvailableSlots],
  );

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4">Set Available Time</h2>
      <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2 rounded"
          disabled={editingSlot !== null}
        />
        <div className="flex gap-2 items-center">
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="border p-2 rounded"
          />
          <button
            onClick={handleAddAvailableSlot}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            disabled={editingSlot !== null}
          >
            Add Slot
          </button>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-medium mb-2">Current Slots:</h3>
        {availableSlots === null || availableSlots.length === 0 ? (
          <p className="text-sm text-gray-500">No available slots yet.</p>
        ) : (
          <ul className="space-y-2">
            {availableSlots.map((slot) => (
              <li key={slot.date} className="bg-gray-100 rounded-md p-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold">{slot.date}:</span>
                  {slot.time.map((time) => (
                    <span key={`${slot.date}-${time}`} className="inline-flex items-center mr-2">
                      {time}
                      <button
                        onClick={() => handleRemoveTime(slot.date, time)}
                        className="ml-1 text-red-500 hover:text-red-700 focus:outline-none"
                        aria-label={`Remove ${time} from ${slot.date}`}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditSlot(slot)}
                    className="text-blue-500 hover:text-blue-700 focus:outline-none"
                    aria-label={`Edit slots for ${slot.date}`}
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSlot(slot)}
                    className="text-red-500 hover:text-red-700 focus:outline-none"
                    aria-label={`Delete slots for ${slot.date}`}
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editingSlot && (
        <div className="mt-6 p-4 border rounded-md bg-gray-50">
          <h3 className="font-semibold mb-2">Edit Slots for {editingSlot.date}</h3>
          <div className="mb-2">
            {editedTimes.map((time, index) => (
              <div key={`${editingSlot.date}-edit-${index}`} className="flex items-center gap-2 mb-1">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => handleEditedTimeChange(index, e.target.value)}
                  className="border p-2 rounded text-sm"
                />
              </div>
            ))}
            <div className="flex gap-2 items-center">
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="border p-2 rounded text-sm"
              />
              <button
                onClick={handleAddTimeInEdit}
                className="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700 transition"
              >
                Add Time
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveEditedSlot}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableTimePicker;
