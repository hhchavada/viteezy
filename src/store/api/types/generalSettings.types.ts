export interface GeneralSettingsLanguage {
  code: string;
  name: string;
  isEnabled: boolean;
}

export interface GeneralSettingsSocialMedia {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  tiktok?: string;
}

export interface GeneralSettingsData {
  _id: string;
  logoLight?: string;
  logoDark?: string;
  supportEmail?: string;
  supportPhone?: string;
  address?: string;
  tagline?: string;
  languages: GeneralSettingsLanguage[];
  socialMedia: GeneralSettingsSocialMedia;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetGeneralSettingsResponse {
  success: boolean;
  message: string;
  data: {
    settings: GeneralSettingsData;
  };
}
