import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const buildDate = new Date().toLocaleDateString('ja-JP', {
	year: 'numeric',
	month: '2-digit',
	day: '2-digit'
}).replace(/\//g, '.');

export default defineConfig({
	define: {
		__BUILD_DATE__: JSON.stringify(buildDate)
	},
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					// 大きなライブラリを分割
					'vendor': ['svelte']
				}
			}
		}
	}
});
