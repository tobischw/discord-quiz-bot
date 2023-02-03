const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName(`leaderboard`)
		.setDescription(`THE tripple threat -straight white man- most hated study helper`),
	async execute(interaction) {
		await interaction.reply({content: `https://cdn.discordapp.com/attachments/972712505417801728/1070213679779426314/Screenshot_2023-01-31_at_11.26.54_PM.png`, ephemeral: true });
	},
};
