import React from 'react';

// Reusable status badge with semantic color coding
const StatusBadge = ({ status }) => {
  if (!status && status !== false) return null;

  const getBadgeClass = (val) => {
    switch (val) {
      case 'AVAILABLE':
      case 'COMPLETED':
      case 'RETURNED':
      case true:
      case 'ACTIVE':
        return 'badge-success';

      case 'UNDER_MAINTENANCE':
      case 'RETURNED_WITH_ISSUES':
      case 'CLOSED':
        return 'badge-warning';

      case 'CANCELLED':
      case 'DAMAGED':
      case false:
      case 'INACTIVE':
        return 'badge-danger';

      case 'BOOKED':
      case 'OPEN':
      case 'ISSUED':
      case 'IN_PROGRESS':
        return 'badge-info';

      case 'ADMIN':
        return 'badge-danger';
      case 'LAB_INCHARGE':
        return 'badge-info';
      case 'STUDENT':
        return 'badge-success';

      default:
        return 'badge-secondary';
    }
  };

  const getLabel = (val) => {
    if (val === true) return 'Active';
    if (val === false) return 'Inactive';
    if (val === 'UNDER_MAINTENANCE') return 'Maintenance';
    if (val === 'RETURNED_WITH_ISSUES') return 'Returned (Damage)';
    return String(val).replace(/_/g, ' ');
  };

  return (
    <span className={`badge ${getBadgeClass(status)}`}>
      {getLabel(status)}
    </span>
  );
};

export default StatusBadge;
