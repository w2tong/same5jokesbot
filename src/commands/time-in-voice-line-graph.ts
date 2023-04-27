import { ChartConfiguration } from 'chart.js';
import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getLast30DaysTimeInVoice } from '../sql/time-in-voice';
import { createChartBuffer } from '../chart';
import datalabels from 'chartjs-plugin-datalabels';

function createChartConfiguration(username: string, days: Array<string>, times: Array<number>): ChartConfiguration {
    return {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                data: times,
                borderColor: 'rgb(75, 144, 192)',
                backgroundColor: 'black',
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
                    },
                    min: 0
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `${username}'s Time Spent in Voice in Last 30 Days`
                },
                legend: {
                    display: false
                },
                datalabels: {
                    align: 'end',
                    anchor: 'end',
                    backgroundColor: 'rgb(75, 144, 192)',
                    borderRadius: 4,
                    color: 'white',
                    font: {
                        weight: 'bold'
                    },
                    formatter: Math.trunc,
                    padding: 4
                }
            }
        },
        plugins: [datalabels]
    };
}

async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;
    const user = interaction.options.getUser('user') ?? interaction.user;
    const rows = await getLast30DaysTimeInVoice(user.id, interaction.guildId);
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
        const config = createChartConfiguration(user.username, days, times);
        const file = new AttachmentBuilder(await createChartBuffer(config)).setName(`${name}-${user.username}-${new Date().toISOString()}.png`);
        void interaction.reply({files: [file]});
    }
    else {
        void interaction.reply('No data.');
    }
}

const name = 'time-in-voice-line-graph';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Creates a line graph of your time in a voice channel in this guild for the last 30 days.')
    .addUserOption((option) => option.setName('user').setDescription('The user'));

export default { execute, name, commandBuilder };

