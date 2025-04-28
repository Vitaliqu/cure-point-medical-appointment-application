import { Timestamp } from 'firebase/firestore';
import React, { Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';

export interface Slot {
  date: string;
  time: string[];
}

export interface AddressProps {
  coordinates: [number, number];
  id: string;
  place_name: string;
}
export interface UserType {
  uid: string;
  name: string;
  surname: string;
  phone: string;
  selectedAddress: AddressProps;
  role: string;
  photoURL: string;
  fields: string[];
  availableSlots?: Slot[];
}

export interface AvailableTimePickerProps {
  availableSlots: Slot[] | null;
  onUpdateAvailableSlots: (updatedSlots: Slot[]) => void;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  date: Date;
  createdAt: Timestamp;
  status?: 'pending' | 'approved' | 'declined' | 'finished';
}
export interface ChatProps {
  messages: Message[];
  loading: boolean;
  user: { uid: string } | null;
  recipientId: string;
  userName: string | null;
  userPhotoURL: string | null;
  appointmentId: string | null;
}
export interface Message {
  id?: string;
  text?: string | null;
  imageUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  type: 'text' | 'image' | 'file';
  participants: string[];
  participantsKey: string;
  createdAt: Timestamp;
  appointmentId?: string | null;
  senderId: string;
}
export interface Rating {
  id?: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string;
  rating: number;
  created_at: Date;
}

export interface AppointmentModalProps {
  doctor: UserType | null;
  onClose: () => void;
  setIsModalOpen: (state: boolean) => void;
  setUsers: React.Dispatch<React.SetStateAction<UserType[]>> | null;
  setSelectedDoctor: ((doctor: UserType | null) => void) | null;
  updateDoctorAvailableSlots: ((doctorId: string, updatedAvailableSlots: Slot[]) => void) | null;
}

export interface FeatureProperties {
  uid: string;
  message: string;
  image: string;
  iconSize: [number, number];
}

export interface Feature {
  type: 'Feature';
  properties: FeatureProperties;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface GeoJSON {
  type: 'FeatureCollection';
  features: Feature[];
}
export interface PaymentData {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  amount: number;
  status: 'pending' | 'paid';
  createdAt: Date;
}

export interface RenderAppointmentsListProps {
  currentUser: UserType;
  users: UserType[];
  activeTab: 'active' | 'history';
  payments: PaymentData[];
  setPayments: Dispatch<SetStateAction<PaymentData[]>>;
  selectedDate: Date | null;
}
export interface PaymentHandlerProps {
  currentUser: UserType;
  paymentAmount: number;
  router: ReturnType<typeof useRouter>;
  onError: (errorMessage: string) => void;
  onSuccess: (successMessage: string) => void;
  setPayments: Dispatch<SetStateAction<PaymentData[]>>;
}
