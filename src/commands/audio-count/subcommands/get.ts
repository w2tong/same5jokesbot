import { ChartConfiguration } from 'chart.js';
import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { getAudioCountUserTotal } from '../../../sql/tables/audio-count';
import { createLargeChartBuffer } from '../../../util/chart';

function createChartConfiguration(username: string, audio: string[], count: number[]): ChartConfiguration {
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
                    text: `${username}'s Audio Usage (top 50)`,
                    font: {
                        size: 24
                    }
                },
                legend: {
                    display: false
                },
                autocolors: {
                    mode: 'data'
                },
                datalabels: {
                    align: 'end',
                    anchor: 'start',
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
    const audioCount = await getAudioCountUserTotal(user.id);
    if (audioCount.length > 0) {
        const audio = [];
        const count = [];
        for (const {AUDIO, COUNT} of audioCount) {
            audio.push(AUDIO);
            count.push(COUNT);
        }
        const config = createChartConfiguration(user.username, audio, count);
        const buffer = await createLargeChartBuffer(config);
        const file = new AttachmentBuilder(buffer).setName(`${name}-${user.username}-${new Date().toISOString()}.png`);
        void interaction.editReply({files: [file]}).catch(console.error);
    }
    else {
        void interaction.editReply('No data.').catch(console.error);
    }
}

const name = 'get';

const subcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription('Creates a bar chart of a user\'s audio use.')
    .addUserOption((option) => option.setName('user').setDescription('Select a user.'));

export default { execute, name, subcommandBuilder };

