// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://doc.200205.net',
	integrations: [
		starlight({
			title: '我的知识库',
			defaultLocale: 'root',
			locales: {
				root: { label: '简体中文', lang: 'zh-CN' },
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/listensay/my-doc' }],
			sidebar: [
				{
					label: '指南',
					items: [{ label: '示例指南', slug: 'guides/example' }],
				},
				{
					label: '参考',
					items: [{ autogenerate: { directory: 'reference' } }],
				},
			],
		}),
	],
});
