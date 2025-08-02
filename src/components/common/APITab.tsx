import React, { useState } from 'react';
import Button from '../ui/Button';
import { useTranslation } from '../../context/i18nContext';

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  requestBody?: {
    type: string;
    properties: Array<{
      name: string;
      type: string;
      required: boolean;
      description: string;
    }>;
  };
  responses?: Array<{
    status: number;
    description: string;
    schema?: string;
  }>;
  example?: {
    request?: string;
    response?: string;
  };
}

interface APITabProps {
  entityType: 'attribute' | 'attributeGroup' | 'category' | 'family' | 'itemType' | 'item' | 'relationship_type';
  entityId?: string;
  endpoints?: APIEndpoint[];
  baseUrl?: string;
  onTestEndpoint?: (endpoint: APIEndpoint, data?: any) => void;
  isLoading?: boolean;
}

const APITab: React.FC<APITabProps> = ({
  entityType,
  entityId,
  endpoints = [],
  baseUrl = '/api',
  onTestEndpoint,
  isLoading = false
}) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<'endpoints' | 'testing' | 'schemas'>('endpoints');
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [testData, setTestData] = useState<string>('');
  const [testResult, setTestResult] = useState<string>('');

  const getDefaultEndpoints = (): APIEndpoint[] => {
    const entityPlural = entityType === 'relationship_type' ? 'relationship-types' : `${entityType}s`;
    
    return [
      {
        method: 'GET',
        path: `/${entityPlural}`,
        description: `Tüm ${entityType === 'relationship_type' ? 'ilişki tipi' : entityType} kayıtlarını getirir`,
        parameters: [
          { name: 'page', type: 'number', required: false, description: 'Sayfa numarası' },
          { name: 'limit', type: 'number', required: false, description: 'Sayfa başına kayıt sayısı' },
          { name: 'search', type: 'string', required: false, description: 'Arama terimi' }
        ],
        responses: [
          { status: 200, description: 'Başarılı', schema: `${entityType}[]` },
          { status: 400, description: 'Geçersiz parametreler' },
          { status: 500, description: 'Sunucu hatası' }
        ],
        example: {
          request: `GET ${baseUrl}/${entityPlural}?page=1&limit=10`,
          response: JSON.stringify({
            data: [],
            pagination: {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0
            }
          }, null, 2)
        }
      },
      {
        method: 'GET',
        path: `/${entityPlural}/{id}`,
        description: `Belirli bir ${entityType === 'relationship_type' ? 'ilişki tipi' : entityType} kaydını getirir`,
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Kayıt ID\'si' }
        ],
        responses: [
          { status: 200, description: 'Başarılı', schema: entityType },
          { status: 404, description: 'Kayıt bulunamadı' },
          { status: 500, description: 'Sunucu hatası' }
        ],
        example: {
          request: `GET ${baseUrl}/${entityPlural}/123`,
          response: JSON.stringify({
            id: '123',
            name: 'Örnek Kayıt',
            createdAt: '2024-01-01T00:00:00Z'
          }, null, 2)
        }
      },
      {
        method: 'POST',
        path: `/${entityPlural}`,
        description: `Yeni ${entityType} kaydı oluşturur`,
        requestBody: {
          type: 'object',
          properties: [
            { name: 'name', type: 'string', required: true, description: 'Kayıt adı' },
            { name: 'description', type: 'string', required: false, description: 'Açıklama' }
          ]
        },
        responses: [
          { status: 201, description: 'Başarıyla oluşturuldu', schema: entityType },
          { status: 400, description: 'Geçersiz veri' },
          { status: 500, description: 'Sunucu hatası' }
        ],
        example: {
          request: JSON.stringify({
            name: 'Yeni Kayıt',
            description: 'Açıklama'
          }, null, 2),
          response: JSON.stringify({
            id: '124',
            name: 'Yeni Kayıt',
            description: 'Açıklama',
            createdAt: '2024-01-01T00:00:00Z'
          }, null, 2)
        }
      },
      {
        method: 'PUT',
        path: `/${entityPlural}/{id}`,
        description: `Mevcut ${entityType} kaydını günceller`,
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Kayıt ID\'si' }
        ],
        requestBody: {
          type: 'object',
          properties: [
            { name: 'name', type: 'string', required: false, description: 'Kayıt adı' },
            { name: 'description', type: 'string', required: false, description: 'Açıklama' }
          ]
        },
        responses: [
          { status: 200, description: 'Başarıyla güncellendi', schema: entityType },
          { status: 404, description: 'Kayıt bulunamadı' },
          { status: 400, description: 'Geçersiz veri' },
          { status: 500, description: 'Sunucu hatası' }
        ]
      },
      {
        method: 'DELETE',
        path: `/${entityPlural}/{id}`,
        description: `${entityType} kaydını siler`,
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Kayıt ID\'si' }
        ],
        responses: [
          { status: 204, description: 'Başarıyla silindi' },
          { status: 404, description: 'Kayıt bulunamadı' },
          { status: 500, description: 'Sunucu hatası' }
        ]
      }
    ];
  };

  const displayEndpoints = endpoints.length > 0 ? endpoints : getDefaultEndpoints();

  const getMethodColor = (method: string) => {
    const colorMap: { [key: string]: string } = {
      GET: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      POST: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colorMap[method] || colorMap.GET;
  };

  const handleTestEndpoint = () => {
    if (selectedEndpoint) {
      try {
        const data = testData ? JSON.parse(testData) : undefined;
        onTestEndpoint?.(selectedEndpoint, data);
        setTestResult('Test başlatıldı...');
      } catch (error) {
        setTestResult('Geçersiz JSON formatı');
      }
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
            <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center mr-3">
              <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                API Dokümantasyonu
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                REST API endpoint'leri ve test arayüzü
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Base URL:</span>
            <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {baseUrl}
            </code>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'endpoints', label: 'Endpoint\'ler', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
            { id: 'testing', label: 'Test Arayüzü', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { id: 'schemas', label: 'Veri Şemaları', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeSection === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveSection(tab.id as any)}
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
        {activeSection === 'endpoints' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">API Endpoint'leri</h3>
            <div className="space-y-4">
              {displayEndpoints.map((endpoint, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                      <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {endpoint.path}
                      </code>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEndpoint(endpoint);
                        setActiveSection('testing');
                      }}
                    >
                      Test Et
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {endpoint.description}
                  </p>

                  {/* Parameters */}
                  {endpoint.parameters && endpoint.parameters.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Parametreler</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-1 px-2 text-gray-500 dark:text-gray-400">Ad</th>
                              <th className="text-left py-1 px-2 text-gray-500 dark:text-gray-400">Tip</th>
                              <th className="text-left py-1 px-2 text-gray-500 dark:text-gray-400">Zorunlu</th>
                              <th className="text-left py-1 px-2 text-gray-500 dark:text-gray-400">Açıklama</th>
                            </tr>
                          </thead>
                          <tbody>
                            {endpoint.parameters.map((param, paramIndex) => (
                              <tr key={paramIndex}>
                                <td className="py-1 px-2 font-mono text-gray-900 dark:text-gray-100">{param.name}</td>
                                <td className="py-1 px-2 text-gray-600 dark:text-gray-400">{param.type}</td>
                                <td className="py-1 px-2">
                                  {param.required ? (
                                    <span className="text-red-600 dark:text-red-400">✓</span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="py-1 px-2 text-gray-600 dark:text-gray-400">{param.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Request Body */}
                  {endpoint.requestBody && (
                    <div className="mb-3">
                      <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">İstek Gövdesi</h5>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded p-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tip: {endpoint.requestBody.type}</p>
                        <div className="space-y-1">
                          {endpoint.requestBody.properties.map((prop, propIndex) => (
                            <div key={propIndex} className="flex items-center text-xs">
                              <span className="font-mono text-gray-900 dark:text-gray-100">{prop.name}</span>
                              <span className="mx-1 text-gray-400">:</span>
                              <span className="text-gray-600 dark:text-gray-400">{prop.type}</span>
                              {prop.required && <span className="ml-1 text-red-600 dark:text-red-400">*</span>}
                              <span className="ml-2 text-gray-500 dark:text-gray-500">- {prop.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Responses */}
                  {endpoint.responses && endpoint.responses.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Yanıtlar</h5>
                      <div className="space-y-1">
                        {endpoint.responses.map((response, respIndex) => (
                          <div key={respIndex} className="flex items-center text-xs">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium mr-2 ${
                              response.status < 300 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              response.status < 400 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {response.status}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">{response.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'testing' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">API Test Arayüzü</h3>
            
            {selectedEndpoint ? (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${getMethodColor(selectedEndpoint.method)}`}>
                      {selectedEndpoint.method}
                    </span>
                    <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {selectedEndpoint.path}
                    </code>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedEndpoint.description}
                  </p>
                </div>

                {selectedEndpoint.requestBody && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      İstek Verileri (JSON)
                    </label>
                    <textarea
                      value={testData}
                      onChange={(e) => setTestData(e.target.value)}
                      className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                      placeholder={selectedEndpoint.example?.request || '{\n  "name": "Örnek Veri"\n}'}
                    />
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button variant="primary" onClick={handleTestEndpoint}>
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-5 4h1m4 0h1M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Test Et
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedEndpoint(null)}>
                    Temizle
                  </Button>
                </div>

                {testResult && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Test Sonucu
                    </label>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {testResult}
                    </pre>
                  </div>
                )}

                {selectedEndpoint.example && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEndpoint.example.request && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Örnek İstek
                        </label>
                        <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                          {selectedEndpoint.example.request}
                        </pre>
                      </div>
                    )}
                    {selectedEndpoint.example.response && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Örnek Yanıt
                        </label>
                        <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                          {selectedEndpoint.example.response}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Endpoint Seçilmedi</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Test etmek için bir endpoint seçin.
                </p>
              </div>
            )}
          </div>
        )}

        {activeSection === 'schemas' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Veri Şemaları</h3>
            
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Şeması
                </h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
{JSON.stringify({
  id: "string",
  name: "string", 
  description: "string",
  translations: {
    tr: {
      name: "string",
      description: "string"
    },
    en: {
      name: "string", 
      description: "string"
    }
  },
  createdAt: "datetime",
  updatedAt: "datetime",
  createdBy: "string",
  updatedBy: "string"
}, null, 2)}
                </pre>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  Pagination Şeması
                </h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
{JSON.stringify({
  data: "array",
  pagination: {
    page: "number",
    limit: "number", 
    total: "number",
    totalPages: "number",
    hasNext: "boolean",
    hasPrev: "boolean"
  }
}, null, 2)}
                </pre>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  Hata Yanıt Şeması
                </h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
{JSON.stringify({
  error: {
    code: "string",
    message: "string",
    details: "array",
    timestamp: "datetime"
  }
}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default APITab; 