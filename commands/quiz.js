const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require(`discord.js`);
const fs = require(`fs`);
const util = require(`util`);
const { createLogger, format, transports } = require(`winston`);

const logger = createLogger({
    level: `info`,
    format: format.json(),
    defaultMeta: { service: `quiz` },
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

const readFile = util.promisify(fs.readFile);

module.exports = {
	data: new SlashCommandBuilder()
		.setName(`quiz`)
		.setDescription(`A random quiz question. ***WARNING***  GHOST MODE Enabled!`),
	async execute(interaction) {
        const data = await readFile(`questions.json`);
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

        const filter = i => {
            return i.user.id === interaction.user.id;
        };

        const collector = interaction.channel.createMessageComponentCollector({filter});

        collector.on('collect', async interaction => {
            const answerOption = options[answer];

            if (interaction.customId == `answer-reveal`) {
                await interaction.deferReply({ephemeral: true});
                await interaction.editReply({ content: `The answer is ${answerLetter}: ${answerOption} \n ***Explaination*** \n${explanation}`, ephemeral: true });
            } else if (interaction.customId == `answer-${answer}`) {
                let nextButton = new ActionRowBuilder();
                nextButton.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`answer-done`)
                        .setLabel(`🤌`)
                        .setStyle(ButtonStyle.Success)
                );
                await interaction.deferReply({ephemeral: true});
                await interaction.editReply({content: `✅ That is **CORRECT**!\n\nPress 🤌 a few times to crash me for a new question. 😜`, components: [nextButton], ephemeral: true});
            } else {
                let cheatButton = new ActionRowBuilder();
                cheatButton.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`answer-reveal`)
                        .setLabel(`👀`)
                        .setStyle(ButtonStyle.Danger)
                );
                await interaction.deferReply({ephemeral: true});
                await interaction.editReply({content: `❌ That is **INCORRECT**!`, components: [cheatButton], ephemeral: true});
            }
        });

        await interaction.reply({ content: message, components: [answerButtons], ephemeral: true });
        logger.info(`${interaction.user.id} IS LEARNING!`);
	},
};
