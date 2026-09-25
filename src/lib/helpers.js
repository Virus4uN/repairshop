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

// Default seed services
export const DEFAULT_SERVICES = [
  { id: 'srv-1', service_name: 'Mobile Repair', description: 'Screen replacement, battery replacement, charging port repair, software issues, water damage recovery.', estimated_time: '1-3 Hours', price: 499, is_active: true },
  { id: 'srv-2', service_name: 'Laptop Repair', description: 'Screen replacement, keyboard repair, motherboard repair, RAM/SSD upgrades, hinge repair, and virus removal.', estimated_time: '2-24 Hours', price: 799, is_active: true },
  { id: 'srv-3', service_name: 'Computer Repair', description: 'Hardware troubleshooting, component replacement, OS installation, network setup, and data recovery.', estimated_time: '2-24 Hours', price: 599, is_active: true },
  { id: 'srv-4', service_name: 'Tablet Repair', description: 'Screen replacement, battery replacement, charging issues, button repair, and software updates.', estimated_time: '1-4 Hours', price: 699, is_active: true },
  { id: 'srv-5', service_name: 'Printer Repair', description: 'Paper jam fix, ink system repair, connectivity issues, print head cleaning, and hardware replacement.', estimated_time: '2-6 Hours', price: 499, is_active: true },
  { id: 'srv-6', service_name: 'Electronics Repair', description: 'Gaming consoles, smartwatches, routers, speakers, power banks, and home electronics repair.', estimated_time: '2-48 Hours', price: 399, is_active: true }
];

// Helper to generate repair ID if database trigger is missing
export const generateRepairId = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `SHR-${year}-${rand}`;
};

// Truncate text
export const truncate = (str, len = 50) => {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
};
