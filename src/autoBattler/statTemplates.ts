import { ClassName } from './Classes/classes';
import { DamageType, Dice, dice } from './util';

type CharacterStatTemplate = {
    className: string;
    attackBonus: {
        base: number;
        perLvl: number;
    };
    damageType: DamageType;  // TODO: change to weapon dmg type when equipment implemented
    damage: Dice; // TODO: change to weapon dmg when equipment implemented
    damageBonus: {
        base: number;
        perLvl: number;
    };
    critRange: number;
    critMult: number;
    armorClass: {
        base: number;
        perLvl: number;
    };
    physDR: {
        base: number;
        perLvl: number;
    };
    magicDR: {
        base: number;
        perLvl: number;
    };
    physResist: {
        base: number;
        perLvl: number;
    };
    magicResist: {
        base: number;
        perLvl: number;
    };
    health: {
        base: number;
        perLvl: number;
    };
    mana: number;
    manaPerAtk: {
        base: number;
        perLvl: number;
    };
    manaRegen: {
        base: number;
        perLvl: number;
    };
    initiativeBonus: {
        base: number;
        perLvl: number;
    };
}

const ClassStats: {[name in ClassName]: CharacterStatTemplate} = {
    Fighter: {
        className: 'Fighter',
        attackBonus: {
            base: 0,
            perLvl: 1
        },
        damageType: DamageType.Physical,
        damage: dice['1d6'],
        damageBonus: {
            base: 0,
            perLvl: 0.5
        },
        critRange: 20,
        critMult: 2,
        armorClass: {
            base: 10,
            perLvl: 1
        },
        physDR: {
            base: 0,
            perLvl: 0
        },
        magicDR: {
            base: 0,
            perLvl: 0
        },
        physResist: {
            base: 5,
            perLvl: 1
        },
        magicResist: {
            base: 5,
            perLvl: 1
        },
        health: {
            base: 25,
            perLvl: 8
        },
        mana: 10, 
        manaPerAtk: {
            base: 2,
            perLvl: 0.1
        },
        manaRegen: {
            base: 1,
            perLvl: 0.1
        },
        initiativeBonus: {
            base: 0,
            perLvl: 1
        }
    },
    Rogue: {
        className: 'Rogue',
        attackBonus: {
            base: 0,
            perLvl: 1
        },
        damageType: DamageType.Physical,
        damage: dice['1d6'],
        damageBonus: {
            base: 0,
            perLvl: 0.5
        },
        critRange: 19,
        critMult: 2,
        armorClass: {
            base: 10,
            perLvl: 1
        },
        physDR: {
            base: 0,
            perLvl: 0
        },
        magicDR: {
            base: 0,
            perLvl: 0
        },
        physResist: {
            base: 0,
            perLvl: 0.5
        },
        magicResist: {
            base: 0,
            perLvl: 0.5
        },
        health: {
            base: 22,
            perLvl: 6
        },
        mana: 10, 
        manaPerAtk: {
            base: 2,
            perLvl: 0.1
        },
        manaRegen: {
            base: 1,
            perLvl: 0.1
        },
        initiativeBonus: {
            base: 0,
            perLvl: 1
        }
    },
    Wizard: {
        className: 'Wizard',
        attackBonus: {
            base: 0,
            perLvl: 1
        },
        damageType: DamageType.Physical,
        damage: dice['1d4'],
        damageBonus: {
            base: 0,
            perLvl: 0.5
        },
        critRange: 20,
        critMult: 2,
        armorClass: {
            base: 10,
            perLvl: 1
        },
        physDR: {
            base: 0,
            perLvl: 0
        },
        magicDR: {
            base: 0,
            perLvl: 0
        },
        physResist: {
            base: 0,
            perLvl: 0
        },
        magicResist: {
            base: 5,
            perLvl: 1
        },
        health: {
            base: 20,
            perLvl: 5
        },
        mana: 10, 
        manaPerAtk: {
            base: 1,
            perLvl: 0.1
        },
        manaRegen: {
            base: 3,
            perLvl: 0.1
        },
        initiativeBonus: {
            base: 0,
            perLvl: 1
        }
    }
};

// Rat
const RatStats: CharacterStatTemplate = {
    className: 'Rat',
    attackBonus: {
        base: -2,
        perLvl: 0.5
    },
    damageType: DamageType.Physical,
    damage: dice['1d3'],
    damageBonus: {
        base: 0,
        perLvl: 0.5
    },
    critRange: 20,
    critMult: 2,
    armorClass: {
        base: 5,
        perLvl: 0.5
    },
    physDR: {
        base: 0,
        perLvl: 0
    },
    magicDR: {
        base: 0,
        perLvl: 0
    },
    physResist: {
        base: 0,
        perLvl: 0.25
    },
    magicResist: {
        base: 0,
        perLvl: 0.25
    },
    health: {
        base: 6,
        perLvl: 2
    },
    mana: 0, 
    manaPerAtk: {
        base: 0,
        perLvl: 0
    },
    manaRegen: {
        base: 0,
        perLvl: 0
    },
    initiativeBonus: {
        base: 0,
        perLvl: 1
    }
};

export { CharacterStatTemplate, ClassStats, RatStats };