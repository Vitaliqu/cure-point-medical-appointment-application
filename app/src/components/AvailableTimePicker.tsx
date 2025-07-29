import React, { useCallback, useState } from 'react';
import { Clock, Pencil, Plus, Trash } from 'lucide-react';
import { AvailableTimePickerProps, Slot } from '@/interfaces/interfaces';
import useAddAvailableSlot from '../../hooks/useAddAvailableSlot';

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
  const [selectedEditingTime, setSelectedEditingTime] = useState('');

  const handleAddAvailableSlot = useAddAvailableSlot({
    selectedDate,
    selectedTime,
    setErrorMessage,
    setSuccessMessage,
    availableSlots,
    onUpdateAvailableSlots,
    setSelectedTime,
  });

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
    if (selectedEditingTime && !editedTimes.includes(selectedEditingTime)) {
      setEditedTimes([...editedTimes, selectedEditingTime].sort());
      setSelectedEditingTime('');
    }
  }, [editedTimes, selectedEditingTime, setSelectedEditingTime]);

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
    <div className="bg-gray-50 mt-6 p-6 rounded-xl border border-gray-200">
      <div className="flex items-center mb-4">
        <Clock className="text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Availability Schedule</h3>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
            <input
              type="date"
              onChange={(e) => setSelectedDate(e.target.value)}
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Time</label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleAddAvailableSlot}
            className={`flex items-center justify-center px-3 py-1.5 rounded-lg font-medium transition text-sm md:text-base bg-blue-600 hover:bg-blue-700 text-white`}
            disabled={editingSlot !== null}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Time Slot
          </button>
        </div>
      </div>
      <div className="mt-2">
        <h3 className="font-medium mb-3">Current Slots:</h3>
        {availableSlots === null || availableSlots.length === 0 ? (
          <p className="text-sm text-gray-500">No available slots yet.</p>
        ) : (
          <ul className="space-y-2">
            {availableSlots.map((slot) => (
              <li
                key={slot.date}
                className="bg-white p-4 flex-row flex justify-between rounded-lg border border-gray-200 "
              >
                <div className="flex flex-col justify-start">
                  <span className="font-semibold">
                    {new Date(slot.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    :
                  </span>
                  <div className={'flex flex-wrap mt-2 gap-3'}>
                    {slot.time.map((time) => (
                      <span
                        key={`${slot.date}-${time}`}
                        className="flex items-center w-min justify-between bg-gray-50 border-gray-200 border px-3 py-1 rounded-lg"
                      >
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
          <h3 className="font-semibold mb-2">
            Edit Slots for{' '}
            {new Date(editingSlot.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
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
                value={selectedEditingTime}
                onChange={(e) => setSelectedEditingTime(e.target.value)}
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
