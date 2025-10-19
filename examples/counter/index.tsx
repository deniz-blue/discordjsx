import "dotenv/config";
import { Client, Events } from "discord.js";
import { DiscordJSX } from "../../src/index.js";
import { Counter } from "./counter.js";

const client = new Client({
    intents: [],
});

client.on(Events.ClientReady, (readyClient) => {
    console.log(`Logged in as ${readyClient.user.tag} !`);
});

const djsx = new DiscordJSX();

client.on(Events.InteractionCreate, (interaction) => {
    if(interaction.isChatInputCommand()) {
        djsx.createMessage(interaction, <Counter />);
    } else {
        djsx.dispatchInteraction(interaction);
    }
});

client.login(process.env.DISCORD_TOKEN);

const beforeExit = () => {
    djsx.disable()
        .catch(e => console.log(e))
        .finally(() => process.exit(0));
};

process.on("SIGTERM", beforeExit);
process.on("SIGINT", beforeExit);
