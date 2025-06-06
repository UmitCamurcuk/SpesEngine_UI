import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './redux/store'
import router from './routes'
import { ThemeProvider } from './context/ThemeContext'
import { I18nProvider } from './context/i18nContext'
import './styles/theme.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  // StrictMode development ortamında çift render yapıyor, geçici olarak kaldırıldı
  // <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <I18nProvider>
            <RouterProvider router={router} />
          </I18nProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  // </React.StrictMode>,
)
