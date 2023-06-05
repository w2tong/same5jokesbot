import {
    Client,
    Guild,
    GuildChannel,
    TextChannel,
    User,
    GuildMember,
    Message,
    VoiceChannel,
    ChannelType,
} from 'discord.js';

export default class MockDiscord {
    private client!: Client;
    private guild!: Guild;
    private guildChannel!: GuildChannel;
    private textChannel!: TextChannel;
    private voiceChannel!: VoiceChannel;
    private user!: User;
    private guildMember!: GuildMember;
    public message!: Message;

    constructor() {
        this.mockClient();
        this.mockGuild();
        this.mockGuildChannel();
        this.mockTextChannel();
        this.mockVoiceChannel();
        this.mockUser();
        this.mockGuildMember();
        this.mockMessage();

        this.client.guilds.cache.set(this.guild.id, this.guild);
        this.guild.channels.cache.set(this.voiceChannel.id, this.voiceChannel);
        this.voiceChannel.members.set(this.guildMember.id, this.guildMember);
    }

    public getClient(): Client {
        return this.client;
    }

    public getGuild(): Guild {
        return this.guild;
    }

    public getGuildChannel(): GuildChannel {
        return this.guildChannel;
    }

    public getTextChannel(): TextChannel {
        return this.textChannel;
    }

    public getVoiceChannel(): VoiceChannel {
        return this.voiceChannel;
    }

    public getUser(): User {
        return this.user;
    }

    public getGuildMember(): GuildMember {
        return this.guildMember;
    }

    public getMessage(): Message {
        return this.message;
    }

    private mockClient(): void {
        this.client = new Client({intents: []});
    }

    private mockGuild(): void {
        this.guild = Reflect.construct(Guild, [
            this.client,
            {
                unavailable: false,
                id: 'guild-id',
                name: 'mocked js guild',
                icon: 'mocked guild icon url',
                splash: 'mocked guild splash url',
                region: 'eu-west',
                member_count: 42,
                large: false,
                features: [],
                application_id: 'application-id',
                afkTimeout: 1000,
                afk_channel_id: 'afk-channel-id',
                system_channel_id: 'system-channel-id',
                embed_enabled: true,
                verification_level: 2,
                explicit_content_filter: 3,
                mfa_level: 8,
                joined_at: new Date('2018-01-01').getTime(),
                owner_id: 'owner-id',
                channels: [],
                roles: [],
                presences: [],
                voice_states: [],
                emojis: [],
            }
        ]) as Guild;
    }

    private mockGuildChannel(): void {
        this.guildChannel = Reflect.construct(GuildChannel, [
            this.guild,
            {
                id: 'channel-id',
                name: 'guild-channel',
                position: 1,
                parent_id: '123456789',
                permission_overwrites: [],
            }
        ]) as GuildChannel;
    }

    private mockTextChannel(): void {
        this.textChannel = Reflect.construct(TextChannel, [
            this.guild, 
            {
                ...this.guildChannel,
                topic: 'topic',
                nsfw: false,
                last_message_id: '123456789',
                lastPinTimestamp: new Date('2019-01-01').getTime(),
                rate_limit_per_user: 0,
                type: ChannelType.GuildText
            }
        ]) as TextChannel;
    }

    private mockVoiceChannel(): void {
        this.voiceChannel = Reflect.construct(VoiceChannel, [
            this.guild, 
            {
                ...this.guildChannel,
                topic: 'topic',
                nsfw: false,
                last_message_id: '123456789',
                lastPinTimestamp: new Date('2019-01-01').getTime(),
                rate_limit_per_user: 0,
                type: ChannelType.GuildVoice
            }
        ]) as VoiceChannel;
    }

    private mockUser(): void {
        this.user = Reflect.construct(User, [
            this.client,
            {
                id: 'user-id',
                username: 'user username',
                discriminator: 'user#0000',
                avatar: 'user avatar url',
                bot: false,
            }
        ]) as User;
    }

    private mockGuildMember(): void {
        this.guildMember = Reflect.construct(GuildMember, [
            this.client,
            {
                deaf: false,
                mute: false,
                self_mute: false,
                self_deaf: false,
                session_id: 'session-id',
                channel_id: 'channel-id',
                nick: 'nick',
                joined_at: new Date('2020-01-01').getTime(),
                user: this.user,
                roles: [],
            },
            this.guild
        ]) as GuildMember;
    }

    private mockMessage(): void {
        this.message = Reflect.construct(Message, [
            this.client,
            {
                id: '123456789',
                type: 'DEFAULT',
                content: 'this is the message content',
                author: this.user,
                webhook_id: null,
                member: this.guildMember,
                pinned: false,
                tts: false,
                nonce: 'nonce',
                embeds: [],
                attachments: [],
                edited_timestamp: null,
                reactions: [],
                mentions: [],
                mention_roles: [],
                mention_everyone: [],
                hit: false,
            },
            this.textChannel
        ]) as Message;
    }
}