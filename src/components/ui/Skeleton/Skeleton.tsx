import './Skeleton.css';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export function Skeleton({
  className = '',
  variant = 'rect',
}: SkeletonProps) {
  return (
    <div
      className={`skeleton skeleton--${variant} ${className}`}
      aria-hidden="true"
    />
  );
}