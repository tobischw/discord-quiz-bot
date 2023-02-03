const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong! GHOST MODE'),
	async execute(interaction) {
		await interaction.reply({content: 'Pong!', ephemeral: true });
	},
};
