import { AutocompleteInteraction, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import { joinVoicePlayAudio } from '../voice';
import audio from '../util/audioFileMap';

function execute(interaction: ChatInputCommandInteraction) {
    if (interaction.member instanceof GuildMember) {
        const audio = interaction.options.getString('audio') ?? '';
        const reply = interaction.member.voice ? `Playing ${audio}.` : 'You are not in a voice channel.';
        void interaction.reply({ content: reply, ephemeral: true });
        joinVoicePlayAudio(interaction, audio);
    }
}

async function autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const choices = [];
    for (const [name, value] of Object.entries(audio)) {
        choices.push({name, value});
    }
    const filtered = choices.filter(choice => choice.name.toLowerCase().includes(focusedValue));
    await interaction.respond(
        filtered.slice(0, 25).map(choice => ({ name: choice.name, value: choice.value }))
    );
}

const name = 'play';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Plays an audio clip.')
    .addStringOption((option) => option
        .setName('audio')
        .setDescription('Audio clip')
        .setRequired(true)
        .setAutocomplete(true)
    );

export default { execute, autocomplete, name, commandBuilder };