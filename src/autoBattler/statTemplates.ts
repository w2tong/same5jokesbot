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
    armourClass: {
        base: number;
        perLvl: number;
    };
    physDR?: {
        base: number;
        perLvl: number;
    };
    magicDR?: {
        base: number;
        perLvl: number;
    };
    physResist?: {
        base: number;
        perLvl: number;
    };
    magicResist?: {
        base: number;
        perLvl: number;
    };
    thorns?: {
        base: number;
        perLvl: number;
    }
    health: {
        base: number;
        perLvl: number;
    };
    mana?: number;
    manaPerAtk?: {
        base: number;
        perLvl: number;
    };
    manaRegen?: {
        base: number;
        perLvl: number;
    };
    initiativeBonus: {
        base: number;
        perLvl: number;
    };
}

const PlayerStats: {[name in ClassName]: CharacterStatTemplate} = {
    [ClassName.Fighter]: {
        className: 'Fighter',
        attackBonus: {
            base: 0,
            perLvl: 0.34
        },
        damageBonus: {
            base: 0,
            perLvl: 1
        },
        armourClass: {
            base: 10,
            perLvl: 0.34
        },
        health: {
            base: 20,
            perLvl: 8
        },
        mana: 100, 
        manaPerAtk: {
            base: 0,
            perLvl: 0.5
        },
        manaRegen: {
            base: 10,
            perLvl: 0.5
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
            perLvl: 0.34
        },
        damageBonus: {
            base: 0,
            perLvl: 1
        },
        armourClass: {
            base: 10,
            perLvl: 0.34
        },
        health: {
            base: 20,
            perLvl: 6
        },
        mana: 100, 
        manaPerAtk: {
            base: 0,
            perLvl: 0.5
        },
        manaRegen: {
            base: 10,
            perLvl: 0.5
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
            perLvl: 0.34
        },
        damageBonus: {
            base: 0,
            perLvl: 1
        },
        armourClass: {
            base: 10,
            perLvl: 0.34
        },
        health: {
            base: 20,
            perLvl: 5
        },
        mana: 100, 
        manaPerAtk: {
            base: 0,
            perLvl: 0.5
        },
        manaRegen: {
            base: 20,
            perLvl: 0.5
        },
        initiativeBonus: {
            base: 0,
            perLvl: 1
        }
    }
};

const NPCStats: {[name in ClassName|'Rat'|'GoblinFighter'|'GoblinRogue'|'OrcFighter'|'Zombie']: CharacterStatTemplate} = {
    // Classes
    [ClassName.Fighter]: {
        className: 'Fighter',
        attackBonus: {
            base: -1,
            perLvl: 0.67
        },
        damageBonus: {
            base: 0,
            perLvl: 1
        },
        armourClass: {
            base: 9,
            perLvl: 0.67
        },
        health: {
            base: 20,
            perLvl: 8
        },
        mana: 100, 
        manaPerAtk: {
            base: 0,
            perLvl: 0.5
        },
        manaRegen: {
            base: 1,
            perLvl: 0.5
        },
        initiativeBonus: {
            base: 0,
            perLvl: 1
        }
    },
    [ClassName.Rogue]: {
        className: 'Rogue',
        attackBonus: {
            base: -1,
            perLvl: 0.67
        },
        damageBonus: {
            base: 0,
            perLvl: 1
        },
        armourClass: {
            base: 9,
            perLvl: 0.67
        },
        health: {
            base: 20,
            perLvl: 6
        },
        mana: 100, 
        manaPerAtk: {
            base: 0,
            perLvl: 0.5
        },
        manaRegen: {
            base: 10,
            perLvl: 0.5
        },
        initiativeBonus: {
            base: 0,
            perLvl: 1
        }
    },
    [ClassName.Wizard]: {
        className: 'Wizard',
        attackBonus: {
            base: -1,
            perLvl: 0.67
        },
        damageBonus: {
            base: 0,
            perLvl: 1
        },
        armourClass: {
            base: 9,
            perLvl: 0.67
        },
        health: {
            base: 20,
            perLvl: 5
        },
        mana: 100, 
        manaPerAtk: {
            base: 0,
            perLvl: 0.5
        },
        manaRegen: {
            base: 20,
            perLvl: 0.5
        },
        initiativeBonus: {
            base: 0,
            perLvl: 1
        }
    },

    // Rat
    Rat: {
        className: 'Rat',
        attackBonus: {
            base: -2,
            perLvl: 0.67
        },
        damageBonus: {
            base: 0,
            perLvl: 1
        },
        armourClass: {
            base: 8,
            perLvl: 0.67
        },
        health: {
            base: 4,
            perLvl: 2
        },
        initiativeBonus: {
            base: 2,
            perLvl: 1
        }
    },

    // Goblins
    GoblinFighter: {
        className: 'Goblin Fighter',
        attackBonus: {
            base: -1,
            perLvl: 0.67
        },
        damageBonus: {
            base: 0,
            perLvl: 1
        },
        armourClass: {
            base: 9,
            perLvl: 0.67
        },
        health: {
            base: 12,
            perLvl: 6
        },
        mana: 100, 
        manaPerAtk: {
            base: 0,
            perLvl: 0.5
        },
        manaRegen: {
            base: 10,
            perLvl: 0.5
        },
        initiativeBonus: {
            base: 0,
            perLvl: 1
        }
    },
    GoblinRogue: {
        className: 'Goblin Rogue',
        attackBonus: {
            base: -1,
            perLvl: 1
        },
        damageBonus: {
            base: 0,
            perLvl: 0.67
        },
        armourClass: {
            base: 9,
            perLvl: 1
        },
        health: {
            base: 11,
            perLvl: 5
        },
        mana: 100, 
        manaPerAtk: {
            base: 0,
            perLvl: 0.5
        },
        manaRegen: {
            base: 10,
            perLvl: 0.5
        },
        initiativeBonus: {
            base: 2,
            perLvl: 1
        }
    },

    // Orcs
    OrcFighter: {
        className: 'Orc Fighter',
        attackBonus: {
            base: -1,
            perLvl: 0.67
        },
        damageBonus: {
            base: 1,
            perLvl: 1
        },
        armourClass: {
            base: 9,
            perLvl: 0.67
        },
        physDR: {
            base: 1,
            perLvl: 0.5
        },
        physResist: {
            base: 10,
            perLvl: 1
        },
        health: {
            base: 25,
            perLvl: 10
        },
        mana: 100, 
        manaPerAtk: {
            base: 0,
            perLvl: 0.5
        },
        manaRegen: {
            base: 10,
            perLvl: 0.5
        },
        initiativeBonus: {
            base: -2,
            perLvl: 1
        }
    },

    // Zombie
    Zombie: {
        className: 'Zombie',
        attackBonus: {
            base: -3,
            perLvl: 0.67
        },
        damageBonus: {
            base: 0,
            perLvl: 1
        },
        armourClass: {
            base: 7,
            perLvl: 0.67
        },
        health: {
            base: 16,
            perLvl: 6
        },
        initiativeBonus: {
            base: -10,
            perLvl: 1
        }
    }

} as const;

export { CharacterStatTemplate, PlayerStats, NPCStats };