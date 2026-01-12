'use client';

import { useEffect, useState } from 'react';

interface DateDisplayProps {
  date: string;
  format?: 'date' | 'datetime' | 'time';
  className?: string;
}

export default function DateDisplay({ date, format = 'date', className = '' }: DateDisplayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={className}>--</span>;
  }

  const dateObj = new Date(date);
  
  let formatOptions: Intl.DateTimeFormatOptions;
  
  switch (format) {
    case 'datetime':
      formatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      };
      break;
    case 'time':
      formatOptions = {
        hour: '2-digit',
        minute: '2-digit'
      };
      break;
    default: // date
      formatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };
  }

  return (
    <span className={className}>
      {dateObj.toLocaleString('fr-FR', formatOptions)}
    </span>
  );
}
