import React from 'react';
import { History, ActionType } from '../../types/history';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

interface AttributeHistoryItemProps {
  history: History;
}

const AttributeHistoryItem: React.FC<AttributeHistoryItemProps> = ({ history }) => {
  // Eylem tipine göre renkler ve simgeler
  const actionColors = {
    [ActionType.CREATE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    [ActionType.UPDATE]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    [ActionType.DELETE]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    [ActionType.RESTORE]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
  };
  
  const actionIcons = {
    [ActionType.CREATE]: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    [ActionType.UPDATE]: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    [ActionType.DELETE]: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    [ActionType.RESTORE]: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    )
  };
  
  const actionLabels = {
    [ActionType.CREATE]: 'Oluşturuldu',
    [ActionType.UPDATE]: 'Güncellendi',
    [ActionType.DELETE]: 'Silindi',
    [ActionType.RESTORE]: 'Geri Yüklendi'
  };
  
  // Değişikliklerin okunabilir gösterimi için yardımcı fonksiyon
  const renderChangeValue = (value: any, fieldName?: string): React.ReactNode => {
    if (value === null || value === undefined) {
      // Özel durumlar için context'e göre farklı gösterim
      if (fieldName === 'isActive') {
        return <span className="text-red-600 dark:text-red-400">Pasif</span>;
      }
      if (fieldName === 'isRequired') {
        return <span className="text-gray-500 dark:text-gray-400">Opsiyonel</span>;
      }
      return <span className="italic text-gray-400 dark:text-gray-500">Yok</span>;
    }
    
    if (typeof value === 'boolean') {
      // Alan adına göre özel gösterim
      if (fieldName === 'isActive') {
        return value ? 
          <span className="text-green-600 dark:text-green-400">Aktif</span> : 
          <span className="text-red-600 dark:text-red-400">Pasif</span>;
      }
      if (fieldName === 'isRequired') {
        return value ? 
          <span className="text-orange-600 dark:text-orange-400">Zorunlu</span> : 
          <span className="text-gray-500 dark:text-gray-400">Opsiyonel</span>;
      }
      // Genel boolean gösterimi
      return value ? 'Evet' : 'Hayır';
    }
    
    if (Array.isArray(value)) {
      return value.length > 0 
        ? value.join(', ') 
        : <span className="italic text-gray-400 dark:text-gray-500">Boş liste</span>;
    }
    
    if (typeof value === 'object') {
      // ObjectId ise ID'yi göster
      if (value._id) {
        return <span className="font-mono">{value._id}</span>;
      }
      
      return <span className="font-mono">{JSON.stringify(value)}</span>;
    }
    
    return String(value);
  };
  
  const formatDate = (dateString: string) => {
    return dayjs(dateString).locale('tr').format('DD MMMM YYYY HH:mm:ss');
  };
  
  // Değişikliklerin listesini oluştur
  const renderChanges = () => {
    if (!history.changes || Object.keys(history.changes).length === 0) {
      return <p className="italic text-gray-500 dark:text-gray-400">Değişiklik yok veya bilgi mevcut değil.</p>;
    }
    
    const changeLabels: Record<string, string> = {
      name: 'Ad',
      code: 'Kod',
      type: 'Tip',
      description: 'Açıklama',
      isRequired: 'Zorunlu',
      isActive: 'Aktif',
      options: 'Seçenekler',
      family: 'Aile',
      parent: 'Üst Kategori',
      attributeGroups: 'Öznitelik Grupları'
    };
    
    return (
      <div className="mt-2 space-y-2">
        {Object.entries(history.changes).map(([field, change]) => (
          <div key={field} className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {changeLabels[field] || field}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Eski:</span>{' '}
                {renderChangeValue((change as any).from || (change as any).old, field)}
              </div>
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Yeni:</span>{' '}
                {renderChangeValue((change as any).to || (change as any).new, field)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm mb-4">
      <div className="p-4">
        <div className="flex items-start">
          {/* Sol taraf: eylem için icon ve tip */}
          <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${actionColors[history.action]}`}>
            {actionIcons[history.action]}
          </div>
          
          {/* Orta ve sağ kısım: içerik */}
          <div className="ml-4 flex-1">
            {/* Üst kısım: başlık ve tarih */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div className="text-lg font-medium text-gray-900 dark:text-white">
                {history.entityName} <span className={`text-sm font-normal px-2 py-1 rounded-full ${actionColors[history.action]}`}>
                  {actionLabels[history.action]}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 sm:text-right mt-1 sm:mt-0">
                {formatDate(history.createdAt)}
              </div>
            </div>
            
            {/* Alt kısım: işlemi yapan kullanıcı */}
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {history.createdBy?.name || 'Bilinmeyen Kullanıcı'}
            </div>

            {/* Yorum */}
            {history.comment && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <div className="flex items-start">
                  <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                      Yorum:
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-400 whitespace-pre-wrap">
                      {history.comment}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Değişiklikler */}
            {history.action !== ActionType.DELETE && renderChanges()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttributeHistoryItem; 