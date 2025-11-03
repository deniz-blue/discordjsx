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
				items: [
					{ text: 'Installation', link: '/guide/installation' },
					{ text: 'TypeScript', link: '/guide/typescript' },
					{ text: "Rendering Elements", link: '/guide/rendering' },
					{ text: "Event Handlers", link: '/guide/event-handlers' },
				]
			},
			{
				text: 'Examples',
				items: [
					{ text: "Counter", link: '/example/counter' },
				]
			},
			{
				text: 'Advanced',
				items: [
					{ text: "Error Handling", link: '/advanced/error-handling' },
					{ text: "Auto-defer", link: '/advanced/auto-defer' },
					{ text: "Custom IDs", link: '/advanced/custom-id' },
				]
			},
			{
				text: "Reference",
				items: [
					{ text: "All Elements", link: "/reference/elements" }
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
