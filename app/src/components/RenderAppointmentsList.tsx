import React, { useCallback, useEffect, useState, FC } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';
import { db } from '../../backend/lib/firebaseConfig';
import { Appointment, RenderAppointmentsListProps, Rating } from '@/interfaces/interfaces';
// Custom hooks
import useApproveAppointmentHandler from '../../hooks/useApproveAppointmentHandler';
import useDeclineAppointmentHandler from '../../hooks/useDeclineAppointmentHandler';
import useCreatePaymentHandler from '../../hooks/useCreatePaymentHandler';
import useEditPaymentHandler from '../../hooks/useEditPaymentHandler';
import useCancelPaymentHandler from '../../hooks/useCancelPaymentHandler';
import usePaymentSuccess from '../../hooks/usePaymentSuccess';
import rateAppointment from '../../hooks/rateAppointment';
import useFinishAppointment from '../../hooks/useFinishAppointment';
import useFetchAppointments from '@/app/api/fetchAppointments';
// Components
import AppointmentCard from './AppointmentCard';
import PaymentModal from './PaymentModal';
import StripePayment from '@/components/StripePayment';
import NotificationBanner from '@/components/NotificationBanner';
const RenderAppointmentsList: FC<RenderAppointmentsListProps> = ({
  activeTab,
  payments,
  setPayments,
  currentUser,
  users,
  selectedDate,
}) => {
  const [activeAppointments, setActiveAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const router = useRouter();
  const isDoctor = !!currentUser && users.some((user) => user.uid === currentUser.uid && user.role === 'doctor');
  // State management
  const [loading, setLoading] = useState(true);
  // Payment and modal state
  const [paymentState, setPaymentState] = useState({
    isPaymentModalOpen: false,
    isEditModalOpen: false,
    isEditing: false,
    selectedAppointment: null as Appointment | null,
    amountInput: 0,
    modalPaymentAmount: null as number | null,
  });
  // Rating state
  const [ratingState, setRatingState] = useState({
    ratedAppointments: [] as string[],
    userRatings: {} as {
      [appointmentId: string]: number;
    },
  });
  // Notification handlers
  const showError = useCallback((message: string) => {
    setPaymentError(message);
    setTimeout(() => setPaymentError(null), 3000);
  }, []);
  const showSuccess = useCallback((message: string) => {
    setPaymentSuccess(message);
    setTimeout(() => setPaymentSuccess(null), 3000);
  }, []);
  // Custom hooks initialization
  const handleApprove = useApproveAppointmentHandler({ setActiveAppointments, setPastAppointments });
  const handleDecline = useDeclineAppointmentHandler({
    appointmentsToRender: activeTab === 'active' ? activeAppointments : pastAppointments,
    currentUser,
    setActiveAppointments,
    setPastAppointments,
  });
  const handleCreatePayment = useCreatePaymentHandler({
    currentUser,
    paymentAmount: paymentState.amountInput,
    router,
    onError: showError,
    onSuccess: showSuccess,
    setPayments,
  });
  const handleEditPayment = useEditPaymentHandler({
    currentUser,
    paymentAmount: paymentState.amountInput,
    router,
    onError: showError,
    onSuccess: showSuccess,
    setPayments,
  });

  const handleCancelPayment = useCancelPaymentHandler({
    currentUser,
    paymentAmount: paymentState.amountInput,
    router,
    onError: showError,
    onSuccess: showSuccess,
    setPayments,
  });
  const handlePaymentSuccess = usePaymentSuccess({
    currentUser,
    router,
    setPayments,
  });
  const finishAppointment = useFinishAppointment({
    currentUser,
    selectedDate,
    setPayments,
    setActiveAppointments,
    setPastAppointments,
    setLoading,
    setPaymentSuccess,
    setPaymentError,
  });
  // Fetch appointments function returned by your custom hook
  const fetchAppointmentsHandler = useFetchAppointments({
    setPayments,
    setActiveAppointments,
    setPastAppointments,
    setLoading,
    currentUser,
    selectedDate,
  });

  // Memoize the fetchAppointments function with its dependencies
  const fetchAppointments = useCallback(fetchAppointmentsHandler, [
    setPayments,
    setActiveAppointments,
    setPastAppointments,
    setLoading,
    currentUser,
    selectedDate,
    fetchAppointmentsHandler,
  ]);
  // Fetch ratings
  useEffect(() => {
    const fetchRatings = async () => {
      if (currentUser?.role === 'patient') {
        const ratingsQuery = query(collection(db, 'ratings'), where('patient_id', '==', currentUser.uid));
        const ratingsSnapshot = await getDocs(ratingsQuery);
        const fetchedRatings: Rating[] = [];
        const appointmentRatings: {
          [appointmentId: string]: number;
        } = {};
        ratingsSnapshot.forEach((doc) => {
          const ratingData = {
            id: doc.id,
            ...doc.data(),
          } as Rating;
          fetchedRatings.push(ratingData);
          appointmentRatings[ratingData.appointment_id] = ratingData.rating;
        });
        setRatingState({
          ratedAppointments: fetchedRatings.map((r) => r.appointment_id),
          userRatings: appointmentRatings,
        });
      } else {
        setRatingState({
          ratedAppointments: [],
          userRatings: {},
        });
      }
    };
    fetchRatings();
  }, [currentUser]);
  useEffect(() => {
    if (currentUser) {
      fetchAppointments();
    }
  }, [currentUser, fetchAppointments, selectedDate]);
  // Modal handlers
  const openPaymentModal = (appointment: Appointment, amount: number) => {
    setPaymentState((prev) => ({
      ...prev,
      isPaymentModalOpen: true,
      selectedAppointment: appointment,
      modalPaymentAmount: amount,
    }));
  };
  const openEditModal = (appointment: Appointment, amount: number, isEditing = false) => {
    setPaymentState((prev) => ({
      ...prev,
      isEditModalOpen: true,
      selectedAppointment: appointment,
      amountInput: amount,
      isEditing,
    }));
  };
  const closeModals = () => {
    setPaymentState((prev) => ({
      ...prev,
      isPaymentModalOpen: false,
      isEditModalOpen: false,
      selectedAppointment: null,
      isEditing: false,
    }));
  };
  // Empty state renderer
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
  // Loading state
  if (loading || !currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }
  // Empty state
  if (
    (activeTab === 'active' && activeAppointments.length === 0) ||
    (activeTab === 'history' && pastAppointments.length === 0)
  ) {
    return renderEmptyState();
  }
  // Handle payment confirmation
  const handlePaymentConfirmation = () => {
    if (paymentState.selectedAppointment) {
      if (paymentState.isEditing) handleEditPayment(paymentState.selectedAppointment);
      else handleCreatePayment(paymentState.selectedAppointment);
      closeModals();
    }
  };
  return (
    <div>
      <NotificationBanner
        error={paymentError}
        success={paymentSuccess}
        onClose={() => {
          setPaymentError(null);
          setPaymentSuccess(null);
        }}
      />
      {paymentState.isPaymentModalOpen && paymentState.modalPaymentAmount && paymentState.selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex overflow-scroll justify-center items-center z-50 -left-2 m-0">
          <StripePayment
            amount={paymentState.modalPaymentAmount}
            setIsPaymentModalOpen={(isOpen) =>
              setPaymentState((prev) => ({
                ...prev,
                isPaymentModalOpen: isOpen,
              }))
            }
            onPaymentSuccess={() => handlePaymentSuccess(paymentState.selectedAppointment!)}
          />
        </div>
      )}
      <ul className="space-y-4">
        {activeTab === 'active' || activeTab === 'history'
          ? (activeTab === 'active' ? activeAppointments : pastAppointments).map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                currentUser={currentUser}
                users={users}
                payments={payments}
                ratingState={ratingState}
                setRatingState={setRatingState}
                isDoctor={isDoctor}
                activeTab={activeTab}
                onApprove={handleApprove}
                onDecline={handleDecline}
                onCancelPayment={handleCancelPayment}
                onFinishAppointment={finishAppointment}
                onOpenPaymentModal={openPaymentModal}
                onOpenEditModal={openEditModal}
                onRate={(appointment, rate) => {
                  setRatingState((prev) => ({
                    ratedAppointments: [...prev.ratedAppointments, appointment.id],
                    userRatings: {
                      ...prev.userRatings,
                      [appointment.id]: rate,
                    },
                  }));
                  rateAppointment(currentUser, setPaymentSuccess, setPaymentError, appointment, rate);
                }}
                router={router}
              />
            ))
          : null}
      </ul>
      {paymentState.isEditModalOpen && paymentState.selectedAppointment && (
        <PaymentModal
          isEditing={paymentState.isEditing}
          amount={paymentState.amountInput}
          onAmountChange={(amount) =>
            setPaymentState((prev) => ({
              ...prev,
              amountInput: amount,
            }))
          }
          onCancel={closeModals}
          onConfirm={handlePaymentConfirmation}
        />
      )}
    </div>
  );
};
export default RenderAppointmentsList;
