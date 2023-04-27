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
                data: count,
                borderColor: 'white'
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Audio',
                        font: {
                            size: 18
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Uses',
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
                }
            }
        }
    };
}

async function execute(interaction: ChatInputCommandInteraction) {
    const audioCount = await getAudioCountTotal(interaction.user.id);
    if (audioCount) {
        const audio = [];
        const count = [];
        for (const {AUDIO, COUNT} of audioCount) {
            audio.push(AUDIO);
            count.push(COUNT);
        }
        const config = createChartConfiguration(interaction.user.username, audio, count);
        const buffer = await createChartBuffer(config);
        const file = new AttachmentBuilder(buffer).setName(`${name}-${interaction.user.username}-${new Date().toISOString()}.png`);
        void interaction.reply({files: [file]});
    }
    else {
        void interaction.reply('No data.');
    }
}

const name = 'audio-count-bar-chart';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Creates a bar chart of your audio use.');

export default { execute, name, commandBuilder };

