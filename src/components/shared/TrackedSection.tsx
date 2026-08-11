import React, { type ReactNode } from 'react';
import { useSectionVisibility } from '../../hooks/useSectionVisibility';

interface TrackedSectionProps {
  name: string;
  children: ReactNode;
}

const TrackedSection: React.FC<TrackedSectionProps> = ({ name, children }) => {
  const ref = useSectionVisibility(name);
  return <div ref={ref as React.RefObject<HTMLDivElement>}>{children}</div>;
};

export default TrackedSection;
