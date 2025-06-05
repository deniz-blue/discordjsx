import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "discord-jsx-renderer",
	description: "Documentation for discord-jsx-renderer",
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: 'Home', link: '/' },
			// { text: 'Examples', link: '/markdown-examples' }
		],

		sidebar: [
			{
				text: 'Examples',
				items: [
					{ text: 'Getting Started', link: '/getting-started' },
					{ text: "Rendering JSX", link: '/rendering' },
				]
			},
			{
				base: "guide",
				text: "Guide",
				items: [
					{ text: "Rendering a Message", link: '/message' },
					{ text: "Counter", link: '/counter' },
				],
			},
			{
				base: "reference",
				text: "Reference",
				items: [
					{ text: "JSX Elements", link: "/elements" }
				],
			},
		],

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/deniz-blue/discordjsx' }
		]
	},

	markdown: {
		config(md) {
			md.use(groupIconMdPlugin)
		},
	},
	vite: {
		plugins: [
			groupIconVitePlugin()
		],
	}
})
