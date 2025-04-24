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
            <li
              key={appointment.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-shadow hover:shadow-lg"
            >
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  )}
                  {appointment.status === 'approved' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Approved
                    </span>
                  )}
                  {appointment.status === 'declined' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Declined
                    </span>
                  )}
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
                          className={`ml-1 rounded-full w-2 h-2 inline-block ${
                            paymentForAppointment.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          title={paymentForAppointment.status === 'pending' ? 'Pending' : 'Paid'}
                        ></span>
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
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-50 rounded-full hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleCancelPayment(appointment)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            Cancel
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
                          onClick={() => handleApprove(appointment.id)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDecline(appointment.id, appointmentDate)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Decline
                        </button>
                      </>
                    )}
                  {appointment.status === 'approved' && (
                    <button
                      onClick={() => router.push(`/appointment_chat/${appointment.id}`)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Chat
                    </button>
                  )}
                  {!paymentForAppointment &&
                    isDoctor &&
                    appointment.doctorId === currentUser?.uid &&
                    appointment.status === 'approved' && (
                      <button
                        onClick={() => {
                          setAmountInput(0);
                          setSelectedAppointment(appointment);
                          setIsModalOpen(true);
                        }}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Create Payment
                      </button>
                    )}
                </div>
              </div>

              {isModalOpen && selectedAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 -left-2 m-0">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      {isEditing ? 'Edit Payment Amount' : 'Set Payment Amount'}
                    </h2>
                    <div className="mb-4">
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        Amount
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 sm:text-sm">
                          $
                        </div>
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                          placeholder="0.00"
                          value={amountInput}
                          onChange={(e) => setAmountInput(Number(e.target.value))}
                          min={0}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 sm:text-sm">
                          USD
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setIsModalOpen(false);
                        }}
                        type="button"
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (selectedAppointment) {
                            if (isEditing) {
                              handleEditPayment(selectedAppointment);
                              setIsModalOpen(false);
                              setIsEditing(false);
                            } else {
                              handleCreatePayment(selectedAppointment);
                              setIsModalOpen(false);
                            }
                          }
                        }}
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RenderAppointmentsList;
