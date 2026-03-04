import { memo } from 'react';
import './SkeletonCard.css';

export const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="dashboard-skeleton-card">
      <div className="dashboard-skeleton-line dashboard-skeleton-title" />
      <div className="dashboard-skeleton-line dashboard-skeleton-value" />
    </div>
  );
});
