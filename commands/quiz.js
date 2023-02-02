const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Event, IntegrationApplication } = require('discord.js');
const fs = require("fs");
const util = require("util");

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

        await interaction.reply({ content: message, components: [answerButtons] });

        const collector = interaction.channel.createMessageComponentCollector({ time: 300000 });

        collector.on('collect', async interaction => {
            if (interaction.customId == `answer-${answer}`) {
                const answerOption = options[answer];
                // TODO: figure out editReply vs reply
                // interactionAlreadyAck'd
                // https://stackoverflow.com/questions/71702161/interaction-has-already-been-acknowledged
                await interaction.reply(`✅ <@${interaction.user.id}> is **CORRECT**! The right answer is ${answerLetter}: ${answerOption}`);
            } else {
                await interaction.reply(`❌ <@${interaction.user.id}> is **INCORRECT**! Try again!`);
            }
        });
	},
};
