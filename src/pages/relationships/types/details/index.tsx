import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Badge from '../../../../components/ui/Badge';
import { useNotification } from '../../../../components/notifications';
import { IRelationshipType } from '../../../../types/relationship';
import Breadcrumb from '../../../../components/common/Breadcrumb';
import relationshipService from '../../../../services/api/relationshipService';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useTranslation } from '../../../../context/i18nContext';

// UTILITY COMPONENTS
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const RelationshipTypeDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t, currentLanguage } = useTranslation();
  const { showModal, showToast } = useNotification();
  
  // State management
  const [activeTab, setActiveTab] = useState<string>('details');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showJsonPreview, setShowJsonPreview] = useState<boolean>(false);
  
  // Data state
  const [relationshipType, setRelationshipType] = useState<IRelationshipType | null>(null);

  // Load relationship type data
  useEffect(() => {
    const fetchRelationshipTypeDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🔍 Fetching relationship type details for ID:', id);
        const data = await relationshipService.getRelationshipTypeById(id);
        console.log('✅ Relationship type data received:', data);
        
        setRelationshipType(data);
      } catch (err: any) {
        console.error('❌ Error fetching relationship type:', err);
        setError('İlişki tipi verileri yüklenirken bir hata oluştu: ' + (err.message || err));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRelationshipTypeDetails();
  }, [id]);

  // Handle delete with confirmation
  const handleDeleteWithConfirmation = () => {
    showModal({
      type: 'error',
      title: 'İlişki Tipini Sil',
      message: 'Bu ilişki tipini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm ilgili ilişkiler de silinecektir.',
      primaryButton: {
        text: 'Sil',
        onClick: handleDelete,
        variant: 'error'
      },
      secondaryButton: {
        text: 'İptal',
        onClick: () => {}
      }
    });
  };

  // Handle delete
  const handleDelete = async () => {
    if (!relationshipType) return;
    
    try {
      await relationshipService.deleteRelationshipType(relationshipType._id);
      showToast({
        title: 'Başarılı!',
        message: 'İlişki tipi başarıyla silindi',
        type: 'success'
      });
      navigate('/relationships');
    } catch (err: any) {
      console.error('❌ Error deleting relationship type:', err);
      const errorMessage = err.response?.data?.message || err.message || 'İlişki tipi silinirken bir hata oluştu';
      showToast({
        title: 'Hata!',
        message: errorMessage,
        type: 'error'
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">İlişki tipi yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !relationshipType) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Hata Oluştu</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="space-x-3">
            <Button onClick={() => window.location.reload()} variant="primary">
              Tekrar Dene
            </Button>
            <Button onClick={() => navigate('/relationships/types')} variant="secondary">
              Listeye Dön
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!relationshipType) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">İlişki Tipi Bulunamadı</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Aradığınız ilişki tipi mevcut değil veya silinmiş olabilir.</p>
                      <Button onClick={() => navigate('/relationships')} variant="primary">
              Listeye Dön
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="container mx-auto px-4">
        {/* BREADCRUMB */}
        <div className="flex items-center justify-between">
                      <Breadcrumb 
              items={[
                { label: 'İlişkiler', path: '/relationships' },
                { label: relationshipType.name || 'İlişki Tipi Detayı' }
              ]} 
            />
        </div>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <Link to="/relationships" className="mr-4">
              <Button variant="outline" size="sm" className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Geri
              </Button>
            </Link>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 ${
              relationshipType.isDirectional
                ? 'bg-green-100 dark:bg-green-900/50'
                : 'bg-purple-100 dark:bg-purple-900/50'
            }`}>
              {relationshipType.isDirectional ? (
                <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {relationshipType.name}
              </h1>
              <div className="flex items-center mt-1">
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                  {relationshipType.code}
                </span>
                <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                <Badge color={relationshipType.isDirectional ? 'success' : 'secondary'}>
                  {relationshipType.isDirectional ? 'Yönlü' : 'Çift Yönlü'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={() => setShowJsonPreview(!showJsonPreview)}
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              JSON Görüntüle
            </Button>
            <Button
              variant="secondary"
              className="flex items-center text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
              onClick={handleDeleteWithConfirmation}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Sil
            </Button>
          </div>
        </div>

        {/* JSON PREVIEW */}
        {showJsonPreview && (
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">JSON Önizleme</h2>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(relationshipType, null, 2))}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Kopyala
              </Button>
            </CardHeader>
            <CardBody>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>{JSON.stringify(relationshipType, null, 2)}</code>
              </pre>
            </CardBody>
          </Card>
        )}

        {/* TABS NAVIGATION */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('details')}
            >
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Genel Bilgiler
              </div>
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'configuration'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('configuration')}
            >
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Yapılandırma
              </div>
            </button>
          </nav>
        </div>

        {/* TAB CONTENT - DETAILS */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Genel Bakış</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Açıklama</h3>
                      <p className="mt-2 text-gray-900 dark:text-gray-100">
                        {relationshipType.description || 'Bu ilişki tipi için açıklama bulunmuyor.'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Yönlülük</h3>
                        <div className="mt-2 flex items-center">
                          <div className={`h-4 w-4 rounded-full mr-2 ${
                            relationshipType.isDirectional 
                              ? 'bg-green-500' 
                              : 'bg-purple-500'
                          }`}></div>
                          <span className="text-gray-900 dark:text-gray-100">
                            {relationshipType.isDirectional ? 'Yönlü İlişki' : 'Çift Yönlü İlişki'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Oluşturulma</h3>
                        <p className="mt-2 text-gray-900 dark:text-gray-100">
                          {dayjs(relationshipType.createdAt).format('DD MMMM YYYY')}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Güncelleme</h3>
                        <p className="mt-2 text-gray-900 dark:text-gray-100">
                          {dayjs(relationshipType.updatedAt).format('DD MMMM YYYY')}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Temel Bilgiler</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Kod</h3>
                      <p className="mt-1 text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {relationshipType.code}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tip</h3>
                      <div className="mt-1">
                        <Badge color={relationshipType.isDirectional ? 'success' : 'secondary'}>
                          {relationshipType.isDirectional ? 'Yönlü' : 'Çift Yönlü'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Oluşturulma</h3>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {dayjs(relationshipType.createdAt).format('DD MMMM YYYY')}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Güncelleme</h3>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {dayjs(relationshipType.updatedAt).format('DD MMMM YYYY')}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {/* TAB CONTENT - CONFIGURATION */}
        {activeTab === 'configuration' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Allowed Source Types */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Kaynak Varlık Tipleri
                    {relationshipType.isDirectional && (
                      <span className="text-sm text-gray-500 ml-2">(İlişkiyi başlatan)</span>
                    )}
                  </h3>
                </CardHeader>
                <CardBody>
                  {relationshipType.allowedSourceTypes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {relationshipType.allowedSourceTypes.map((type, index) => (
                        <Badge key={index} color="light">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      Hiç kaynak tip tanımlanmamış
                    </p>
                  )}
                </CardBody>
              </Card>

              {/* Allowed Target Types */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Hedef Varlık Tipleri
                    {relationshipType.isDirectional && (
                      <span className="text-sm text-gray-500 ml-2">(İlişkinin hedefi)</span>
                    )}
                  </h3>
                </CardHeader>
                <CardBody>
                  {relationshipType.allowedTargetTypes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {relationshipType.allowedTargetTypes.map((type, index) => (
                        <Badge key={index} color="light">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      Hiç hedef tip tanımlanmamış
                    </p>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Metadata */}
            {relationshipType.metadata && Object.keys(relationshipType.metadata).length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Metadata</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {Object.entries(relationshipType.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{key}:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Relationship Direction Visualization */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">İlişki Görselleştirmesi</h3>
              </CardHeader>
              <CardBody>
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Kaynak</span>
                    </div>
                    
                    <div className="flex items-center">
                      {relationshipType.isDirectional ? (
                        <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">Hedef</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {relationshipType.isDirectional 
                      ? 'Bu ilişki yönlüdür - sadece kaynaktan hedefe doğru çalışır'
                      : 'Bu ilişki çift yönlüdür - her iki yönde de çalışır'
                    }
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelationshipTypeDetailsPage;