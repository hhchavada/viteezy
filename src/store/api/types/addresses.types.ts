export interface Address {
  _id: string;
  firstName: string;
  lastName: string;
  streetName: string;
  houseNumber: string;
  houseNumberAddition?: string;
  postalCode: string;
  address: string;
  phone: string;
  country: string;
  city: string;
  isDefault: boolean;
  note?: string;
  email?: string;
  isSelectedForSubscription?: boolean;
}

export interface GetAddressesParams {
  subscriptionId?: string;
  subMemberId?: string;
}

export interface GetAddressesResponse {
  success: boolean;
  message: string;
  data: {
    addresses: Address[];
  };
}

export interface CreateAddressRequest {
  firstName: string;
  lastName: string;
  streetName: string;
  houseNumber: string;
  houseNumberAddition?: string;
  postalCode: string;
  address: string;
  phone: string;
  country: string;
  city: string;
  isDefault?: boolean;
  note?: string;
  email: string;
}

export interface CreateAddressResponse {
  success: boolean;
  message: string;
  data: {
    address: Address;
  };
}

export interface UpdateAddressRequest {
  firstName: string;
  lastName: string;
  streetName: string;
  houseNumber: string;
  houseNumberAddition?: string;
  postalCode: string;
  address: string;
  phone: string;
  country: string;
  city: string;
  isDefault?: boolean;
  note?: string;
  email: string;
}

export interface UpdateAddressResponse {
  success: boolean;
  message: string;
  data: {
    address: Address;
  };
}
