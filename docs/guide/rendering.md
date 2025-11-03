# Rendering Elements

To render JSX elements as Discord messages, use `djsx.createMessage(interaction, element)`:

```tsx
djsx.createMessage(interaction, (
	<message ephemeral>
		Hello {interaction.user}!
		<br/>
		<br/>
		This message was sent with <pre>discord-jsx-renderer</pre>
	</message>
))
```

## Rendering Components

To render custom components, write JSX like you would in React:

```tsx
const MyFunctionComponent = () => {
	// ...
	return (
		<message ephemeral>
			<text>
				Hi! :3
			</text>
		</message>
	);
};

djsx.createMessage(interaction, (
	<MyFunctionComponent />
))
```

## Using State and Hooks

You can use state and any React hook in your components:

```tsx
export const Timer = ({ timeout = 5000 }: { timeout: number }) => {
	const [expired, setExpired] = useState(false);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setExpired(true);
		}, timeout);

		return () => clearTimeout(timeoutId);
	}, []);

	return (
		<text>
			Timer {expired ? "has expired!" : "is running..."}
		</text>
	)
};
```

Side effects can update components!

## Event Handlers

You can attach [event handlers](./event-handlers.md) to interactible elements

Custom IDs will be automatically handled if you do not provide them

```tsx
const Confirmation = () => {
	function handleClick(interaction: ButtonInteraction) {
		interaction.reply("You clicked confirm!")
	}

	return (
		<row>
			<button onClick={handleClick}>
				Confirm!
			</button>
		</row>
	)
}
```

