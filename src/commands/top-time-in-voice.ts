import { ChartConfiguration } from 'chart.js';
import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getGuildLast30DaysTimeInVoice } from '../sql/time-in-voice';
import { createMediumChartBuffer } from '../chart';
import { fetchUser } from '../discordUtil';
import { timeInMS } from '../util';

function createChartConfiguration(users: Array<string>, times: Array<number>): ChartConfiguration {
    return {
        type: 'bar',
        data: {
            labels: users,
            datasets: [{
                data: times
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Hours',
                        font: {
                            size: 18
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'User',
                        font: {
                            size: 18
                        }
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Time In Voice In Last 30 Days',
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
                    formatter: (value: number) => value.toFixed(1),
                    padding: 4
                }
            }
        }
    };
}

async function execute(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId;
    if (!guildId) return;
    await interaction.deferReply();
    const audioCount = await getGuildLast30DaysTimeInVoice(guildId);
    if (audioCount) {
        const users = [];
        const times = [];
        for (const {USER_ID, MILLISECONDS} of audioCount) {
            const username = (await fetchUser(interaction.client.users, USER_ID)).username;
            users.push(username);
            times.push(MILLISECONDS/timeInMS.hour);
        }
        const config = createChartConfiguration(users, times);
        const buffer = await createMediumChartBuffer(config);
        const file = new AttachmentBuilder(buffer).setName(`${name}-${guildId}-${new Date().toISOString()}.png`);
        void interaction.editReply({files: [file]});
    }
    else {
        void interaction.editReply('No data.');
    }
}

const name = 'top-time-in-voice';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Creates a bar chart of the server\'s users\' time in voice.');

export default { execute, name, commandBuilder };

