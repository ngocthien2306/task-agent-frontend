import React from 'react';

interface NotificationFiltersProps {
  currentFilter: 'all' | 'unread' | 'read';
  totalCount: number;
  unreadCount: number;
  readCount: number;
  onFilterChange: (filter: 'all' | 'unread' | 'read') => void;
  onRefresh: () => void;
  onClearAll: () => void;
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  currentFilter,
  totalCount,
  unreadCount,
  readCount,
  onFilterChange,
  onRefresh,
  onClearAll
}) => {
  const filters = [
    { key: 'all' as const, label: 'Tất cả', count: totalCount, icon: '📋' },
    { key: 'unread' as const, label: 'Chưa đọc', count: unreadCount, icon: '🔔' },
    { key: 'read' as const, label: 'Đã đọc', count: readCount, icon: '✅' }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((filter) => (
          <button
            key={filter.key}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
              currentFilter === filter.key
                ? 'bg-sky-500 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => onFilterChange(filter.key)}
          >
            <span>{filter.icon}</span>
            <span>{filter.label}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              currentFilter === filter.key
                ? 'bg-white bg-opacity-20 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span>🔄</span>
          <span>Làm mới</span>
        </button>
        
        <button
          onClick={onClearAll}
          disabled={totalCount === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <span>🗑️</span>
          <span>Xóa tất cả</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationFilters;