const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require(`discord.js`);
const { createLogger, format, transports } = require(`winston`);

const logger = createLogger({
    level: `info`,
    format: format.json(),
    defaultMeta: { service: `hangout` },
    transports: [
      //
      // - Write to all logs with level `info` and below to `console.log` 
      // - Write all logs error (and below) to `error.log`.
      //
      new transports.File({ filename: `error.log`, level: `error` }),
      new transports.File({ filename: `console.log` }),
      new transports.Console()
    ]
  });

module.exports = {
	data: new SlashCommandBuilder()
		.setName(`hangout`)
		.setDescription(`Lets hangout here! Are you in?`)
        .addStringOption(option =>
            option.setName('location')
                .setDescription('Enter activity, place, or url to where you want to go')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('expires')
                .setDescription('When should the invite expire in minutes')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('hidden')
			    .setDescription('Whether or not the echo should be ephemeral')
                .setRequired(true)),
	async execute(interaction) {
        const location = interaction.options.getString(`location`);
        const expires = interaction.options.getInteger(`expires`);
        const hidden = interaction.options.getBoolean(`hidden`);
        const expireTime = parseInt(Date.now().toString().slice(0, -3)) + (expires*60);
        const message = `Hey Y'all! 🤠\nThis invite is gone <t:${expireTime}:R>\n\nAre you interested in going to ${location}`;
        logger.info(`${message} will expire in ${expires * 60000} milliseonds`);

        let responseButtons = new ActionRowBuilder();
        responseButtons.addComponents(
            new ButtonBuilder()
                .setCustomId(`response-in`)
                .setLabel(`I'm in!`)
                .setStyle(ButtonStyle.Secondary)
        );
        responseButtons.addComponents(
            new ButtonBuilder()
                .setCustomId(`response-plus`)
                .setLabel(`Down AF and a +1`)
                .setStyle(ButtonStyle.Secondary)
        );
        responseButtons.addComponents(
            new ButtonBuilder()
                .setCustomId(`response-out`)
                .setLabel(`Sorry, No thanks`)
                .setStyle(ButtonStyle.Secondary)
        );
        responseButtons.addComponents(
            new ButtonBuilder()
                .setCustomId(`response-flake`)
                .setLabel(`I'm flakey`)
                .setStyle(ButtonStyle.Secondary)
        );


        let results = new Map();
        const collector = interaction.channel.createMessageComponentCollector({ time: expires * 60000 });

        collector.on('collect', async interaction => {
            if (interaction.customId == `response-in`) {
                results.set(interaction.user.id, `in`);
                logger.info(`IN - ${interaction.user.id}`);
                await interaction.deferReply({ephemeral: hidden});
                await interaction.editReply({ content: `✅ <@${interaction.user.id}> is interested!`, ephemeral: hidden });
            } else if (interaction.customId == `response-plus`) {
                results.set(interaction.user.id, `plus`);
                logger.info(`PLUS - ${interaction.user.id}`);
                await interaction.deferReply({ephemeral: hidden});
                await interaction.editReply({ content: `❤️ <@${interaction.user.id}> is bringing more!`, ephemeral: hidden });
            }  else if (interaction.customId == `response-out`) {
                results.set(interaction.user.id, `out`);
                logger.info(`OUT - ${interaction.user.id}`);
                await interaction.deferReply({ephemeral: hidden});
                await interaction.editReply({ content: `❌ <@${interaction.user.id}> is not interested!`, ephemeral: hidden });
            }  else if (interaction.customId == `response-flake`) {
                results.set(interaction.user.id, `idk`);
                logger.info(`IDK - ${interaction.user.id}`);
                await interaction.deferReply({ephemeral: hidden});
                await interaction.editReply({ content: `❄️ <@${interaction.user.id}> isnt's sure yet!`, ephemeral: hidden });
            }
        });

        await interaction.reply({ content: message, components: [responseButtons], ephemeral: hidden });

        collector.on('end', collected => {
            interaction.editReply({ content: `That's all folks! 🥹\nThis happened <t:${expireTime}:R>!\n\n${collected.size} responded to ${location}`, components: [], ephemeral: hidden });
            logger.info(`Collected ${collected.size} interactions.`);
        });
	},
};
