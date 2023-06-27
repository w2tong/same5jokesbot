import { gamble, payouts } from './commands/gamble/subcommands/gamble';
import { spin } from './commands/slots/subcommands/spin';

function simulateGamble(iterations: number, bet: number) {
    console.log(`Gamble Simulation: ${bet} point bets x ${iterations} iterations`);
    for (const chance of Object.keys(payouts)) {
        let profit = 0;
        for (let i = 0; i < iterations; i++) {
            profit += gamble(bet, parseInt(chance)).profit;
        }
        console.log(`Chance: ${chance}% - Avg: ${Math.round(profit/iterations).toLocaleString()}`);
    }  
}

function simulateSlots(iterations: number, bet: number) {
    console.log(`Slots Simulation: ${bet} point bets x ${iterations} iterations`);
    let spins = 1;
    for (let i = 0 ; i < 4; i++) {
        let sum = 0;
        for (let j = 0; j < spins * iterations; j++) {
            sum += spin(bet).winnings - bet;
        }
        console.log(`${spins.toLocaleString()} spins - Avg: ${Math.round(sum/iterations).toLocaleString()}`);
        spins *= 10;
    }
}

simulateGamble(1_000_000, 100);
console.log();
simulateSlots(10_000, 100);