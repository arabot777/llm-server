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
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React 核心 - 优先加载
            if (id.includes('react/jsx-runtime')) {
              return 'react-jsx';
            }
            if (id.includes('react-dom/client')) {
              return 'react-dom-client';
            }
            if (id.includes('react-dom')) {
              return 'react-dom-core';
            }
            if (id.includes('react') && !id.includes('react-dom')) {
              return 'react-core';
            }
            
            // ECharts 依赖修复 - 确保正确的加载顺序
            if (id.includes('zrender') || id.includes('tslib')) {
              return 'echarts-deps'; // echarts的基础依赖
            }
            if (id.includes('echarts/lib/util') || id.includes('echarts/lib/model')) {
              return 'echarts-base';
            }
            if (id.includes('echarts/lib/chart')) {
              return 'echarts-charts';
            }
            if (id.includes('echarts/lib/component')) {
              return 'echarts-components';
            }
            if (id.includes('echarts')) {
              return 'echarts-core';
            }
            
            // 基础工具库 - 优先加载
            if (id.includes('clsx') || id.includes('class-variance-authority')) {
              return 'css-utils';
            }
            if (id.includes('axios')) {
              return 'axios';
            }
            if (id.includes('date-fns')) {
              return 'date-fns';
            }
            if (id.includes('zod')) {
              return 'zod';
            }
            if (id.includes('i18next')) {
              return 'i18n';
            }
            
            // UI 组件库
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            
            // 其他库按功能分组
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('next-themes')) {
              return 'themes';
            }
            if (id.includes('zustand')) {
              return 'state';
            }
            if (id.includes('react-hook-form')) {
              return 'forms';
            }
            if (id.includes('downshift')) {
              return 'downshift';
            }
            if (id.includes('vaul')) {
              return 'vaul';
            }
            if (id.includes('sonner')) {
              return 'toast';
            }
            if (id.includes('react-day-picker')) {
              return 'datepicker';
            }
            if (id.includes('react-json-view')) {
              return 'json-view';
            }
            if (id.includes('react-markdown')) {
              return 'markdown';
            }
            if (id.includes('react-syntax-highlighter')) {
              return 'syntax-highlighter';
            }
            if (id.includes('motion') || id.includes('framer-motion')) {
              return 'animation';
            }
            
            // 剩余的小库
            return 'misc-utils';
          }
        }
      }
    },
    chunkSizeWarningLimit: 100,
  }
})
