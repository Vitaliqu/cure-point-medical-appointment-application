'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { AppointmentModalProps } from '@/interfaces/interfaces';
import useConfirmAppointmentHandler from '../../hooks/useConfirmAppointmentHandler';

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  doctor,
  onClose,
  setIsModalOpen,
  setUsers,
  setSelectedDoctor,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  // Clear error message after a delay
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Handle payment-success message and modal closure
  useEffect(() => {
    if (successMessage) {
      setIsConfirming(true);
      const timer = setTimeout(() => {
        setIsModalOpen(false);
        setAppointmentDate(null);
        if (setSelectedDoctor) setSelectedDoctor(null);
        setSuccessMessage(null);
        setIsConfirming(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, setIsModalOpen, setSelectedDoctor]);

  // Sort available slots by date using useMemo
  const sortedAvailableSlots = useMemo(
    () => [...(doctor?.availableSlots || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [doctor?.availableSlots],
  );

  // Handle slot selection using useCallback
  const handleSelect = useCallback((date: string, time: string) => {
    setSelectedSlot({ date, time });
    setAppointmentDate(new Date(`${date}T${time}`));
  }, []);

  // Now, in your component, you would use the custom hook like this:
  const confirmAppointment = useConfirmAppointmentHandler(
    setErrorMessage,
    setSuccessMessage,
    setIsConfirming,
    setUsers,
    setSelectedDoctor,
  );

  const handleConfirm = () => {
    confirmAppointment(appointmentDate, doctor, selectedSlot);
  };

  if (!doctor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-96 space-y-4">
        <h2 className="text-xl font-semibold">
          Select appointment for <span className="text-blue-600">{doctor.name}</span>
        </h2>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative" role="alert">
            <strong className="font-bold">Warning!</strong>
            <span className="block sm:inline"> {errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded relative" role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> {successMessage}</span>
          </div>
        )}

        <div className="space-y-4 max-h-[300px] overflow-y-auto">
          {sortedAvailableSlots.length > 0 ? (
            sortedAvailableSlots.map(({ date, time }) => {
              const formattedDate = new Date(date);
              // Consider if adding 1 day here is always the desired behavior
              const displayDate = formattedDate.toLocaleDateString();

              return (
                <div key={date}>
                  <p className="font-medium mb-1">{displayDate}</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(time) && time.length > 0 ? (
                      time.map((t) => {
                        const isSelected = selectedSlot?.date === date && selectedSlot?.time === t;
                        return (
                          <button
                            key={t}
                            onClick={() => handleSelect(date, t)}
                            className={`px-3 py-1 rounded-full text-sm border ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })
                    ) : (
                      <div>No time slots available</div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p>No available slots</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={isConfirming}
            className={`px-4 py-2 rounded ${
              isConfirming
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedSlot || isConfirming}
            className={`px-4 py-2 rounded ${
              !selectedSlot || isConfirming
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isConfirming ? 'Confirming...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
