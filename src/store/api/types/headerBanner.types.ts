export interface HeaderBanner {
  _id: string;
  text: string;
  deviceType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetHeaderBannerResponse {
  success: boolean;
  message: string;
  data: {
    headerBanner: HeaderBanner;
    deviceType: string;
  };
}

export interface GetHeaderBannerParams {
  deviceType: string;
  lang: string;
}
