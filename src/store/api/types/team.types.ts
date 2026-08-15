export interface TeamMember {
  _id: string;
  image: string;
  name: string;
  designation: string;
  content: string;
}

export interface Banner {
  banner_image: string | null;
  title: string;
  subtitle: string;
}

export interface GetTeamMembersResponse {
  success: boolean;
  message: string;
  data: {
    banner: Banner;
    teamMembers: TeamMember[];
  };
}

export interface GetTeamMembersParams {
  lang?: string;
}

