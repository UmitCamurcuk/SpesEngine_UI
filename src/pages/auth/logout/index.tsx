import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch } from '../../../redux/store';
import { logout } from '../../../redux/features/auth/authSlice';
import { useTranslation } from '../../../context/i18nContext';

const LogoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [loadingStep, setLoadingStep] = useState(1);
  const [loadingText, setLoadingText] = useState('Çıkış yapılıyor');

  useEffect(() => {
    const performLogout = async () => {
      // Adım 1: Çıkış yapılıyor mesajı
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Adım 2: Redux state'i temizle
      setLoadingStep(2);
      setLoadingText('Oturum kapatılıyor');
      await dispatch(logout());
      
      // Adım 3: LocalStorage'ı temizle
      setLoadingStep(3);
      setLoadingText('Veriler temizleniyor');
      localStorage.clear();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Adım 4: Login sayfasına yönlendir
      navigate('/auth/login');
    };

    performLogout();
  }, [navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-600">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-semibold text-white mb-4"
        >
          {loadingText}
        </motion.h2>
        
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${(loadingStep / 3) * 100}%` }}
          transition={{ duration: 0.5 }}
          className="h-1 bg-white rounded-full mx-auto max-w-xs"
        />
      </div>
    </div>
  );
};

export default LogoutPage; 