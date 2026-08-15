export interface ImageItem {
  type: string;
  url: string;
  sortOrder: number;
}

export interface Banner {
  banner_image: ImageItem;
  banner_title: string;
  banner_subtitle: string;
  banner_button_text: string;
  banner_button_link: string;
}

export interface FounderStory {
  headline: string;
  name: string;
  position: string;
  image: ImageItem;
  description: string;
}

export interface MeetBrains {
  meet_brains_title: string;
  meet_brains_subtitle: string;
  meet_brains_main_image: ImageItem;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  order: number;
}

export interface Timeline {
  timeline_section_title: string;
  timeline_section_description: string;
  timeline_events: TimelineEvent[];
}

export interface People {
  title: string;
  subtitle: string;
  images: ImageItem[];
}

export interface FounderStory {
  headline: string;
  description: string;
  image: ImageItem;
  name: string;
  position: string;
}

export interface FounderNote {
  headline: string;
  description: string;
}

export interface AboutUsData {
  banner: Banner;
  founderStory: FounderStory;
  founderNote: FounderNote;
  meetBrains: MeetBrains;
  timeline: Timeline;
  people: People;
}

export interface GetAboutUsResponse {
  success: boolean;
  message: string;
  data: {
    aboutUs: AboutUsData;
  };
}
