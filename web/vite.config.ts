import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将大的第三方库分离
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-table'],
          'chart-vendor': ['echarts'],
          'utils-vendor': ['axios', 'date-fns', 'zod'],
          'i18n-vendor': ['i18next', 'react-i18next'],
          'markdown-vendor': ['react-markdown', 'react-syntax-highlighter'],
        }
      }
    },
    // 设置chunk大小警告阈值
    chunkSizeWarningLimit: 500, // 500KB
  }
})
