export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  age: number;
  location: string;
  bloodType: string;
  role: 'DONOR' | 'RECEIVER';
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  createdAt: Date;
  // Donor specific
  lastDonatedDate?: Date;
  isDrunk?: boolean;
  isSmoker?: boolean;
}

export interface BloodRequest {
  id: string;
  userId: string;
  bloodType: string;
  hospitalArea: string;
  unitsNeeded: number;
  seriousness: 'LOW' | 'MODERATE' | 'HIGH';
  status: 'OPEN' | 'FULFILLED';
  createdAt: Date;
}

export interface Donation {
  id: string;
  donorId: string;
  requestId: string;
  donationDate: Date;
  unitsContributed: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AppStats {
  totalDonations: number;
  openRequests: number;
  registeredDonors: number;
  registeredReceivers: number;
}