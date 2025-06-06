import React, { useState } from 'react';
import Button from '../ui/Button';
import { useTranslation } from '../../context/i18nContext';

interface StatisticMetric {
  id: string;
  name: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
  description?: string;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color: string;
  }>;
}

interface StatisticsTabProps {
  entityType: 'attribute' | 'attributeGroup' | 'category' | 'family' | 'itemType' | 'item';
  entityId?: string;
  metrics?: StatisticMetric[];
  chartData?: ChartData;
  customPeriod?: string;
  onPeriodChange?: (period: string) => void;
  onExportData?: () => void;
  isLoading?: boolean;
}

const StatisticsTab: React.FC<StatisticsTabProps> = ({
  entityType,
  entityId,
  metrics = [],
  chartData,
  customPeriod = '30d',
  onPeriodChange,
  onExportData,
  isLoading = false
}) => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<'overview' | 'detailed' | 'performance'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState(customPeriod);

  const getDefaultMetrics = (): StatisticMetric[] => {
    return [
      {
        id: 'total_usage',
        name: 'Toplam Kullanım',
        value: '1,245',
        change: 12.5,
        changeType: 'increase',
        icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
        description: 'Son 30 gündeki toplam kullanım sayısı'
      },
      {
        id: 'active_instances',
        name: 'Aktif Örnekler',
        value: '89',
        change: -3.2,
        changeType: 'decrease',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        description: 'Şu anda aktif olan örnek sayısı'
      },
      {
        id: 'performance_score',
        name: 'Performans Skoru',
        value: '94%',
        change: 2.1,
        changeType: 'increase',
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        description: 'Genel performans değerlendirmesi'
      },
      {
        id: 'error_rate',
        name: 'Hata Oranı',
        value: '0.8%',
        change: -0.3,
        changeType: 'decrease',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
        description: 'Son 30 gündeki hata oranı'
      }
    ];
  };

  const getDefaultChartData = (): ChartData => {
    return {
      labels: ['1 Ocak', '8 Ocak', '15 Ocak', '22 Ocak', '29 Ocak', '5 Şubat', '12 Şubat'],
      datasets: [
        {
          label: 'Kullanım',
          data: [120, 150, 180, 220, 190, 250, 300],
          color: '#3B82F6'
        },
        {
          label: 'Hatalar',
          data: [5, 8, 3, 12, 7, 9, 4],
          color: '#EF4444'
        }
      ]
    };
  };

  const displayMetrics = metrics.length > 0 ? metrics : getDefaultMetrics();
  const displayChartData = chartData || getDefaultChartData();

  const periods = [
    { value: '7d', label: 'Son 7 Gün' },
    { value: '30d', label: 'Son 30 Gün' },
    { value: '90d', label: 'Son 3 Ay' },
    { value: '1y', label: 'Son 1 Yıl' }
  ];

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  const getChangeIcon = (changeType?: string) => {
    switch (changeType) {
      case 'increase':
        return 'M7 14l3-3 3 3 5-5';
      case 'decrease':
        return 'M17 14l-3 3-3-3-5 5';
      default:
        return 'M5 12h14';
    }
  };

  const getChangeColor = (changeType?: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600 dark:text-green-400';
      case 'decrease':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-light border-t-transparent dark:border-primary-dark dark:border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-lg bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center mr-3">
              <svg className="h-5 w-5 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                İstatistikler ve Analitik
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Performans metrikleri ve kullanım analizi
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
            {onExportData && (
              <Button variant="outline" size="sm" onClick={onExportData}>
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Dışa Aktar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Genel Bakış', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { id: 'detailed', label: 'Detaylı Analiz', icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { id: 'performance', label: 'Performans', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeView === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveView(tab.id as any)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeView === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Temel Metrikler</h3>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayMetrics.map((metric) => (
                <div key={metric.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-8 w-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center">
                      <svg className="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={metric.icon} />
                      </svg>
                    </div>
                    {metric.change !== undefined && (
                      <div className={`flex items-center text-sm ${getChangeColor(metric.changeType)}`}>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getChangeIcon(metric.changeType)} />
                        </svg>
                        {Math.abs(metric.change)}%
                      </div>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {metric.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {metric.name}
                  </div>
                  {metric.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {metric.description}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Simple Chart */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Kullanım Trendi</h4>
              <div className="space-y-4">
                {displayChartData.datasets.map((dataset, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: dataset.color }}
                        ></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{dataset.label}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {dataset.data[dataset.data.length - 1]}
                      </span>
                    </div>
                    <div className="flex items-end space-x-1 h-16">
                      {dataset.data.map((value, dataIndex) => {
                        const maxValue = Math.max(...dataset.data);
                        const height = (value / maxValue) * 100;
                        return (
                          <div
                            key={dataIndex}
                            className="flex-1 rounded-t"
                            style={{
                              backgroundColor: dataset.color,
                              height: `${height}%`,
                              minHeight: '2px'
                            }}
                          ></div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{displayChartData.labels[0]}</span>
                      <span>{displayChartData.labels[displayChartData.labels.length - 1]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'detailed' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Detaylı Analiz</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Usage Distribution */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Kullanım Dağılımı</h4>
                <div className="space-y-4">
                  {[
                    { label: 'Web Arayüzü', value: 65, color: 'bg-blue-500' },
                    { label: 'API Erişimi', value: 25, color: 'bg-green-500' },
                    { label: 'Mobil Uygulama', value: 10, color: 'bg-purple-500' }
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{item.value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`${item.color} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${item.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response Times */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Yanıt Süreleri</h4>
                <div className="space-y-4">
                  {[
                    { metric: 'Ortalama', value: '125ms', status: 'good' },
                    { metric: 'P95', value: '280ms', status: 'warning' },
                    { metric: 'P99', value: '450ms', status: 'critical' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.metric}</span>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 dark:text-white mr-2">{item.value}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'good' ? 'bg-green-500' :
                          item.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Errors */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">En Sık Hatalar</h4>
                <div className="space-y-3">
                  {[
                    { error: 'Validation Error', count: 23, change: -12 },
                    { error: 'Permission Denied', count: 18, change: 5 },
                    { error: 'Resource Not Found', count: 12, change: -3 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.error}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.count} kez</div>
                      </div>
                      <div className={`text-sm ${item.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.change > 0 ? '+' : ''}{item.change}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Activity */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Kullanıcı Aktivitesi</h4>
                <div className="space-y-3">
                  {[
                    { time: '09:00', activity: 'Yoğun', users: 45 },
                    { time: '12:00', activity: 'Normal', users: 28 },
                    { time: '15:00', activity: 'Düşük', users: 12 },
                    { time: '18:00', activity: 'Normal', users: 22 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{item.time}</span>
                        <span className={`ml-3 px-2 py-1 rounded text-xs font-medium ${
                          item.activity === 'Yoğun' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          item.activity === 'Normal' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {item.activity}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.users}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'performance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performans Analizi</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance Score */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Genel Performans</h4>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">94</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">100 üzerinden</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Erişilebilirlik</h4>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">99.9%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">Uptime</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Son 30 gün: 43m kesinti
                  </div>
                </div>
              </div>

              {/* Efficiency */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Verimlilik</h4>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">87%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">Başarı oranı</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Önceki aya göre +3%
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Details */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Performans Detayları</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 text-gray-500 dark:text-gray-400">Metrik</th>
                      <th className="text-left py-2 text-gray-500 dark:text-gray-400">Mevcut</th>
                      <th className="text-left py-2 text-gray-500 dark:text-gray-400">Hedef</th>
                      <th className="text-left py-2 text-gray-500 dark:text-gray-400">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { metric: 'Yanıt Süresi', current: '125ms', target: '<200ms', status: 'good' },
                      { metric: 'Throughput', current: '1.2K req/s', target: '>1K req/s', status: 'good' },
                      { metric: 'Hata Oranı', current: '0.8%', target: '<1%', status: 'good' },
                      { metric: 'CPU Kullanımı', current: '78%', target: '<80%', status: 'warning' },
                      { metric: 'Bellek Kullanımı', current: '85%', target: '<90%', status: 'good' }
                    ].map((row, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-600">
                        <td className="py-2 font-medium text-gray-900 dark:text-white">{row.metric}</td>
                        <td className="py-2 text-gray-600 dark:text-gray-400">{row.current}</td>
                        <td className="py-2 text-gray-600 dark:text-gray-400">{row.target}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            row.status === 'good' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            row.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {row.status === 'good' ? 'İyi' : row.status === 'warning' ? 'Uyarı' : 'Kritik'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsTab; 