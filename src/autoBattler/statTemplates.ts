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

const PlayerStats: {[name in ClassName]: CharacterStatTemplate} = {
    [ClassName.Fighter]: {
        className: 'Fighter',
        attackBonus: {
            base: 0,
            perLvl: 0.25
        },
        damageBonus: {
            base: 0,
            perLvl: 0.5
        },
        armourClass: {
            base: 10,
            perLvl: 0.25
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
            perLvl: 0.25
        },
        damageBonus: {
            base: 0,
            perLvl: 0.5
        },
        armourClass: {
            base: 10,
            perLvl: 0.25
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
            perLvl: 0.25
        },
        damageBonus: {
            base: 0,
            perLvl: 0.5
        },
        armourClass: {
            base: 10,
            perLvl: 0.25
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

const NPCStats: {[name in ClassName|'Rat'|'GoblinFighter'|'GoblinRogue'|'OrcFighter'|'Zombie']: CharacterStatTemplate} = {
    // Classes
    [ClassName.Fighter]: {
        className: 'Fighter',
        attackBonus: {
            base: 1,
            perLvl: 0.5
        },
        damageBonus: {
            base: 0,
            perLvl: 1
        },
        armourClass: {
            base: 11,
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
            base: 1,
            perLvl: 0.5
        },
        damageBonus: {
            base: 0,
            perLvl: 1
        },
        armourClass: {
            base: 11,
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
            base: 1,
            perLvl: 0.5
        },
        damageBonus: {
            base: 0,
            perLvl: 1
        },
        armourClass: {
            base: 11,
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
    },

    // Rat
    Rat: {
        className: 'Rat',
        attackBonus: {
            base: -2,
            perLvl: 0.5
        },
        damageBonus: {
            base: 0,
            perLvl: 0.5
        },
        armourClass: {
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
            perLvl: 0
        },
        magicResist: {
            base: 0,
            perLvl: 0
        },
        health: {
            base: 4,
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
            base: 2,
            perLvl: 1
        }
    },

    // Goblins
    GoblinFighter: {
        className: 'Goblin Fighter',
        attackBonus: {
            base: 0,
            perLvl: 0.5
        },
        damageBonus: {
            base: 0,
            perLvl: 0.67
        },
        armourClass: {
            base: 12,
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
            base: 10,
            perLvl: 1
        },
        magicResist: {
            base: 0,
            perLvl: 0
        },
        health: {
            base: 10,
            perLvl: 5
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
    },
    GoblinRogue: {
        className: 'Goblin Rogue',
        attackBonus: {
            base: 0,
            perLvl: 0.5
        },
        damageBonus: {
            base: 0,
            perLvl: 0.67
        },
        armourClass: {
            base: 10,
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
            base: 5,
            perLvl: 1
        },
        magicResist: {
            base: 0,
            perLvl: 0
        },
        health: {
            base: 10,
            perLvl: 4
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
            base: 2,
            perLvl: 1
        }
    },

    // Orcs
    OrcFighter: {
        className: 'Orc Fighter',
        attackBonus: {
            base: 0,
            perLvl: 0.5
        },
        damageBonus: {
            base: 1,
            perLvl: 1
        },
        armourClass: {
            base: 10,
            perLvl: 0.5
        },
        physDR: {
            base: 1,
            perLvl: 0.25
        },
        magicDR: {
            base: 0,
            perLvl: 0
        },
        physResist: {
            base: 10,
            perLvl: 1
        },
        magicResist: {
            base: 0,
            perLvl: 0
        },
        health: {
            base: 25,
            perLvl: 10
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
            base: -2,
            perLvl: 1
        }
    },

    // Zombie
    Zombie: {
        className: 'Zombie',
        attackBonus: {
            base: -2,
            perLvl: 0.5
        },
        damageBonus: {
            base: 0,
            perLvl: 1
        },
        armourClass: {
            base: 6,
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
            perLvl: 0
        },
        magicResist: {
            base: 0,
            perLvl: 0
        },
        health: {
            base: 16,
            perLvl: 4
        },
        mana: 0, 
        manaPerAtk: {
            base: 0,
            perLvl: 0
        },
        manaRegen: {
            base: 1,
            perLvl: 0
        },
        initiativeBonus: {
            base: -10,
            perLvl: 1
        }
    }

} as const;

export { CharacterStatTemplate, PlayerStats, NPCStats };