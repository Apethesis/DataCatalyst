require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Sequelize, DataTypes } = require('sequelize');
const { Client, Collection, Events, GatewayIntentBits, REST, Routes } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] }); 
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db.sqlite',
    logging: false,
})
client.commands = new Collection();
const cmdRegister = []
const rest = new REST().setToken(process.env.DTOK);
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const data = {
    titles: [],
    textEntry: sequelize.define('textEntry',{
        id: {
            primaryKey: true,
            allowNull: false,
            type: DataTypes.BIGINT,
            unique: true,
        },
        content: {
            allowNull: false,
            type: DataTypes.TEXT
        },
        lastEditor: DataTypes.STRING,
        creator: DataTypes.STRING
    }),
    userInfo: sequelize.define('userInfo', {
        id: {
            primaryKey: true,
            allowNull: false,
            type: DataTypes.BIGINT,
            unique: true,
        },
        access: {
            allowNull: false,
            defaultValue: 0,
            type: DataTypes.INTEGER,
            validate: {
                max: 5,
                min: 0
            }
        }
    }),
    catalyzed: false
}

if (fs.existsSync("titles.json")) {
    data.titles = Object.values(JSON.parse(fs.readFileSync("titles.json")))
}

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
        cmdRegister.push(command.data.toJSON())
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

rest.put(
    Routes.applicationCommands(process.env.CLID),
    { body: cmdRegister }
).then(() => {
    console.log("Finished registering commands.")
}).catch((err) => {
    console.log(err)
})

client.once(Events.ClientReady, (cl) => {
    sequelize.sync({ alter: true }).then(() => {
        console.log("Synchronized.")
    }).catch((err) => {
        console.log(err)
    })
    console.log("Ready!")
})

client.on(Events.InteractionCreate, (interaction) => {
	if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
    
    command.execute(interaction, data).catch((err) => {
        console.log(err)
        if (interaction.replied || interaction.deferred) {
			interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
    })
});

client.login(process.env.DTOK)