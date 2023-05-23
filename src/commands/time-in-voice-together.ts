import { ChartConfiguration } from 'chart.js';
import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { createChartBuffer } from '../chart';
import { getTimeInVoiceTogether } from '../sql/time-in-voice-together';
import { fetchUser, timeInMS } from '../util';

function createChartConfiguration(username: string, users: Array<string>, times: Array<number>): ChartConfiguration {
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
                        text: 'Users',
                        font: {
                            size: 18
                        }
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `${username}'s Time In Voice Together`
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
    await interaction.deferReply();
    const user = interaction.options.getUser('user') ?? interaction.user;
    const timeInVoiceTogether = await getTimeInVoiceTogether(user.id);
    if (timeInVoiceTogether) {
        const users = [];
        const times = [];
        for (const {USER_ID, MILLISECONDS} of timeInVoiceTogether) {
            const username = (await fetchUser(interaction.client, USER_ID)).username;
            users.push(username);
            times.push(MILLISECONDS / timeInMS.hour);
        }
        const config = createChartConfiguration(user.username, users, times);
        const buffer = await createChartBuffer(config);
        const file = new AttachmentBuilder(buffer).setName(`${name}-${user.username}-${new Date().toISOString()}.png`);
        void interaction.editReply({files: [file]});
    }
    else {
        void interaction.editReply('No data.');
    }
}

const name = 'time-in-voice-together';
const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Creates a bar chart of your time in voice with other users.')
    .addUserOption((option) => option.setName('user').setDescription('The user'));

export default { execute, name, commandBuilder };

