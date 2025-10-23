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
				text: 'Getting Started',
				base: "guide",
				items: [
					{ text: 'Installation', link: '/installation' },
					{ text: 'TypeScript', link: '/typescript' },
					{ text: "Rendering Elements", link: '/rendering' },
					{ text: "Event Handlers", link: '/event-handlers' },
				]
			},
			{
				text: 'Guide',
				base: "guide",
				items: [
					{ text: "Rendering a Message", link: '/message' },
					{ text: "Counter", link: '/counter' },
				]
			},
			{
				text: 'Features',
				base: "features",
				items: [
					{ text: "Error Handling", link: '/error-handling' },
					{ text: "Auto-defer", link: '/auto-defer' },
				]
			},
			{
				base: "reference",
				text: "Reference",
				items: [
					{ text: "All Elements", link: "/elements" }
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
