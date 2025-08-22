import React from 'react';
import Avatar from './Avatar';

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  avatar?: string;
}

interface UserInfoCellProps {
  user: User | string | null | undefined;
  date?: string | Date;
  type: 'created' | 'updated';
}

const UserInfoCell: React.FC<UserInfoCellProps> = ({ user, date, type }) => {
  const getIcon = () => {
    if (type === 'created') {
      return (
        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    }
  };

  const getBgColor = () => {
    if (type === 'created') {
      return 'bg-blue-100 dark:bg-blue-900';
    } else {
      return 'bg-green-100 dark:bg-green-900';
    }
  };

  if (typeof user === 'object' && user) {
    const userObj = user as User;
    return (
      <div className="text-sm">
        <div className="flex items-center space-x-2">
          <Avatar
            user={userObj}
            size="sm"
            className="w-8 h-8"
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {userObj.firstName && userObj.lastName 
                ? `${userObj.firstName} ${userObj.lastName}` 
                : (userObj.name || userObj.email || 'Bilinmiyor')}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {userObj.email && userObj.email !== (userObj.firstName || userObj.lastName || userObj.name) ? userObj.email : ''}
            </div>
            {date && (
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {new Date(date).toLocaleDateString('tr-TR', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } else if (typeof user === 'string') {
    return (
      <div className="text-sm">
        <div className="flex items-center space-x-2">
          <Avatar
            user={{ name: user }}
            size="sm"
            className="w-8 h-8"
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {user}
            </div>
            {date && (
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {new Date(date).toLocaleDateString('tr-TR', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="text-sm text-gray-400 italic">
        Bilinmiyor
      </div>
    );
  }
};

export default UserInfoCell; 