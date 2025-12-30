export interface MenuItem {
  name: string;
  link: string;
  icon?: string;
  children?: MenuItem[];
}

export interface NavbarConfig {
  mainItems: MenuItem[];
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
    href: string;
  };
  socialLinks: {
    github: {
      href: string;
      icon: string;
    };
    linkedin: {
      href: string;
      icon: string;
    };
  };
  brandName: string;
}

export const defaultNavbarConfig: NavbarConfig = {
  mainItems: [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "Projects",
      link: "/projects",
    },
    {
      name: "Tech & Certs",
      link: "/techstack-&-certificate",
    },
    {
      name: "Gallery",
      link: "/gallery",
    },
  ],
  logo: {
    src: "/images/Logo.png",
    alt: "AndinoFerdi Logo",
    width: 30,
    height: 30,
    href: "/",
  },
  socialLinks: {
    github: {
      href: "https://github.com/andinoferdi",
      icon: "github",
    },
    linkedin: {
      href: "https://linkedin.com/in/andinoferdi",
      icon: "linkedin",
    },
  },
  brandName: "AndinoFerdi",
};

export const getMenuItems = (): MenuItem[] => {
  return defaultNavbarConfig.mainItems;
};

export const getNavbarConfig = (): NavbarConfig => {
  return defaultNavbarConfig;
};
