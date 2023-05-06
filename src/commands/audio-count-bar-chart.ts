import { ChartConfiguration } from 'chart.js';
import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getAudioCountTotal } from '../sql/audio-count';
import { createChartBuffer } from '../chart';

function createChartConfiguration(username: string, audio: Array<string>, count: Array<number>): ChartConfiguration {
    return {
        type: 'bar',
        data: {
            labels: audio,
            datasets: [{
                data: count
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Uses',
                        font: {
                            size: 18
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Audio',
                        font: {
                            size: 18
                        }
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `${username}'s Audio Usage`
                },
                legend: {
                    display: false
                },
                autocolors: {
                    mode: 'data'
                },
                datalabels: {
                    align: 'end',
                    anchor: 'end',
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    backgroundColor: context => context.dataset.borderColor,
                    borderRadius: 4,
                    color: 'white',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 4
                }
            }
        }
    };
}

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user') ?? interaction.user;
    const audioCount = await getAudioCountTotal(user.id);
    if (audioCount) {
        const audio = [];
        const count = [];
        for (const {AUDIO, COUNT} of audioCount) {
            audio.push(AUDIO);
            count.push(COUNT);
        }
        const config = createChartConfiguration(user.username, audio, count);
        const buffer = await createChartBuffer(config);
        const file = new AttachmentBuilder(buffer).setName(`${name}-${user.username}-${new Date().toISOString()}.png`);
        void interaction.editReply({files: [file]});
    }
    else {
        void interaction.editReply('No data.');
    }
}

const name = 'audio-count-bar-chart';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Creates a bar chart of your audio use.')
    .addUserOption((option) => option.setName('user').setDescription('The user'));

export default { execute, name, commandBuilder };

