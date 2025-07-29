import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { X, Calendar, Clock, Check, User } from 'lucide-react';
import Image from 'next/image';
import { AppointmentModalProps } from '@/interfaces/interfaces';
import useConfirmAppointmentHandler from '../../hooks/useConfirmAppointmentHandler';
const AppointmentModal: React.FC<AppointmentModalProps> = ({
  doctor,
  onClose,
  setIsModalOpen,
  setUsers,
  setSelectedDoctor,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    time: string;
  } | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);
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
  const sortedAvailableSlots = useMemo(
    () => [...(doctor?.availableSlots || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [doctor?.availableSlots],
  );
  const handleSelect = useCallback((date: string, time: string) => {
    setSelectedSlot({
      date,
      time,
    });
    setAppointmentDate(new Date(`${date}T${time}`));
  }, []);
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
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!doctor) return null;
  if (successMessage) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Appointment Scheduled!</h3>
            <p className="text-gray-600">{successMessage}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl h-[80dvh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">Book Appointment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
            disabled={isConfirming}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Doctor Info */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-16 w-16 relative rounded-full overflow-hidden bg-gray-100">
              {doctor.photoURL ? (
                <Image src={doctor.photoURL} alt={doctor.name} fill className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-lg">{doctor.name}</h4>
              <p className="text-gray-500 text-sm">{doctor.fields?.join(', ')}</p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Available Slots */}
          <div className="space-y-6">
            {sortedAvailableSlots.length > 0 ? (
              sortedAvailableSlots.map(({ date, time }) => {
                const formattedDate = new Date(date);
                const displayDate = formattedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                });
                return (
                  <div key={date} className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-900">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <h3 className="font-medium">{displayDate}</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {Array.isArray(time) && time.length > 0 ? (
                        time.map((t) => {
                          const isSelected = selectedSlot?.date === date && selectedSlot?.time === t;
                          return (
                            <button
                              key={t}
                              onClick={() => handleSelect(date, t)}
                              className={`py-2 px-1 text-center text-sm rounded-lg border transition-colors ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              <Clock className="w-4 h-4 mx-auto mb-1" />
                              {t}
                            </button>
                          );
                        })
                      ) : (
                        <p className="col-span-3 text-gray-500 text-center py-2">No time slots available</p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-gray-500">No available slots</div>
            )}
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              disabled={isConfirming}
              className="flex-1 px-4 py-2.5 border border-gray-300 hover:border-blue-300 hover:bg-blue-50 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedSlot || isConfirming}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConfirming ? 'Confirming...' : 'Confirm Appointment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AppointmentModal;
