// Setup

require("dotenv").config();
const Discord = require('discord.js')
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');

const client = new Client({ intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.GuildVoiceStates
], partials: [Partials.Channel] });

/* Twitter Configuration

const Twitter = require('twit');

const twitterConf = {
    consumer_key: 'MBtyXlru0SXxUjUbA0Z6IEzci',
    consumer_secret: 'JkFYnnvpAhJVnNPb1G5ykZxYLD9mLeKi8xT28NygpIIKiy4WSh',
    access_token: '1344119072619982854-M12BN8rvTPNPx6qlX6W6d38VWhx9yd',
    access_token_secret: 'qZ8TOLhXtn6lVhRTRsu2ukOw2bD1naiUlDtG3dCySi72I',
}

const twitterClient = new Twitter(twitterConf);

const dest = '1003836237028798474'; 

const stream = twitterClient.stream('statuses/filter', {
  follow: '872833914083188737', // @Every3Minutes, specify whichever Twitter ID you want to follow
});

stream.on('tweet', tweet => {
  const twitterMessage = new Discord.EmbedBuilder()
  	.setTitle(`${tweet.user.name})`) 
	.setDescription(`(@${tweet.user.screen_name}) tweeted this: https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`)

  client.channels.cache.get(dest).send({embeds: [twitterMessage]});
  return false;
});
*/

// Music Setup 

const { Player } = require("discord-music-player");

const player = new Player(client, {
    leaveOnEmpty: false, 
});

const priority_channel = "995434897948803184"
const logChannel = "984572923291529266"

player.on('songAdd', (queue, song) => {
    client.channels.cache.get(priority_channel).send(`**${song}** has been added to the queue or is playing.`);

	let songEmbed = new Discord.EmbedBuilder()
		.setTitle(`${song.name} has been added to this server's queue`)
		.setImage(`${song.thumbnail}`)
		.addField('song author', `${song.author}`)
		.addField('song duration:', `${song.duration}`)
		.addField('song url:', `${song.url}`)
		.addField('Requested By', `${song.requestedBy}`)
		.setColor('Random')

	client.channels.cache.get(logChannel).send({embeds: [songEmbed]}); // { custom: 'fields' }
})

player.on('clientDisconnect', (queue, song) => {
	queue.clearQueue()
	client.channels.cache.get(priority_channel).send(`queue has been cleared due to bot disconnection.`);
})

// Before

const fs = require('fs');

// Module Exports

module.exports = client;

// Normal Commands
const commandFolder = fs.readdirSync("./commands")
const commands = [];

client.commands = new Collection();

for (const category of commandFolder) {
	const commandFiles = fs.readdirSync(`./commands/${category}`).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const command = require(`./commands/${category}/${file}`);
		console.log(command)
		commands.push(command.data.toJSON);
		client.commands.set(command.data.name, command)
		/* console.log(command, category) */
	}
}

// Events

const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args)); // after args - slashCommands
	} else {
		client.on(event.name, (...args) => event.execute(...args)); // after args - slashCommands
	}
}

// Start

client.login(process.env.TOKEN);
