"use client";

import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import Image from "next/image";
import { type Certificate } from "@/types/certificate";

interface CertificateCardProps {
  certificate: Certificate;
}

export const CertificateCard = ({ certificate }: CertificateCardProps) => {
  return (
    <article
      className="group"
      role="article"
      aria-label={`Certificate: ${certificate.id}`}
    >
      <CardContainer className="group">
        <CardBody dynamicSize className="w-full">
          <CardItem translateZ="50" className="w-full">
            <div className="relative w-full overflow-hidden rounded-xl border border-border bg-card">
              <Image
                src={certificate.image}
                alt={`Certificate ${certificate.id}`}
                width={1200}
                height={900}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="w-full h-auto object-contain"
                priority
                loading="eager"
                unoptimized
              />
            </div>
          </CardItem>
        </CardBody>
      </CardContainer>
    </article>
  );
};

