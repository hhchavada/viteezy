export interface SubMember {
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    isEmailVerified: boolean;
    avatar: string | null;
    profileImage: string | null;
    gender: string | null;
    age: string | null;
    memberId: string;
    isMember: boolean;
    membershipStatus: string;
    lastLogin: string;
    sessionIds: SessionId[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    language: string;
    firstName: string;
    lastName: string;
    membershipActivatedAt: string;
    membershipExpiresAt: string;
    membershipPlanId: string;
    isDeleted: boolean;
    isSubMember: boolean;
    relationshipToParent: string | null;
    parentId: string | null;
}

export interface SessionId {
    sessionId: string;
    status: string;
    revoked: boolean;
    deviceInfo: string;
    _id: string;
}

export interface GetFamilyMembersResponse {
    success: boolean;
    message: string;
    data: {
        subMembers: SubMember[];
        count: number;
    };
}
