const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Event, IntegrationApplication } = require('discord.js');
const fs = require("fs");
const util = require("util");
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    level: 'info',
    format: format.json(),
    defaultMeta: { service: 'quiz' },
    transports: [
      //
      // - Write to all logs with level `info` and below to `console.log` 
      // - Write all logs error (and below) to `error.log`.
      //
      new transports.File({ filename: 'error.log', level: 'error' }),
      new transports.File({ filename: 'console.log' })
    ]
  });

const readFile = util.promisify(fs.readFile);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quiz')
		.setDescription('Displays a random quiz question.'),
	async execute(interaction) {
        const data = await readFile("questions.json");
        const questions = JSON.parse(data);
        const questionId = Math.floor(Math.random() * questions.length);
        const randomQuestion = questions[questionId];
        const question = randomQuestion.question;
        const options = randomQuestion.options;
        const answer = randomQuestion.answer;
        const answerLetter = String.fromCharCode(65 + answer);

        let message = `${question}\n\n`;
        let answerButtons = new ActionRowBuilder();

        options.forEach((option, index) => {
            let letter = String.fromCharCode(65 + index);
            message += `**${letter}.** ${option}\n`;

            answerButtons.addComponents(
                new ButtonBuilder()
                    .setCustomId(`answer-${index}`)
                    .setLabel(letter)
                    .setStyle(ButtonStyle.Secondary)
            )
        });

        answerButtons.addComponents(
            new ButtonBuilder()
                .setCustomId(`answer-reveal`)
                .setLabel(`👀`)
                .setStyle(ButtonStyle.Danger)
        );


        const collector = interaction.channel.createMessageComponentCollector({ maxProcessed: 69, time: 1800000 });

        collector.on('collect', async action => {
            const answerOption = options[answer];

            if (action.customId == `answer-reveal`) {
                try {
                    await action.reply({ content: `The answer is ${answerLetter}: ${answerOption}`, ephemeral: true });
                } catch (DiscordAPIError) {
                    await action.editReply({ content: `You tried to answer an old question!`, ephemeral: true });
                    logger.error(`DiscordAPIError[40060]: Interaction${action.id} has already been acknowledged.`);
                }
            } else if (action.customId == `answer-${answer}`) {
                try {
                    await action.reply(`✅ <@${action.user.id}> is **CORRECT**!`);
                } catch (DiscordAPIError) {
                    await action.editReply({ content: `You tried to answer an old question!`, ephemeral: true });
                    logger.error(`DiscordAPIError[40060]: Interaction${action.id} has already been acknowledged.`);
                }
            } else {
                try {
                    await action.reply(`❌ <@${interaction.user.id}> is **INCORRECT**!`);
                } catch (DiscordAPIError) {
                    await action.editReply({ content: `You tried to answer an old question!`, ephemeral: true });
                    logger.error(`DiscordAPIError[40060]: Interaction${action.id} has already been acknowledged.`);
                }
            }
        });
        await interaction.reply({ content: message, components: [answerButtons] });

	},
};
