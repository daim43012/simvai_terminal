import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: "./",  // ✅ Указываем относительные пути
  build: {
    assetsInlineLimit: 0,  // ✅ Отключаем inlining файлов
    rollupOptions: {
      output: {
        assetFileNames: "[name][extname]", // ✅ Файлы CSS и JS остаются в корне `dist/`
        entryFileNames: "[name].js",       // ✅ Убираем хеши у JS-файлов
      }
    }
  }
});
