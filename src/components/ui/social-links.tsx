"use client";

import { Github, Linkedin } from "lucide-react";

interface SocialLink {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SocialLinksProps {
  socialLinks: {
    github: { href: string };
    linkedin: { href: string };
  };
  className?: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    name: "GitHub",
    href: "",
    icon: Github,
  },
  {
    name: "LinkedIn",
    href: "",
    icon: Linkedin,
  },
];

export const SocialLinks: React.FC<SocialLinksProps> = ({
  socialLinks,
  className = "flex items-center gap-2 relative z-30",
}) => {
  const links = [
    { ...SOCIAL_LINKS[0], href: socialLinks.github.href },
    { ...SOCIAL_LINKS[1], href: socialLinks.linkedin.href },
  ];

  return (
    <div className={className}>
      {links.map((link) => {
        const IconComponent = link.icon;
        return (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors relative z-30"
            aria-label={link.name}
          >
            <IconComponent className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
};
