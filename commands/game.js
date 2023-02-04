const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require(`discord.js`);
const fs = require(`fs`);
const util = require(`util`);
const { createLogger, format, transports } = require(`winston`);

const logger = createLogger({
    level: `info`,
    format: format.json(),
    defaultMeta: { service: `game` },
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

const leaderboard = createLogger({
    level: `info`,
    format: format.json(),
    defaultMeta: { service: `leaderboard` },
    transports: [
      new transports.File({ filename: `leaderboard.log` }),
      new transports.Console()
    ]
});

const readFile = util.promisify(fs.readFile);

module.exports = {
	data: new SlashCommandBuilder()
		.setName(`game`)
		.setDescription(`Let's play a game!`),
	async execute(interaction) {
        const data = await readFile(`GPTquestions.json`);
        const questions = JSON.parse(data);
        const questionId = Math.floor(Math.random() * questions.length);
        const randomQuestion = questions[questionId];
        const question = randomQuestion.question;
        const options = randomQuestion.options;
        const answer = randomQuestion.answer;
        const explanation  = randomQuestion.explanation;
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

        const collector = interaction.channel.createMessageComponentCollector({ time: 42000 });

        collector.on('collect', async interaction => {
            const answerOption = options[answer];

            if (interaction.customId == `answer-reveal`) {
                await interaction.reply({ content: `The answer is ${answerLetter}: ${answerOption} \n ***Explaination*** \n${explanation}`, ephemeral: true });
            } else if (interaction.customId == `answer-${answer}`) {
                leaderboard.info(`ID:${interaction.id}, USER:${interaction.user.id}, QUESTION:${question}, ANSWER:${answer}, SCORE:1`);
                await interaction.reply(`✅ <@${interaction.user.id}> is **CORRECT**!`);
            } else {
                let cheatButton = new ActionRowBuilder();
                cheatButton.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`answer-reveal`)
                        .setLabel(`👀`)
                        .setStyle(ButtonStyle.Danger)
                );
                leaderboard.info(`ID:${interaction.id}, USER:${interaction.user.id}, QUESTION:${question}, ANSWER:${answer}, SCORE:-1`);
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

            interaction.editReply({ content: `This round has ended! ${collected.size} Total Leaderboard Entries Added`, components: [answerButtons] });
            logger.info(`Collected ${collected.size} interactions.`);
        });
	},
};
