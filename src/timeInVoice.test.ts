import timeInVoice from './timeInVoice';
import * as sqlTimeInVoice from './sql/tables/time-in-voice';
import * as sqlTimeInVoiceTogether from './sql/tables/time-in-voice-together';
// import MockDiscord from './tests/mockDiscord';
// const mockDiscord = new MockDiscord();
import { mockVoidPromise } from './tests/testUtil';

const mockDate1 = new Date('2023-01-01');
const mockDate2 = new Date('2023-01-02');
jest.useFakeTimers().setSystemTime(mockDate1);

jest.spyOn(sqlTimeInVoice, 'updateTimeInVoice').mockImplementation(mockVoidPromise);
const insertUserPairsMock = jest.spyOn(sqlTimeInVoiceTogether, 'insertUserPairs').mockImplementation(mockVoidPromise);
jest.spyOn(sqlTimeInVoiceTogether, 'updateTimeInVoiceTogether').mockImplementation(mockVoidPromise);

// describe('initUsers()', () => {
//     test('single user', () => {
//         const mockClient = mockDiscord.getClient();
//         const mockGuild = mockDiscord.getGuild();
//         const mockVoiceChannel = mockDiscord.getVoiceChannel();
//         const mockGuildMember = mockDiscord.getGuildMember();
//         timeInVoice.initUsers(mockClient);
//         expect(timeInVoice.userJoinTime[mockGuildMember.user.id]).toEqual({channelId: mockVoiceChannel.id, guildId: mockGuild.id});
//     }) ;
// });

describe('userJoin()', () => {
    test('single user', () => {
        timeInVoice.userJoin('user1', 'channel1', 'guild1');
        expect(timeInVoice.userJoinTime['user1']).toEqual({channelId: 'channel1', guildId: 'guild1', time: mockDate1.getTime(), pointMultiplier: 2});
    });
    test('same user', () => {
        timeInVoice.userJoin('user2', 'channel1', 'guild1');
        expect(timeInVoice.userJoinTime['user2']).toEqual({channelId: 'channel1', guildId: 'guild1', time: mockDate1.getTime(), pointMultiplier: 2});
        timeInVoice.userJoin('user2', 'channel2', 'guild2');
        expect(timeInVoice.userJoinTime['user2']).toEqual({channelId: 'channel2', guildId: 'guild2', time: mockDate1.getTime(), pointMultiplier: 2});
    });
    test('multiple users', () => {
        timeInVoice.userJoin('user3', 'channel2', 'guild3');
        timeInVoice.userJoin('user4', 'channel1', 'guild1');
        timeInVoice.userJoin('user5', 'channel2', 'guild1');
        timeInVoice.userJoin('user6', 'channel1', 'guild2');
        expect(timeInVoice.userJoinTime['user3']).toEqual({channelId: 'channel2', guildId: 'guild3', time: mockDate1.getTime(), pointMultiplier: 2});
        expect(timeInVoice.userJoinTime['user4']).toEqual({channelId: 'channel1', guildId: 'guild1', time: mockDate1.getTime(), pointMultiplier: 2});
        expect(timeInVoice.userJoinTime['user5']).toEqual({channelId: 'channel2', guildId: 'guild1', time: mockDate1.getTime(), pointMultiplier: 2});
        expect(timeInVoice.userJoinTime['user6']).toEqual({channelId: 'channel1', guildId: 'guild2', time: mockDate1.getTime(), pointMultiplier: 2});
    });
    test('no user', () => {
        expect(timeInVoice.userJoinTime['user7']).toBeUndefined();
    });
});

describe('updatePairs()', () => {
    test('no user', () => {
        timeInVoice.updatePairs('user10');
        expect(insertUserPairsMock).not.toHaveBeenCalled();
    });
    test('1 user', () => {
        timeInVoice.userJoin('user10', 'channel10', 'guild1');
        timeInVoice.updatePairs('user10');
        expect(insertUserPairsMock.mock.calls[0][0]).toHaveLength(0);
    });
    test('multiple users', () => { 
        timeInVoice.userJoin('user11', 'channel11', 'guild1');
        timeInVoice.userJoin('user12', 'channel11', 'guild1');
        timeInVoice.userJoin('user13', 'channel11', 'guild1');
        timeInVoice.userJoin('user14', 'channel11', 'guild1');
        timeInVoice.userJoin('user15', 'channel11', 'guild1');
        timeInVoice.updatePairs('user11');
        expect(insertUserPairsMock.mock.calls[0][0]).toEqual([
            { userId1: 'user11', userId2: 'user12' },
            { userId1: 'user11', userId2: 'user13' },
            { userId1: 'user11', userId2: 'user14' },
            { userId1: 'user11', userId2: 'user15' }
        ]);
    });
});

describe('userChangeChannel()', () => {
    afterEach(() => {
        jest.setSystemTime(mockDate1);
    });
    test('single user single change', async () => {        
        jest.setSystemTime(mockDate2);
        await timeInVoice.userChangeChannel('user1', 'channel2');
        expect(timeInVoice.userJoinTime['user1']).toEqual({channelId: 'channel2', guildId: 'guild1', time: mockDate2.getTime(), pointMultiplier: 2});
    });
    test('single user multiple changes', async () => {        
        jest.setSystemTime(mockDate2);
        await timeInVoice.userChangeChannel('user1', 'channel1');
        await timeInVoice.userChangeChannel('user1', 'channel2');
        await timeInVoice.userChangeChannel('user1', 'channel3');
        expect(timeInVoice.userJoinTime['user1']).toEqual({channelId: 'channel3', guildId: 'guild1', time: mockDate2.getTime(), pointMultiplier: 2});
    });
    test('multiple users', async () => {        
        jest.setSystemTime(mockDate2);
        await timeInVoice.userChangeChannel('user1', 'channel1');
        await timeInVoice.userChangeChannel('user2', 'channel2');
        await timeInVoice.userChangeChannel('user3', 'channel3');
        expect(timeInVoice.userJoinTime['user1']).toEqual({channelId: 'channel1', guildId: 'guild1', time: mockDate2.getTime(), pointMultiplier: 2});
        expect(timeInVoice.userJoinTime['user2']).toEqual({channelId: 'channel2', guildId: 'guild2', time: mockDate2.getTime(), pointMultiplier: 2});
        expect(timeInVoice.userJoinTime['user3']).toEqual({channelId: 'channel3', guildId: 'guild3', time: mockDate2.getTime(), pointMultiplier: 2});
    });
});

describe('userLeave()', () => {
    test('single user', () => {        
        timeInVoice.userJoin('user20', 'channel20', 'guild1');
        timeInVoice.userLeave('user20');
        expect(timeInVoice.userJoinTime['user20']).toBeUndefined();
    });
});