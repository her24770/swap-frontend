import { CSSProperties } from 'react';
import './Skeleton.css';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
  style?: CSSProperties;
}

export function Skeleton({
  className = '',
  variant = 'rect',
  width,
  height,
  style = {},
}: SkeletonProps) {
  return (
    <div
      className={`skeleton skeleton--${variant} ${className}`}
      style={{
        ...(width !== undefined && { width }),
        ...(height !== undefined && { height }),
        ...style,
      }}
      aria-hidden="true"
    />
  );
}