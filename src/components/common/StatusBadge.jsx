import { STATUS_CONFIG } from '../../lib/helpers';

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-700' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot || 'bg-gray-400'}`} />
      {config.label}
    </span>
  );
}
