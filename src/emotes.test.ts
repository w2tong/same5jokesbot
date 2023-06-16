import { emotes, getEmotes } from './emotes';
import MockDiscord from './tests/mockDiscord';

// const mockDiscord = new MockDiscord();
// const client = mockDiscord.getClient();

test('getEmotes', () => {
    // getEmotes(client);
    expect(emotes['sadge']).toEqual('');
    expect(emotes['smoshShutUp']).toEqual('');
    expect(emotes['dansGame']).toEqual('');
});