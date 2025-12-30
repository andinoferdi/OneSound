"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface TitleContextType {
  title: string;
  setTitle: (title: string) => void;
}

const TitleContext = createContext<TitleContextType | undefined>(undefined);

interface TitleProviderProps {
  children: React.ReactNode;
}

export const TitleProvider = ({ children }: TitleProviderProps) => {
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    document.title = title;
  }, [title]);

  const value = {
    title,
    setTitle,
  };

  return (
    <TitleContext.Provider value={value}>{children}</TitleContext.Provider>
  );
};

export const useTitle = () => {
  const context = useContext(TitleContext);

  if (context === undefined) {
    throw new Error("useTitle must be used within a TitleProvider");
  }

  return context;
};

export const useTitleContext = useTitle;
