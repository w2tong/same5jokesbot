import { ChartConfiguration } from 'chart.js';
import { ChartCallback, ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getLast30DaysTimeInVoice } from '../sql/time-in-voice';

async function createChartBuffer(username: string, days: Array<string>, times: Array<number>) {
    const width = 1280;
    const height = 720;
    const configuration: ChartConfiguration = {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: `${username}'s Time Spent in Voice in Last 30 Days`,
                data: times,
                borderColor: 'rgb(75, 144, 192)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date',
                        font: {
                            size: 18
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Minutes',
                        font: {
                            size: 18
                        }
                    }
                }
            }
        }
    };
    const chartCallback: ChartCallback = (ChartJS) => {
        ChartJS.defaults.responsive = true;
        ChartJS.defaults.maintainAspectRatio = false;
        ChartJS.defaults.font.size = 16;
    };
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white', chartCallback });
    return await chartJSNodeCanvas.renderToBuffer(configuration);
}

async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;
    const rows = await getLast30DaysTimeInVoice(interaction.user.id, interaction.guildId);
    if (rows) {
        // Create map of day to milliseconds
        const rowsMap: {[key: string]: number} = {};
        for (const row of rows) {
            rowsMap[row.START_DATE] = row.MILLISECONDS;
        }

        // Create arrays for last 30 days and time in voice
        const days: Array<string> = [];
        const times = new Array<number>(30).fill(0);
        const currDay = new Date(new Date().toDateString());
        currDay.setDate(currDay.getDate() - 30 + 1);
        for (let i = 0; i < 30; i++) {
            currDay.setDate(currDay.getDate() + 1);
            if (rowsMap[currDay.toString()]) {
                times[i] = rowsMap[currDay.toString()]/60_000;
            }
            days.push(`${currDay.getMonth()+1}/${currDay.getDate()}`);
        }
        const file = new AttachmentBuilder(await createChartBuffer(interaction.user.username, days, times)).setName('chart.png');
        void interaction.reply({files: [file]});
    }
    else {
        void interaction.reply('No data.');
    }
}

const name = 'time-in-voice-line-graph';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Creates a line graph of your time in a voice channel in this guild for the last 30 days.');

export default { execute, name, commandBuilder };

