export interface SessionId {
  sessionId: string;
  status: string;
  revoked: boolean;
  deviceInfo: string;
  _id: string;
  id: string;
}

export interface User {
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string | null;
  countryCode: string | null;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  avatar: string | null;
  profileImage: string | null;
  gender: string | null;
  age: number | null;
  language: string;
  registeredAt: string;
  memberId: string;
  referralCode?: string;
  isMember: boolean;
  isSubMember?: boolean;
  membershipStatus: string;
  lastLogin: string;
  sessionIds: SessionId[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

export interface GetUserMeResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}
