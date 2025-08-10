
const fs = require("fs");
const login = require("fb-chat-api");

// Load config
const config = require("./config.json");

// Load all commands
const commands = new Map();
fs.readdirSync(__dirname + "/commands/fun").forEach(file => {
  if (file.endsWith(".js")) {
    const command = require(`./commands/fun/${file}`);
    commands.set(command.config.name, command);
  }
});

// Login
login({ appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) }, (err, api) => {
  if (err) return console.error("❌ Login failed:", err);

  api.listenMqtt((err, event) => {
    if (err) return console.error("❌ Listen error:", err);
    if (event.type !== "message" || !event.body) return;

    const args = event.body.trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();
    const command = commands.get(commandName);

    if (command) {
      command.run({ api, event, args });
    }
  });
});
