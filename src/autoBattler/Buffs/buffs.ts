
enum BuffId {
    Invisible = 'Invisible'
} 
const Buff = {
    Invisible: {
        name: 'Invisible',
        symbol: '🕵️'
    },
    // Bless = 'Bless'
} as const;

enum DebuffId {
    Burn = 'Burn',
    Frozen = 'Frozen'
}
const Debuff: {[id in DebuffId]: {name: string, symbol: string}} = {
    Burn: {
        name: 'Burn',
        symbol: '🔥'
    },
    Frozen: {
        name: 'Frozen',
        symbol: '🧊'
    }
} as const;

export { Buff, BuffId, Debuff, DebuffId };