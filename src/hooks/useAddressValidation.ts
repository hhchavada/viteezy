import * as yup from "yup";
import { isValidPhoneNumber } from "libphonenumber-js";

export interface AddressFormData {
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
}

export interface AddressValidationMessages {
  firstNameRequired: string;
  firstNameMin: string;
  firstNameMax: string;
  lastNameRequired: string;
  lastNameMin: string;
  lastNameMax: string;
  streetNameRequired: string;
  streetNameMin: string;
  streetNameMax: string;
  houseNumberRequired: string;
  houseNumberMax: string;
  houseNumberAdditionMax: string;
  postalCodeRequired: string;
  postalCodeInvalid: string;
  postalCodeMin: string;
  postalCodeMax: string;
  addressRequired: string;
  addressMin: string;
  addressMax: string;
  phoneRequired: string;
  phoneInvalid: string;
  countryRequired: string;
  cityRequired: string;
  cityMin: string;
  cityMax: string;
  noteMax: string;
}

const defaultMessages: AddressValidationMessages = {
  firstNameRequired: "First name is required",
  firstNameMin: "First name must be at least 2 characters",
  firstNameMax: "First name must not exceed 50 characters",
  lastNameRequired: "Last name is required",
  lastNameMin: "Last name must be at least 2 characters",
  lastNameMax: "Last name must not exceed 50 characters",
  streetNameRequired: "Street name is required",
  streetNameMin: "Street name must be at least 2 characters",
  streetNameMax: "Street name must not exceed 100 characters",
  houseNumberRequired: "House number is required",
  houseNumberMax: "House number must not exceed 20 characters",
  houseNumberAdditionMax: "House number addition must not exceed 10 characters",
  postalCodeRequired: "Postal code is required",
  postalCodeInvalid: "Postal code format is invalid",
  postalCodeMin: "Postal code must be at least 4 characters",
  postalCodeMax: "Postal code must not exceed 10 characters",
  addressRequired: "Address is required",
  addressMin: "Address must be at least 5 characters",
  addressMax: "Address must not exceed 200 characters",
  phoneRequired: "Phone number is required",
  phoneInvalid: "Please enter a valid phone number",
  countryRequired: "Country is required",
  cityRequired: "City is required",
  cityMin: "City must be at least 2 characters",
  cityMax: "City must not exceed 100 characters",
  noteMax: "Note must not exceed 500 characters",
};

export const createAddressValidationSchema = (
  messages: Partial<AddressValidationMessages> = {}
): yup.ObjectSchema<AddressFormData> => {
  const m = { ...defaultMessages, ...messages };

  return yup.object().shape({
    firstName: yup
      .string()
      .required(m.firstNameRequired)
      .min(2, m.firstNameMin)
      .max(50, m.firstNameMax),

    lastName: yup
      .string()
      .required(m.lastNameRequired)
      .min(2, m.lastNameMin)
      .max(50, m.lastNameMax),

    streetName: yup
      .string()
      .required(m.streetNameRequired)
      .min(2, m.streetNameMin)
      .max(100, m.streetNameMax),

    houseNumber: yup
      .string()
      .required(m.houseNumberRequired)
      .max(20, m.houseNumberMax),

    houseNumberAddition: yup
      .string()
      .optional()
      .max(10, m.houseNumberAdditionMax),

    postalCode: yup
      .string()
      .required(m.postalCodeRequired)
      .matches(/^[A-Z0-9\s-]+$/i, m.postalCodeInvalid)
      .min(4, m.postalCodeMin)
      .max(10, m.postalCodeMax),

    address: yup
      .string()
      .required(m.addressRequired)
      .min(5, m.addressMin)
      .max(200, m.addressMax),

    phone: yup
      .string()
      .required(m.phoneRequired)
      .test("is-valid-phone", m.phoneInvalid, (value) => {
        if (!value) return false;
        const phoneWithPlus = value.startsWith("+") ? value : `+${value}`;
        try {
          return isValidPhoneNumber(phoneWithPlus);
        } catch {
          return false;
        }
      }),

    country: yup.string().required(m.countryRequired),

    city: yup
      .string()
      .required(m.cityRequired)
      .min(2, m.cityMin)
      .max(100, m.cityMax),

    isDefault: yup.boolean().optional(),

    note: yup
      .string()
      .optional()
      .max(500, m.noteMax),
  }) as yup.ObjectSchema<AddressFormData>;
};

export const addressValidationSchema = createAddressValidationSchema();

export type AddressFormSchema = yup.InferType<typeof addressValidationSchema>;

