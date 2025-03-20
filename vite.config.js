import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'workday-cn': 'workday-cn/lib/workday-cn.cjs.js'
    }
  }
})
