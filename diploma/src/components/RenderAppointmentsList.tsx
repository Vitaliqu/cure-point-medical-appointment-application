'use client';
import { Appointment, PaymentData, RenderAppointmentsListProps, UserType } from '@/interfaces/interfaces';
import Image from 'next/image';
import { User } from 'lucide-react';
import { format } from 'date-fns';
import React, { useState, FC, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useApproveHandler from '@/../hooks/useApproveHandler';
import useDeclineHandler from '@/../hooks/useDeclineHandler';
import useCreatePaymentHandler from '../../hooks/useCreatePaymentHandler';
import { collection, getDocs, or, query, where } from 'firebase/firestore';
import { db } from '../../backend/lib/firebaseConfig';
import useEditPaymentHandler from '../../hooks/useEditPaymentHandler';
import useCancelPaymentHandler from '../../hooks/useCancelPaymentHandler';
import StripePayment from '@/components/StripePayment';
import usePaymentSuccess from '../../hooks/usePaymentSuccess';

const RenderAppointmentsList: FC<RenderAppointmentsListProps> = ({
  activeTab,
  payments,
  setPayments,
  currentUser,
  users,
  selectedDate,
}) => {
  const isDoctor = !!currentUser && users.some((user) => user.uid === currentUser.uid && user.role === 'doctor');
  const router = useRouter();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [activeAppointments, setActiveAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPaymentAmount, setModalPaymentAmount] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [amountInput, setAmountInput] = useState<number>(0);
  const handleApprove = useApproveHandler({ setActiveAppointments, setPastAppointments });
  const handleDecline = useDeclineHandler({
    appointmentsToRender: activeTab === 'active' ? activeAppointments : pastAppointments,
    currentUser,
    setActiveAppointments,
    setPastAppointments,
  });
  const handleCreatePayment = useCreatePaymentHandler({
    currentUser,
    paymentAmount: amountInput,
    router,
    onError: (errorMessage) => {
      setPaymentError(errorMessage);
      setTimeout(() => setPaymentError(null), 3000);
    },
    onSuccess: (successMessage) => {
      setPaymentSuccess(successMessage);
      setTimeout(() => setPaymentSuccess(null), 3000);
    },
    setPayments,
  });
  const handleEditPayment = useEditPaymentHandler({
    currentUser,
    paymentAmount: amountInput,
    router,
    onError: (errorMessage) => {
      setPaymentError(errorMessage);
      setTimeout(() => setPaymentError(null), 3000);
    },
    onSuccess: (successMessage) => {
      setPaymentSuccess(successMessage);
      setTimeout(() => setPaymentSuccess(null), 3000);
    },
    setPayments,
  });
  const handleCancelPayment = useCancelPaymentHandler({
    currentUser,
    paymentAmount: amountInput,
    router,
    onError: (errorMessage) => {
      setPaymentError(errorMessage);
      setTimeout(() => setPaymentError(null), 3000);
    },
    onSuccess: (successMessage) => {
      setPaymentSuccess(successMessage);
      setTimeout(() => setPaymentSuccess(null), 3000);
    },
    setPayments,
  });
  const handlePaymentSuccess = usePaymentSuccess({
    currentUser,
    router,
    setPayments,
  });

  const fetchAppointments = useCallback(
    async (currentUser: UserType | null, selectedDate: Date | null) => {
      if (!currentUser) return;

      try {
        const appointmentsRef = collection(db, 'appointments');
        const { role: userRole, uid: userId } = currentUser;
        const appointmentsQuery =
          userRole === 'doctor'
            ? query(appointmentsRef, or(where('doctorId', '==', userId), where('patientId', '==', userId)))
            : query(appointmentsRef, where('patientId', '==', userId));

        const fetchedAppointments = (await getDocs(appointmentsQuery)).docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: (doc.data().date as { toDate: () => Date }).toDate(),
        })) as Appointment[];

        const paymentsRef = collection(db, 'payments');
        const fetchedPayments = (await getDocs(paymentsRef)).docs.map((doc) => doc.data() as PaymentData);
        setPayments(fetchedPayments);
        const filteredByDate = selectedDate
          ? fetchedAppointments.filter((appt) => appt.date.getDate() === selectedDate.getDate() + 1)
          : fetchedAppointments;
        setActiveAppointments(filteredByDate.filter((appt) => appt.status === 'pending' || appt.status === 'approved'));
        setPastAppointments(filteredByDate.filter((appt) => appt.status === 'declined'));
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    },
    [setPayments],
  );

  useEffect(() => {
    if (currentUser) {
      fetchAppointments(currentUser, selectedDate);
    }
  }, [currentUser, fetchAppointments, selectedDate]);

  const appointmentsToRender = activeTab === 'active' ? activeAppointments : pastAppointments;

  const renderEmptyState = useCallback(
    () => (
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-6 text-lg font-medium text-gray-900">No Appointments Here</h2>
          <p className="mt-2 text-sm text-gray-500">
            {isDoctor
              ? activeTab === 'active'
                ? 'When users book appointments with you, they will appear here.'
                : 'Your past appointments will be shown here.'
              : activeTab === 'active'
                ? 'Your upcoming appointments will appear here.'
                : 'Your past appointments will be shown here.'}
          </p>
        </div>
      </div>
    ),
    [activeTab, isDoctor],
  );

  if ((loading || !currentUser) && appointmentsToRender.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (appointmentsToRender.length === 0) {
    return renderEmptyState();
  }

  return (
    <div>
      {paymentError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{paymentError}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg
              onClick={() => setPaymentError(null)}
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path
                fillRule="evenodd"
                d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>
      )}
      {paymentSuccess && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline ml-2">{paymentSuccess}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg
              onClick={() => setPaymentSuccess(null)}
              className="fill-current h-6 w-6 text-green-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path
                fillRule="evenodd"
                d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>
      )}
      {isPaymentModalOpen && modalPaymentAmount && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex overflow-scroll justify-center items-center z-50 -left-2 m-0">
          <StripePayment
            amount={modalPaymentAmount}
            setIsPaymentModalOpen={setIsPaymentModalOpen}
            onPaymentSuccess={() => handlePaymentSuccess(selectedAppointment)}
          />
        </div>
      )}
      <ul className="space-y-4">
        {appointmentsToRender.map((appointment) => {
          const patient = users.find((user) => user.uid === appointment.patientId);
          const doctor = users.find((user) => user.uid === appointment.doctorId);
          const appointmentDate = appointment.date;
          const paymentForAppointment = payments.find((payment) => payment.appointmentId === appointment.id);

          const appointmentWith = appointment.patientId === currentUser.uid ? 'Doctor' : 'Patient';
          const otherUserName =
            (appointment.patientId === currentUser.uid && appointment.doctorName) ||
            appointment.patientName ||
            'Unknown';
          const otherUserPhotoURL = currentUser.uid === appointment.doctorId ? patient?.photoURL : doctor?.photoURL;
          const location = doctor?.selectedAddress?.place_name;

          return (
            <li key={appointment.id} className="bg-gray-50 rounded-md p-4 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4 mb-2">
                {otherUserPhotoURL ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image src={otherUserPhotoURL} alt={otherUserName} layout="fill" objectFit="cover" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200">
                    <User className="text-gray-500" size={20} />
                  </div>
                )}
                <p className="text-sm">
                  Appointment with {appointmentWith}{' '}
                  <strong className="text-blue-600 font-semibold">{otherUserName}</strong>
                </p>
              </div>
              <p className="text-sm text-gray-500">Date: {format(appointmentDate, 'MMMM d, yyyy')}</p>
              {location && <p className="text-sm text-gray-500">Address: {location}</p>}
              <p className="text-sm text-gray-500">Time: {format(appointmentDate, 'HH:mm')}</p>
              {paymentForAppointment && (
                <div className="flex mt-4 items-center space-x-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center">
                    Payment Created: ${paymentForAppointment.amount}
                    <p
                      className={`ml-1 ${paymentForAppointment.status === 'pending' ? 'text-yellow-700' : 'text-green-700'}`}
                    >
                      {paymentForAppointment.status === 'pending' ? 'Pending...' : 'Paid'}
                    </p>
                  </span>
                  {isDoctor && paymentForAppointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setAmountInput(paymentForAppointment.amount);
                          setIsEditing(true);
                          setIsModalOpen(true);
                        }}
                        className="ml-2 px-3 py-1 transition-colors text-xs bg-yellow-400 hover:bg-yellow-500 text-white rounded-md"
                      >
                        Edit Payment
                      </button>
                      <button
                        onClick={() => handleCancelPayment(appointment)}
                        className="ml-2 px-2 py-1 transition-colors bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                      >
                        Cancel Payment
                      </button>
                    </>
                  )}
                  {!isDoctor && paymentForAppointment.status === 'pending' && (
                    <button
                      onClick={() => {
                        setIsPaymentModalOpen(true);
                        setSelectedAppointment(appointment);
                        setModalPaymentAmount(paymentForAppointment.amount);
                      }}
                      className="ml-2 px-3 py-1 transition-colors text-xs bg-yellow-400 hover:bg-yellow-500 text-white rounded-md"
                    >
                      Pay
                    </button>
                  )}
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                {isDoctor &&
                  appointment.doctorId === currentUser.uid &&
                  appointment.status === 'pending' &&
                  activeTab === 'active' && (
                    <>
                      <button
                        onClick={() => handleApprove(appointment.id)}
                        className="px-4 py-2 bg-green-500 transition-colors text-white rounded-md text-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecline(appointment.id, appointmentDate)}
                        className="px-4 py-2 transition-colors bg-red-500 text-white rounded-md text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                      >
                        Decline
                      </button>
                    </>
                  )}
                {appointment.status === 'approved' && (
                  <span className="px-2 py-1 bg-green-200 flex items-center text-green-700 rounded-full text-xs font-semibold">
                    Approved
                  </span>
                )}
                {appointment.status === 'declined' && (
                  <span className="px-2 py-1 bg-red-200 flex items-center text-red-700 rounded-full text-xs font-semibold">
                    Declined
                  </span>
                )}
                {appointment.patientId === currentUser.uid && appointment.status === 'pending' && (
                  <span className="px-2 py-1 bg-yellow-200 flex items-center text-yellow-700 rounded-full text-xs font-semibold">
                    Pending
                  </span>
                )}
                {appointment.status === 'approved' && (
                  <button
                    onClick={() => router.push(`/appointment_chat/${appointment.id}`)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Chat
                  </button>
                )}
                {isModalOpen && selectedAppointment && (
                  <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 -left-2 m-0">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-sm mx-auto">
                      <h2 className="text-lg font-semibold mb-4">Set Payment Amount</h2>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={amountInput}
                        onChange={(e) => setAmountInput(Number(e.target.value))}
                        min={0}
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setIsModalOpen(false);
                          }}
                          className="px-4 py-2 transition-colors bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (selectedAppointment) {
                              if (isEditing) {
                                console.log(selectedAppointment);
                                handleEditPayment(selectedAppointment);
                                setIsModalOpen(false);
                                setIsEditing(false);
                              } else {
                                handleCreatePayment(selectedAppointment);
                                setIsModalOpen(false);
                              }
                            }
                          }}
                          className="px-4 py-2 transition-colors bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!paymentForAppointment &&
                  isDoctor &&
                  appointment.doctorId === currentUser?.uid &&
                  appointment.status === 'approved' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setAmountInput(0);
                          setSelectedAppointment(appointment);
                          setIsModalOpen(true);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        Create Payment
                      </button>
                    </div>
                  )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RenderAppointmentsList;
