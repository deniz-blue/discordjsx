import "dotenv/config";
import { Client, Events } from "discord.js";
import { djsx } from "../../src/index.js";
import { Counter } from "./counter.js";

const client = new Client({
    intents: [],
});

client.on(Events.ClientReady, (readyClient) => {
    console.log(`Logged in as ${readyClient.user.tag} !`);
});

client.on(Events.InteractionCreate, (interaction) => {
    if(interaction.isChatInputCommand()) {
        if(interaction.commandName == "test") {
            djsx.createMessage(interaction, <Counter />);
        } else if(interaction.commandName == "modal") {
            djsx.createModal(interaction, (
                <modal
                    title="Meow meow meow"
                    onSubmit={(...x: any[]) => {
                        console.log(x)
                        console.log("MODAL SUBMITTED !!!!");
                    }}
                >
                    <label label="Answer to everything">
                        <text-input
                            placeholder="42"
                            customId="meow"
                        />
                    </label>
                </modal>
            ));
        }
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
