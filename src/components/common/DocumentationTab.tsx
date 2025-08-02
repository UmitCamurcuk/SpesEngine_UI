import React, { useState } from 'react';
import Button from '../ui/Button';
import { useTranslation } from '../../context/i18nContext';

interface DocumentationTabProps {
  entityType: 'attribute' | 'attributeGroup' | 'category' | 'family' | 'itemType' | 'item' | 'relationship_type';
  entityName: string;
  customContent?: {
    title?: string;
    description?: string;
    usageGuidelines?: string[];
    integrationNotes?: string[];
    examples?: Array<{
      title: string;
      description: string;
      code?: string;
    }>;
  };
  onViewFullDocumentation?: () => void;
}

const DocumentationTab: React.FC<DocumentationTabProps> = ({
  entityType,
  entityName,
  customContent,
  onViewFullDocumentation
}) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<'overview' | 'guidelines' | 'integration' | 'examples'>('overview');

  const getEntityIcon = () => {
    const iconMap = {
      attribute: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      ),
      attributeGroup: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      ),
      category: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      ),
      family: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      ),
      itemType: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      ),
      item: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      ),
      relationship_type: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      )
    };
    return iconMap[entityType] || iconMap.attribute;
  };

  const getDefaultContent = (): {
    title?: string;
    description: string;
    usageGuidelines: string[];
    integrationNotes: string[];
    examples?: Array<{
      title: string;
      description: string;
      code?: string;
    }>;
  } => {
    const defaults = {
      attribute: {
        description: `Bu sayfa ${entityName} özniteliği hakkında detaylı bilgi içerir. Öznitelik, sistem içerisinde veri yapısını tanımlamak için kullanılır.`,
        usageGuidelines: [
          'Öznitelik değerlerini doğru formatta girin',
          'Zorunlu alanları boş bırakmayın',
          'Veri tipine uygun değerler kullanın',
          'Validasyon kurallarına dikkat edin'
        ],
        integrationNotes: [
          'API entegrasyonunda öznitelik ID\'sini kullanın',
          'Veri tipini doğru şekilde handle edin',
          'Null değerlere dikkat edin',
          'Validasyon hatalarını handle edin'
        ]
      },
      attributeGroup: {
        description: `Bu sayfa ${entityName} öznitelik grubu hakkında detaylı bilgi içerir. Öznitelik grupları, ilişkili öznitelikleri organize etmek için kullanılır.`,
        usageGuidelines: [
          'İlgili öznitelikleri aynı grupta toplayın',
          'Grup adını açıklayıcı şekilde belirleyin',
          'Grup içerisindeki öznitelik sırasına dikkat edin',
          'Gereksiz grup oluşturmaktan kaçının'
        ],
        integrationNotes: [
          'Grup ID\'sini kullanarak toplu öznitelik işlemleri yapabilirsiniz',
          'Grup içindeki özniteliklerin veri tiplerini kontrol edin',
          'Grup bazında validasyon kuralları uygulayabilirsiniz',
          'Grup hiyerarşisini koruyun'
        ]
      },
      category: {
        description: `Bu sayfa ${entityName} kategorisi hakkında detaylı bilgi içerir. Kategoriler, ürün ve içerik organizasyonu için kullanılır.`,
        usageGuidelines: [
          'Kategori hiyerarşisini mantıklı şekilde oluşturun',
          'Alt kategorileri doğru parent\'a bağlayın',
          'Kategori adlarını açık ve anlaşılır tutun',
          'Kategori açıklamalarını detaylandırın'
        ],
        integrationNotes: [
          'Kategori tree yapısını doğru şekilde handle edin',
          'Parent-child ilişkilerini kontrol edin',
          'Kategori filtreleme işlemlerinde performansı gözetin',
          'Kategori breadcrumb\'larını doğru oluşturun'
        ]
      },
      family: {
        description: `Bu sayfa ${entityName} ailesi hakkında detaylı bilgi içerir. Ürün aileleri, benzer özelliklerdeki ürünleri gruplandırmak için kullanılır.`,
        usageGuidelines: [
          'Benzer ürünleri aynı ailede toplayın',
          'Aile özniteliklerini doğru tanımlayın',
          'Aile hiyerarşisini mantıklı oluşturun',
          'Aile bazında kurallar belirleyin'
        ],
        integrationNotes: [
          'Aile bazında toplu işlemler yapabilirsiniz',
          'Aile özniteliklerini inherit edin',
          'Aile kurallarını ürünlere uygulayın',
          'Aile filtreleme işlemlerini optimize edin'
        ]
      },
      itemType: {
        description: `Bu sayfa ${entityName} öğe tipi hakkında detaylı bilgi içerir. Öğe tipleri, farklı türdeki varlıkları tanımlamak için kullanılır.`,
        usageGuidelines: [
          'Tip özniteliklerini doğru tanımlayın',
          'Tip bazında validasyon kuralları oluşturun',
          'Tip hiyerarşisini koruyun',
          'Tip özel davranışlarını belirleyin'
        ],
        integrationNotes: [
          'Tip bazında farklı işlemler uygulayın',
          'Tip özniteliklerini dinamik olarak yükleyin',
          'Tip validasyonlarını frontend\'de kontrol edin',
          'Tip bazında UI componentlerini seçin'
        ]
      },
      item: {
        description: `Bu sayfa ${entityName} öğesi hakkında detaylı bilgi içerir. Öğeler, sistemdeki temel veri yapılarını temsil eder.`,
        usageGuidelines: [
          'Öğe öznitelik değerlerini doğru girin',
          'Zorunlu alanları kontrol edin',
          'Öğe durumunu güncel tutun',
          'İlişkili öğelerle bağlantıları koruyun'
        ],
        integrationNotes: [
          'Öğe ID\'sini referans olarak kullanın',
          'Öğe durumu değişikliklerini takip edin',
          'Öğe ilişkilerini doğru handle edin',
          'Öğe geçmişini kaydedin'
        ]
      }
    };
    return defaults[entityType] || defaults.attribute;
  };

  const content = customContent || getDefaultContent();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-3">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {getEntityIcon()}
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {content.title || `${entityName} Dokümantasyonu`}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Kullanım kılavuzu ve entegrasyon notları
              </p>
            </div>
          </div>
          {onViewFullDocumentation && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewFullDocumentation}
              className="flex items-center"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Tam Dokümantasyon
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Genel Bakış', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
            { id: 'guidelines', label: 'Kullanım Kılavuzu', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { id: 'integration', label: 'Entegrasyon', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
            { id: 'examples', label: 'Örnekler', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' }
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
        {activeSection === 'overview' && (
          <div className="prose dark:prose-invert max-w-none">
            <h3>Açıklama</h3>
            <p>{content.description}</p>
            
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-blue-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-blue-800 dark:text-blue-200 font-medium">Önemli Not</h4>
                  <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                    Bu {entityType === 'attribute' ? 'öznitelik' : entityType === 'attributeGroup' ? 'öznitelik grubu' : entityType} ile ilgili değişiklikler sistem genelinde etkili olacaktır. Lütfen dikkatli olun.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'guidelines' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Kullanım Kılavuzu</h3>
              <div className="space-y-4">
                {content.usageGuidelines?.map((guideline, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-gray-700 dark:text-gray-300">{guideline}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-amber-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="text-amber-800 dark:text-amber-200 font-medium">Dikkat Edilecek Noktalar</h4>
                  <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                    Bu kurallara uyulmadığında sistem hataları oluşabilir veya veri bütünlüğü bozulabilir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'integration' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Entegrasyon Notları</h3>
              <div className="space-y-4">
                {content.integrationNotes?.map((note, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <p className="ml-3 text-gray-700 dark:text-gray-300">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-gray-900 dark:text-white font-medium mb-2">API Endpoint</h4>
              <code className="text-sm bg-gray-900 text-gray-100 px-3 py-2 rounded block">
                GET /api/{entityType}s/{'{id}'}
              </code>
            </div>
          </div>
        )}

        {activeSection === 'examples' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Kullanım Örnekleri</h3>
              
              {content.examples && content.examples.length > 0 ? (
                <div className="space-y-6">
                  {content.examples.map((example, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{example.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{example.description}</p>
                      {example.code && (
                        <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                          <code>{example.code}</code>
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Örnek Bulunamadı</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Bu {entityType} için henüz örnek eklenmemiş.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentationTab; 