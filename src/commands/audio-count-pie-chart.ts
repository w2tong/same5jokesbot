import { ChartConfiguration } from 'chart.js';
import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getAudioCountTotal } from '../sql/audio-count';
import { createChartBuffer } from '../chart';
import ChartDataLabels from 'chartjs-plugin-datalabels';

function createChartConfiguration(username: string, audio: Array<string>, count: Array<number>): ChartConfiguration {
    return {
        type: 'pie',
        data: {
            labels: audio,
            datasets: [{
                label: 'My First Dataset',
                data: count,
            }]
        },
        options: {
            plugins: {
                autocolors: {
                    mode: 'data'
                },
                datalabels: {
                    color: 'white',
                    font: {
                        size: 32
                    },
                    textStrokeColor: 'black',
                    textStrokeWidth: 4
                }
            }
        },
        plugins: [ChartDataLabels]
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
        const file = new AttachmentBuilder(buffer).setName(`audio-count-pie-chart-${interaction.user.username}-${new Date().toISOString()}.png`);
        void interaction.reply({files: [file]});
    }
    else {
        void interaction.reply('No data.');
    }
}

const name = 'audio-count-pie-chart';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Creates a pie chart of your audio use.');

export default { execute, name, commandBuilder };

