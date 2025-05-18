import { toast, ToastOptions } from 'react-toastify';
import { useTranslation } from '../context/i18nContext';

// Varsayılan toast ayarları
const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored"
};

// Toast tipleri için interface
interface ToastParams {
  message: string;
  namespace?: string;
  options?: ToastOptions;
}

// Toast servisi
const toastService = {
  success({ message, namespace = 'system', options = {} }: ToastParams) {
    toast.success(message, {
      ...defaultOptions,
      ...options,
      className: 'bg-green-500'
    });
  },

  error({ message, namespace = 'system', options = {} }: ToastParams) {
    toast.error(message, {
      ...defaultOptions,
      ...options,
      className: 'bg-red-500'
    });
  },

  warning({ message, namespace = 'system', options = {} }: ToastParams) {
    toast.warning(message, {
      ...defaultOptions,
      ...options,
      className: 'bg-yellow-500'
    });
  },

  info({ message, namespace = 'system', options = {} }: ToastParams) {
    toast.info(message, {
      ...defaultOptions,
      ...options,
      className: 'bg-blue-500'
    });
  },

  // Özel durumlarda kullanılabilecek genel toast fonksiyonu
  custom({ message, options = {} }: Omit<ToastParams, 'namespace'>) {
    toast(message, {
      ...defaultOptions,
      ...options
    });
  },

  // İşlem başarılı mesajları
  saveSuccess() {
    this.success({ message: 'Değişiklikler başarıyla kaydedildi' });
  },

  // Genel hata mesajları
  saveError() {
    this.error({ message: 'Kaydetme işlemi sırasında bir hata oluştu' });
  },

  updateSuccess() {
    this.success({ message: 'Güncelleme işlemi başarıyla tamamlandı' });
  },

  updateError() {
    this.error({ message: 'Güncelleme işlemi sırasında bir hata oluştu' });
  },

  deleteSuccess() {
    this.success({ message: 'Silme işlemi başarıyla tamamlandı' });
  },

  deleteError() {
    this.error({ message: 'Silme işlemi sırasında bir hata oluştu' });
  },

  // API hataları
  networkError() {
    this.error({ message: 'Sunucu ile bağlantı kurulamadı' });
  },

  // Doğrulama mesajları
  validationError() {
    this.warning({ message: 'Lütfen tüm zorunlu alanları doldurun' });
  },

  // Yetki hataları
  unauthorizedError() {
    this.error({ message: 'Bu işlem için yetkiniz bulunmuyor' });
  },

  // Özel işlem mesajları
  uploadSuccess() {
    this.success({ message: 'Dosya başarıyla yüklendi' });
  },

  uploadError() {
    this.error({ message: 'Dosya yüklenirken bir hata oluştu' });
  },

  // Yükleme işlemleri
  loadSuccess() {
    this.success({ message: 'Veriler başarıyla yüklendi' });
  },

  loadError() {
    this.error({ message: 'Veriler yüklenirken bir hata oluştu' });
  },

  // Dil işlemleri
  languageUpdated() {
    this.success({ message: 'Dil ayarları başarıyla güncellendi' });
  }
};

export default toastService; 