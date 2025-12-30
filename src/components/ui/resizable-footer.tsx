"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface FooterProps {
  children: React.ReactNode;
  className?: string;
}

interface FooterBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface FooterSectionProps {
  title: string;
  links: Array<{
    name: string;
    href: string;
  }>;
  className?: string;
}

interface FooterLogoProps {
  logo?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    href: string;
  };
  brandName?: string;
}

interface FooterSocialProps {
  socialLinks: Array<{
    name: string;
    href: string;
    icon?: string;
  }>;
  className?: string;
}

export const Footer = ({ children, className }: FooterProps) => {
  return (
    <footer className={cn("relative z-40 w-full", className)}>
      {children}
    </footer>
  );
};

export const FooterBody = ({ children, className }: FooterBodyProps) => {
  return (
    <div
      className={cn(
        "relative z-60 mx-auto w-full max-w-7xl bg-transparent px-4 py-8 dark:bg-transparent",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const FooterSection = ({ title, links, className }: FooterSectionProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="space-y-3">
        {links.map((link, index) => (
          <li key={index}>
            <a
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const FooterLogo = ({ 
  logo = {
    src: "https://assets.aceternity.com/logo-dark.png",
    alt: "logo",
    width: 30,
    height: 30,
    href: "/",
  },
  brandName = "Startup"
}: FooterLogoProps) => {
  return (
    <a
      href={logo.href}
      className="flex items-center space-x-2 text-sm font-normal text-foreground hover:opacity-80 transition-opacity"
    >
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className="dark:invert"
      />
      <span className="font-medium">{brandName}</span>
    </a>
  );
};

export const FooterSocial = ({ socialLinks, className }: FooterSocialProps) => {
  return (
    <div className={cn("flex items-center space-x-4", className)}>
      {socialLinks.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={link.name}
        >
          <span className="text-sm">{link.name}</span>
        </a>
      ))}
    </div>
  );
};

export const FooterCopyright = ({ 
  copyright, 
  className 
}: { 
  copyright: string; 
  className?: string; 
}) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {copyright}
    </p>
  );
};
