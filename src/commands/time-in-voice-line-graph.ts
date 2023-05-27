import { ChartConfiguration } from 'chart.js';
import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getUserLast30DaysTimeInVoice } from '../sql/time-in-voice';
import { createMediumChartBuffer } from '../chart';
import { timeInMS } from '../util';

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
                        text: 'Hours',
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
                    text: `${username}'s Time Spent in Voice in Last 30 Days`,
                    font: {
                        size: 24
                    }
                },
                legend: {
                    display: false
                },
                autocolors: {
                    enabled: false
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
                    formatter: (value: number) => value.toFixed(1),
                    padding: 4
                }
            }
        }
    };
}

async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;
    await interaction.deferReply();
    const user = interaction.options.getUser('user') ?? interaction.user;
    const rows = await getUserLast30DaysTimeInVoice(user.id, interaction.guildId);
    if (rows) {
        // Create map of day to milliseconds
        const rowsMap: { [key: string]: number } = {};
        for (const row of rows) {
            rowsMap[row.START_DATE] = row.MILLISECONDS;
        }

        // Create arrays for last 30 days and time in voice
        const days: Array<string> = [];
        const times = new Array<number>(30).fill(0);
        const currDay = new Date(new Date().toDateString());
        currDay.setDate(currDay.getDate() - 30);
        for (let i = 0; i < 30; i++) {
            currDay.setDate(currDay.getDate() + 1);
            if (rowsMap[currDay.toString()]) {
                times[i] = rowsMap[currDay.toString()] / timeInMS.hour;
            }
            days.push(`${currDay.getMonth()+1}/${currDay.getDate()}`);
        }
        const config = createChartConfiguration(user.username, days, times);
        const file = new AttachmentBuilder(await createMediumChartBuffer(config)).setName(`${name}-${user.username}-${new Date().toISOString()}.png`);
        void interaction.editReply({files: [file]});
    }
    else {
        void interaction.editReply('No data.');
    }
}

const name = 'time-in-voice-line-graph';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Creates a line graph of your time in a voice channel in this guild for the last 30 days.')
    .addUserOption((option) => option.setName('user').setDescription('The user'));

export default { execute, name, commandBuilder };

