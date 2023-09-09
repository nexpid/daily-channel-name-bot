// at the time of writing this code, Bun.file does not work

import { readFile } from "fs/promises";
import {
  Client,
  GatewayIntentBits,
  GatewayDispatchEvents,
} from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import Croner from "croner";
import { clean, get, save } from "./word";

const config: {
  guild: string;
  channel: string;
  new_name: string;
  word_chance: number;
} = JSON.parse(await readFile("./config.json", "utf8"));

const rest = new REST({ version: "10" }).setToken(process.env.discord_token!);
const gateway = new WebSocketManager({
  token: process.env.discord_token!,
  intents: GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent,
  rest,
});

const client = new Client({ rest, gateway });

client.on(GatewayDispatchEvents.MessageCreate, ({ data: message }) => {
  if (message.guild_id === config.guild) {
    const words = message.content.split(/\s+/g).map((x) => clean(x));
    if (!words[0]) return;

    const chance = Math.random();
    if (chance <= config.word_chance)
      save(words[Math.floor(Math.random() * words.length)]);
  }
});

client.once(GatewayDispatchEvents.Ready, () => {
  console.log("Ready!");
  Croner("0 0 0 * * *", async () => {
    try {
      const word = await get();
      if (!word) return;

      client.api.channels.edit(config.channel, {
        name: config.new_name.replace(/%s/g, word),
      });
    } catch {
      console.log("Failed to rename channel!");
    }
  });
});

gateway.connect();
