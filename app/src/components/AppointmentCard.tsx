import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { User } from 'lucide-react';
import StatusBadge from './StatusBadge';
import RatingComponent from './RatingComponent';
import { AppointmentCardProps } from '@/interfaces/interfaces';

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  currentUser,
  users,
  payments,
  ratingState,
  setRatingState,
  isDoctor,
  activeTab,
  onApprove,
  onDecline,
  onCancelPayment,
  onFinishAppointment,
  onOpenPaymentModal,
  onOpenEditModal,
  onRate,
  router,
}) => {
  const { ratedAppointments, userRatings } = ratingState;
  const isRated = ratedAppointments.includes(appointment.id);
  const currentRating = userRatings[appointment.id];
  const patient = users.find((user) => user.uid === appointment.patientId);
  const doctor = users.find((user) => user.uid === appointment.doctorId);
  const appointmentDate = appointment.date;
  const paymentForAppointment = payments.find((payment) => payment.appointmentId === appointment.id);
  const appointmentWith = appointment.patientId === currentUser.uid ? 'Doctor' : 'Patient';
  const otherUserName =
    (appointment.patientId === currentUser.uid && appointment.doctorName) || appointment.patientName || 'Unknown';
  const otherUserPhotoURL = currentUser.uid === appointment.doctorId ? patient?.photoURL : doctor?.photoURL;
  const location = doctor?.selectedAddress?.place_name;
  return (
    <li className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-shadow hover:shadow-lg">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {otherUserPhotoURL ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image src={otherUserPhotoURL} alt={otherUserName} layout="fill" objectFit="cover" />
              </div>
            ) : (
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                <User className="text-gray-400" size={20} />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {appointmentWith} <span className="font-semibold text-indigo-600">{otherUserName}</span>
              </p>
              <p className="text-xs text-gray-500">
                {format(appointmentDate, 'MMMM d, yyyy')} at {format(appointmentDate, 'HH:mm')}
              </p>
            </div>
          </div>
          {appointment.status === 'pending' && appointment.patientId === currentUser.uid && (
            <StatusBadge status="pending" />
          )}
          {appointment.status === 'approved' && <StatusBadge status="approved" />}
          {appointment.status === 'declined' && <StatusBadge status="declined" />}
          {appointment.status === 'finished' && <StatusBadge status="finished" />}
        </div>
        <div className="mt-2">
          {location && (
            <p className="text-sm text-gray-500">
              Address: <span className="font-medium">{location}</span>
            </p>
          )}
          {paymentForAppointment && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                Payment: ${paymentForAppointment.amount}
                <span
                  className={`ml-1 rounded-full w-2 h-2 inline-block ${paymentForAppointment.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'}`}
                  title={paymentForAppointment.status === 'pending' ? 'Pending' : 'Paid'}
                ></span>
              </span>
              {isDoctor && paymentForAppointment.status === 'pending' && (
                <>
                  <button
                    onClick={() => onOpenEditModal(appointment, paymentForAppointment.amount, true)}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-50 rounded-full hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onCancelPayment(appointment)}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Cancel
                  </button>
                </>
              )}
              {!isDoctor && paymentForAppointment.status === 'pending' && (
                <button
                  onClick={() => onOpenPaymentModal(appointment, paymentForAppointment.amount)}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Pay
                </button>
              )}
            </div>
          )}
        </div>
        <div className="mt-3 flex space-x-2">
          {isDoctor &&
            appointment.doctorId === currentUser.uid &&
            appointment.status === 'pending' &&
            activeTab === 'active' && (
              <>
                <button
                  onClick={() => onApprove(appointment.id)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Approve
                </button>
                <button
                  onClick={() => onDecline(appointment.id, appointmentDate)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Decline
                </button>
              </>
            )}
          {currentUser?.role === 'patient' && appointment.status === 'finished' && (
            <div className="flex items-center space-x-2">
              <RatingComponent
                appointmentId={appointment.id}
                isRated={isRated}
                currentRating={currentRating}
                onRate={(rate) => onRate(appointment, rate)}
                onChangeRating={() => {
                  setRatingState({
                    ratedAppointments: ratedAppointments.filter((id) => id !== appointment.id),
                    userRatings: {
                      ...userRatings,
                      [appointment.id]: 0,
                    },
                  });
                }}
              />
            </div>
          )}
          {(appointment.status === 'approved' || appointment.status === 'finished') && (
            <button
              onClick={() => router.push(`/appointment_chat/${appointment.id}`)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Chat
            </button>
          )}
          {isDoctor && appointment.status === 'approved' && (
            <button
              onClick={() => onFinishAppointment(appointment.id)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Finish Appointment
            </button>
          )}
          {!paymentForAppointment &&
            isDoctor &&
            appointment.doctorId === currentUser?.uid &&
            (appointment.status === 'approved' || appointment.status === 'finished') && (
              <button
                onClick={() => onOpenEditModal(appointment, 0, false)}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Payment
              </button>
            )}
        </div>
      </div>
    </li>
  );
};
export default AppointmentCard;
