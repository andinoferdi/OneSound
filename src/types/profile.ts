export interface Profile {
  quote: string;
  name: string;
  designation: string;
  src: string;
}

export interface ProfileData {
  profiles: Profile[];
  cvDownload: {
    url: string;
    filename: string;
    label: string;
  };
}
