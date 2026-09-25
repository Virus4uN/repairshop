// Format date to readable string
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date with time
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format currency (INR)
export const formatCurrency = (amount) => {
  if (amount == null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Status labels and colors
export const STATUS_CONFIG = {
  request_received: { label: 'Request Received', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  device_received: { label: 'Device Received', color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  inspection: { label: 'Inspection', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  diagnosis: { label: 'Diagnosis', color: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  repair_in_progress: { label: 'Repair in Progress', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  quality_check: { label: 'Quality Check', color: 'bg-cyan-100 text-cyan-700', dot: 'bg-cyan-500' },
  ready_for_pickup: { label: 'Ready for Pickup', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

// Status order for timeline
export const STATUS_ORDER = [
  'request_received',
  'device_received',
  'inspection',
  'diagnosis',
  'repair_in_progress',
  'quality_check',
  'ready_for_pickup',
  'completed',
];

// Get status index
export const getStatusIndex = (status) => STATUS_ORDER.indexOf(status);

// Truncate text
export const truncate = (str, len = 50) => {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
};
