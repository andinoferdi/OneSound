"use client";

import { useTitle } from "@/components/providers/title-provider";
import { useEffect } from "react";

interface PageTitleProps {
  title: string;
  children?: React.ReactNode;
}

export const PageTitle = ({ title, children }: PageTitleProps) => {
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);

  return children ? <>{children}</> : null;
};
