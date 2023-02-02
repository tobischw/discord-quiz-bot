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
      new transports.File({ filename: 'console.log' }),
      new transports.Console()
    ]
  });

const readFile = util.promisify(fs.readFile);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quiz')
		.setDescription('Displays a random quiz question for a minute.'),
	async execute(interaction) {
        const data = await readFile("questions.json");
        const questions = JSON.parse(data);
        const questionId = Math.floor(Math.random() * questions.length);
        const randomQuestion = questions[questionId];
        const question = randomQuestion.question;
        const options = randomQuestion.options;
        const answer = randomQuestion.answer;
        const explaination = `Because it is what it is`;
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



        const collector = interaction.channel.createMessageComponentCollector({ time: 300000 });

        collector.on('collect', async interaction => {
            const answerOption = options[answer];

            if (interaction.customId == `answer-reveal`) {
                await interaction.reply({ content: `The answer is ${answerLetter}: ${answerOption} \n ***Explaination*** \n${explaination}`, ephemeral: true });
            } else if (interaction.customId == `answer-${answer}`) {
                await interaction.reply(`✅ <@${interaction.user.id}> is **CORRECT**!`);
            } else {
                let cheatButton = new ActionRowBuilder();
                cheatButton.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`answer-reveal`)
                        .setLabel(`👀`)
                        .setStyle(ButtonStyle.Danger)
                );
                await interaction.reply({content: `❌ <@${interaction.user.id}> is **INCORRECT**!`, components: [cheatButton]});
            }
        });

        await interaction.reply({ content: message, components: [answerButtons] });

        collector.on('end', collected => {
            let answerButtons = new ActionRowBuilder();
            answerButtons.addComponents(
                new ButtonBuilder()
                    .setCustomId(`answer-done`)
                    .setLabel(`🤌`)
                    .setStyle(ButtonStyle.Success)
            );

            interaction.editReply({ content: `This question has expired! ${collected.size} Total Interactions`, components: [answerButtons] });
            logger.info(`Collected ${collected.size} interactions.`);
        });
	},
};
