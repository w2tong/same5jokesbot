import { ChartConfiguration } from 'chart.js';
import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getAudioCountTotal } from '../sql/audio-count';
import { createLargeChartBuffer } from '../chart';

function createChartConfiguration(audio: Array<string>, count: Array<number>): ChartConfiguration {
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
                    text: 'Total Audio Usage (top 50)',
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
    const audioCount = await getAudioCountTotal();
    if (audioCount) {
        const audio = [];
        const count = [];
        for (const {AUDIO, COUNT} of audioCount) {
            audio.push(AUDIO);
            count.push(COUNT);
        }
        const config = createChartConfiguration(audio, count);
        const buffer = await createLargeChartBuffer(config);
        const file = new AttachmentBuilder(buffer).setName(`${name}-${new Date().toISOString()}.png`);
        void interaction.editReply({files: [file]});
    }
    else {
        void interaction.editReply('No data.');
    }
}

const name = 'audio-count-total';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Creates bar chart of all audio use.');

export default { execute, name, commandBuilder };

