import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import { joinVoicePlayAudio } from '../voice';
import audio from '../audioFileMap';

function execute(interaction: ChatInputCommandInteraction) {
    if (interaction.member instanceof GuildMember) {
        const audio = interaction.options.getString('audio') ?? '';
        const reply = interaction.member.voice ? `Playing ${audio}.` : 'You are not in a voice channel.';
        void interaction.reply({ content: reply, ephemeral: true });
        joinVoicePlayAudio(interaction, audio);
    }
}

const name = 'play';

const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Plays selected audio clip')
    .addStringOption((option) => option
        .setName('audio')
        .setDescription('Audio clip')
        .setRequired(true)
        .addChoices(
            { name: 'Thunder vs Lightning', value: audio.thunderVsLightning },
            /*
            { name: 'Phasmo Breath', value: 'phasmo_breath' },
            { name: 'Phasmo Die', value: 'phasmo_die' },
            { name: 'Phasmo Groan', value: 'phasmo_groan' },
            { name: 'Phasmo Heartbeat', value: 'phasmo_heartbeat' },
            { name: 'Phasmo Kill', value: 'phasmo_kill' },
            { name: 'Phasmo Behind', value: 'phasmo_behind' },
            { name: 'Phasmo Here', value: 'phasmo_here' },
            */
            { name: 'Among Us Emergency Meeting', value: audio.amongUsEmergencyMeeting },
            { name: 'Disgustang', value: audio.disgustang },
            { name: 'Demon Time', value: audio.demonTime },
            { name: 'What the dog doin', value: audio.whatTheDogDoin },
            { name: 'Beans', value: audio.badlandsChugsBeans },
            { name: 'Beans Slow', value: audio.badlandsChugsBeansSlow },
            { name: 'NOIDONTTHINKSO', value: audio.noIDontThinkSo },
            { name: 'Uh guys?', value: audio.bloonsUhGuys },
            { name: 'ENOUGH TALK', value: audio.badlandsChugsEnoughTalk },
            { name: 'Champ Select', value: audio.champSelect },
            { name: 'TRUE', value: audio.trainTrue },
            { name: 'Moonmoon destroys Weebs', value: audio.moonmoonDestroysWeebs },
            { name: 'Bing Chilling', value: audio.bingChilling },
            { name: 'An Exclusive! It Arrived', value: audio.anExclusiveItArrived },
            { name: 'Smosh: Shut Up!', value: audio.smoshShutUp },
            { name: 'Get ready! M.O.A.B.!', value: audio.bloonsGetReadyMOAB },
            { name: 'Clean-cut, and still cuts a tomato.', value: audio.bloonsCleanCut },
            { name: 'Game over, man.', value: audio.bloonsGameOverMan },
            { name: 'Fulcrum, come in', value: audio.fulcrumComeIn },
            { name: 'Obliterated', value: audio.fulcrumObliterated },
            { name: 'FADEDTHANAHO', value: audio.fulcrumFadedThanAHo },
            { name: 'Good Morning Donda', value: audio.goodMorningDonda },
            { name: 'Teleporting Fat Guy', value: audio.teleportingFatGuy },
            { name: 'Guga Sous Vide', value: audio.gugaSousVide },
        )
    );

export default { execute, name, commandBuilder };