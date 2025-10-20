import { APIApplication, REST, RESTPutAPIApplicationCommandsJSONBody, Routes } from "discord.js"
import "dotenv/config"

const body: RESTPutAPIApplicationCommandsJSONBody = [
    {
        name: "test",
        description: "Do the counter test (⚛️ React!)",
    },
    {
        name: "modal",
        description: "Open a modal (⚛️ React!)",
    },
];

console.log("Publishing...");

const rest = new REST().setToken(process.env.DISCORD_TOKEN as string);

const application = await rest.get(Routes.currentApplication()) as APIApplication;

console.log(`Application: ${application.name} (${application.id})`);

const { DISCORD_GUILD_ID } = process.env;
const data = await rest.put(
    DISCORD_GUILD_ID ? Routes.applicationGuildCommands(application.id, DISCORD_GUILD_ID) : Routes.applicationCommands(application.id),
    { body }
);

console.log("Published!");
console.log(data);

