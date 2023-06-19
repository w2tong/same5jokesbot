import { Emotes, emotes, getEmotes } from './emotes';
import MockDiscord from './tests/mockDiscord';

// const mockDiscord = new MockDiscord();
// const client = mockDiscord.getClient();

test('getEmotes', () => {
    // getEmotes(client);
    expect(emotes[Emotes.sadge]).toEqual('');
    expect(emotes[Emotes.smoshShutUp]).toEqual('');
    expect(emotes[Emotes.DansGame]).toEqual('');
});