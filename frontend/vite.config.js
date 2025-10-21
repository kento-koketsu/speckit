import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'es2022', // モダンブラウザのみサポート
    minify: 'terser', // より高度な圧縮
    terserOptions: {
      compress: {
        drop_console: true, // console.log削除
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      },
      format: {
        comments: false // コメント削除
      }
    },
    rollupOptions: {
      output: {
        manualChunks: undefined, // 単一チャンク（小規模アプリに最適）
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    cssCodeSplit: false, // CSS を単一ファイルに
    assetsInlineLimit: 0, // 小さなアセットのインライン化を無効化
    reportCompressedSize: true // 圧縮サイズをレポート
  },
  // 開発サーバー設定
  server: {
    port: 3000,
    open: true
  }
});
