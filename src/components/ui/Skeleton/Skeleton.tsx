// components/ui/Skeleton/Skeleton.jsx
import './Skeleton.css';

export function Skeleton({ 
  className = '', 
  variant = 'rect',  // 'rect' | 'circle' | 'text'
  width,
  height,
  style = {},
}) {
  return (
    <div
      className={`skeleton skeleton--${variant} ${className}`}
      style={{
        ...(width && { width }),
        ...(height && { height }),
        ...style,
      }}
      aria-hidden="true"
    />
  );
}