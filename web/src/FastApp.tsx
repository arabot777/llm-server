import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import { ErrorBoundary } from './handler/ErrorBoundary'
import { ENV } from './utils/env.ts'
import { Toaster } from '@/components/ui/sonner'
import { ConstantCategory, getConstant } from './constant/index.ts'

// 懒加载主要组件
const LazyApp = lazy(() => import('./App'));
const LazyReactQueryDevtools = lazy(() => 
  import('@tanstack/react-query-devtools').then(module => ({
    default: module.ReactQueryDevtools
  }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: getConstant(ConstantCategory.FEATURE, 'QUERY_STALE_TIME', 5 * 60 * 1000),
      retry: getConstant(ConstantCategory.FEATURE, 'DEFAULT_QUERY_RETRY', 1),
      refetchOnWindowFocus: false
    }
  }
})

// 轻量级加载组件
function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      fontFamily: 'system-ui'
    }}>
      <h2>Loading AI Proxy...</h2>
      <div style={{
        width: '200px',
        height: '4px',
        background: '#ddd',
        borderRadius: '2px',
        margin: '20px 0',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          background: '#6a6de6',
          width: '100%',
          animation: 'loading 2s ease-in-out infinite',
          borderRadius: '2px'
        }} />
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

function FastApp() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <Suspense fallback={<LoadingScreen />}>
            <LazyApp />
            <Toaster />
          </Suspense>
        </I18nextProvider>
        {ENV.isDevelopment && (
          <Suspense fallback={null}>
            <LazyReactQueryDevtools />
          </Suspense>
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default FastApp;
