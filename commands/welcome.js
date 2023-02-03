const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName(`welcome`)
		.setDescription(`Recive a warm welcome just for you.`),
	async execute(interaction) {
		await interaction.reply({content: `Welcome to Costco. I ❤️ you!`, ephemeral: true });
	},
};
