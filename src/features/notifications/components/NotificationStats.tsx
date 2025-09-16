import React from 'react';

interface NotificationStatsProps {
  totalCount: number;
  unreadCount: number;
  readCount: number;
}

const NotificationStats: React.FC<NotificationStatsProps> = ({
  totalCount,
  unreadCount,
  readCount
}) => {
  const stats = [
    {
      icon: '📊',
      label: 'Tổng thông báo',
      value: totalCount,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: '🔔',
      label: 'Chưa đọc',
      value: unreadCount,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: '✅',
      label: 'Đã đọc',
      value: readCount,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} rounded-2xl p-6 border border-opacity-20 hover:shadow-lg transition-shadow duration-300`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-2xl font-bold ${stat.textColor} mb-1`}>
                {stat.value}
              </div>
              <div className="text-gray-600 text-sm font-medium">
                {stat.label}
              </div>
            </div>
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationStats;