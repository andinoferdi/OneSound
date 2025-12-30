import { type CertificateData } from "@/types/certificate";

export const getCertificateData = (): CertificateData => {
  return {
    certificates: [
      {
        id: "cert-1",
        image: "/images/certificates/1.jpg",
      },
      {
        id: "cert-2",
        image: "/images/certificates/2.jpg",
      },
    ],
  };
};

