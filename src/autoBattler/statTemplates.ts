import { ClassName } from './Classes/classes';

type CharacterStatTemplate = {
    className: string;
    attackBonus: {
        base: number;
        perLvl: number;
    };
    damageBonus: {
        base: number;
        perLvl: number;
    };
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
    [ClassName.Fighter]: {
        className: 'Fighter',
        attackBonus: {
            base: 0,
            perLvl: 1
        },
        damageBonus: {
            base: 0,
            perLvl: 0.5
        },
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
            base: 20,
            perLvl: 8
        },
        mana: 10, 
        manaPerAtk: {
            base: 0,
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
    [ClassName.Rogue]: {
        className: 'Rogue',
        attackBonus: {
            base: 0,
            perLvl: 1
        },
        damageBonus: {
            base: 0,
            perLvl: 0.5
        },
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
            base: 20,
            perLvl: 6
        },
        mana: 10, 
        manaPerAtk: {
            base: 0,
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
    [ClassName.Wizard]: {
        className: 'Wizard',
        attackBonus: {
            base: 0,
            perLvl: 1
        },
        damageBonus: {
            base: 0,
            perLvl: 0.5
        },
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
            base: 0,
            perLvl: 0.1
        },
        manaRegen: {
            base: 2,
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
    damageBonus: {
        base: 0,
        perLvl: 0.5
    },
    armorClass: {
        base: 8,
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
        base: 3,
        perLvl: 1
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