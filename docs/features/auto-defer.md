# Auto-defer

When a `discord-jsx-renderer` component recieves a new interaction, `discord-jsx-renderer` uses it to update the message from then on. However, if the component does not re-render, the message does not get updated. `discord-jsx-renderer` handles this case by **deferring the interaction** in case a re-render didn't occur in time. This way, the interaction does not invalidate/expire and users dont get the "Interaction failed" message.
