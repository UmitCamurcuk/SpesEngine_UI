import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { useTheme } from '../../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { register } from '../../../redux/features/auth/authSlice';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { themeType, toggleTheme } = useTheme();
  
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      // location.state?.from?.pathname varsa oraya, yoksa ana sayfaya yönlendir
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
      navigate(from);
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setPasswordError('Şifreler eşleşmiyor.');
      return;
    }
    
    setPasswordError(null);
    
    // Redux action'ı ile register işlemini gerçekleştir
    dispatch(register({
      firstName,
      lastName,
      email,
      password
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md"
          aria-label={themeType === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
        >
          {themeType === 'dark' ? (
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary-light dark:bg-primary-dark rounded-full flex items-center justify-center text-white text-3xl font-bold">
            M
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Yeni hesap oluşturun
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Veya{' '}
          <Link to="/auth/login" className="font-medium text-primary-light dark:text-primary-dark hover:text-blue-500">
            mevcut hesabınızla giriş yapın
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {(error || passwordError) && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {passwordError || error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Ad"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                fullWidth
              />
              <Input
                label="Soyad"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                fullWidth
              />
            </div>

            <Input
              label="E-posta Adresi"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoComplete="email"
            />

            <Input
              label="Şifre"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete="new-password"
            />

            <Input
              label="Şifreyi Doğrula"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              autoComplete="new-password"
              error={password !== confirmPassword && confirmPassword !== '' ? 'Şifreler eşleşmiyor' : ''}
            />

            <div className="flex items-center">
              <input
                id="agree_terms"
                name="agree_terms"
                type="checkbox"
                className="h-4 w-4 text-primary-light dark:text-primary-dark focus:ring-blue-500 border-gray-300 rounded"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                required
              />
              <label htmlFor="agree_terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                <span>
                  <a href="#" className="font-medium text-primary-light dark:text-primary-dark">
                    Kullanım Koşulları
                  </a>{' '}
                  ve{' '}
                  <a href="#" className="font-medium text-primary-light dark:text-primary-dark">
                    Gizlilik Politikası
                  </a>
                  'nı kabul ediyorum
                </span>
              </label>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full py-2"
                isLoading={loading}
                disabled={!agreeTerms || password !== confirmPassword}
              >
                Kaydol
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Veya şununla devam et
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <svg className="w-5 h-5 text-[#4285F4]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
                </button>
              </div>

              <div>
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <svg className="w-5 h-5 text-[#1877F2]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 