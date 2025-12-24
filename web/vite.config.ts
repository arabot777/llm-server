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
          // 动态分块策略
          if (id.includes('node_modules')) {
            // React核心 - 最小化
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-core';
            }
            // 图表库 - 独立块
            if (id.includes('echarts')) {
              return 'charts';
            }
            // Markdown - 独立块
            if (id.includes('react-markdown') || id.includes('react-syntax-highlighter')) {
              return 'markdown';
            }
            // UI组件库 - 独立块
            if (id.includes('@radix-ui')) {
              return 'ui-lib';
            }
            // 其他第三方库
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 200, // 200KB限制
  }
})
