export interface FooterConfig {
  copyright: string;
}

export const getFooterConfig = (): FooterConfig => {
  return {
    copyright: "© 2025 AndinoFerdi. All rights reserved.",
  };
};
