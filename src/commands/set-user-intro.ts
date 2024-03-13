import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import audio from '../util/audioFileMap';
import { updateUserIntro } from '../sql/tables/user_intro';

async function execute(interaction: ChatInputCommandInteraction) {
    const audio = interaction.options.getString('audio') ?? null;
    await updateUserIntro(interaction.user.id, audio);
    await interaction.reply({ content: `You set your intro to ${audio ?? 'Nothing'}.`, ephemeral: true });
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

const name = 'set-user-intro';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Sets your intro audio. Leave audio option empty to remove intro.')
    .addStringOption((option) => option
        .setName('audio')
        .setDescription('Select an audio clip.')
        .setAutocomplete(true)
    );

export default { execute, autocomplete, name, commandBuilder };