'use client';

import { useEffect } from 'react';

import { useTitleContext } from '@/components/providers/title-provider';

interface PageTitleProps {
  title: string;
}

export const PageTitle = ({ title }: PageTitleProps) => {
  const { setTitle } = useTitleContext();

  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);

  return null;
};

