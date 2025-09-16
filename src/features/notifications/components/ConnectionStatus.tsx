import React from 'react';
import { ConnectionInfo } from '../types';

interface ConnectionStatusProps {
  isConnected: boolean;
  connectionInfo: ConnectionInfo | null;
  onTestConnection: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  connectionInfo,
  onTestConnection
}) => {
  return (
    <div className={`rounded-xl p-4 border-2 transition-all duration-300 ${
      isConnected 
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
        : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}></div>
          
          <div className="flex flex-col">
            <span className={`font-semibold ${
              isConnected ? 'text-green-800' : 'text-red-800'
            }`}>
              {isConnected ? '🟢 Đã kết nối' : '🔴 Mất kết nối'}
            </span>
            
            {connectionInfo && (
              <span className="text-sm text-gray-600">
                Status: {connectionInfo.readyState}
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={onTestConnection}
          className="px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-lg hover:bg-sky-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        >
          🔍 Test kết nối
        </button>
      </div>
    </div>
  );
};

export default ConnectionStatus;