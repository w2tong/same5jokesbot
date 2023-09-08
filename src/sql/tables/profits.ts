import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';

enum ProfitType {
    Bet = 'bet',
    Blackjack = 'blackjack',
    DeathRoll = 'deathroll',
    Gamble = 'gamble',
    Income = 'income',
    Lottery = 'lottery',
    Slots = 'slots',
    Steal = 'steal',
    Tax = 'tax',
    Welfare = 'welfare'
}

const createTableProfits = {
    name: 'PROFITS',
    query: `
        CREATE TABLE profits (
            user_id VARCHAR2(64) NOT NULL,
            type VARCHAR2(16) NOT NULL,
            winnings NUMBER DEFAULT 0,
            losses NUMBER DEFAULT 0,
            CONSTRAINT pk_profits PRIMARY KEY (user_id, type),
            CONSTRAINT chk_type CHECK (type IN (${Object.values(ProfitType).map(type => `'${type}'`).join(',')}))
        );
    `
};

const updateTableProfits = [`
ALTER TABLE profits
DROP CONSTRAINT chk_type
`,
`
ALTER TABLE profits
ADD CONSTRAINT chk_type CHECK (type IN (${Object.values(ProfitType).map(type => `'${type}'`).join(',')}))
`
];

interface Profits {
    WINNINGS: number;
    LOSSES: number;
    PROFITS: number;
}
const getUserTypedQuery = `
SELECT winnings, losses, winnings - losses AS profits
FROM profits
WHERE user_id = :userId
AND type = :type
`;
async function getUserTypeProfits(userId: string, type: ProfitType): Promise<Profits|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<Profits> = await connection.execute(getUserTypedQuery, {userId, type}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getUserTypeProfits: ${err}`);
    }
}

type AllProfits = {
    TYPE: ProfitType;
    WINNINGS: number;
    LOSSES: number;
    PROFITS: number;
}
const getUserAllQuery = `
SELECT type, winnings, losses, winnings - losses AS profits
FROM profits
WHERE user_id = :userId
ORDER BY profits DESC
`;
async function getUserAllProfits(userId: string): Promise<AllProfits[]> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<AllProfits> = await connection.execute(getUserAllQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getUserAllProfits: ${err}`);
    }
}

const getTotalTypedQuery = `
SELECT SUM(winnings) AS winnings, SUM(losses) AS losses, SUM(winnings) - SUM(losses) AS profits
FROM profits
WHERE type = :type
`;
const getTotalAllQuery = `
SELECT SUM(winnings) AS winnings, SUM(losses) AS losses, SUM(winnings) - SUM(losses) AS profits
FROM profits
`;

async function getTotalProfits(type?: ProfitType): Promise<Profits|null> {
    try {
        const connection = await oracledb.getConnection();
        let result: oracledb.Result<Profits>;
        if (type) {
            result = await connection.execute(getTotalTypedQuery, {type}, selectExecuteOptions);
        }
        else {
            result = await connection.execute(getTotalAllQuery, {}, selectExecuteOptions);
        }

        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getTotalProfits: ${err}`);
    }
}

const getTopTypedQuery = `
SELECT user_id, winnings - losses AS profits
FROM profits
WHERE type = :type
ORDER BY profits DESC
`;
const getTopAllQuery = `
SELECT user_id, SUM(winnings) - SUM(losses) AS profits
FROM profits
WHERE type NOT IN ('${ProfitType.Income}', '${ProfitType.Tax}', '${ProfitType.Welfare}')
GROUP BY user_id
ORDER BY profits DESC
`;

interface ProfitsUser {
    USER_ID: string;
    PROFITS: number;
}

async function getTopProfits(type?: ProfitType): Promise<ProfitsUser[]> {
    try {
        const connection = await oracledb.getConnection();
        let result: oracledb.Result<ProfitsUser>;
        if (type) {
            result = await connection.execute(getTopTypedQuery, {type}, selectExecuteOptions);
        }
        else {
            result = await connection.execute(getTopAllQuery, {}, selectExecuteOptions);
        }
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getTopProfits: ${err}`);
    }
}

const updateQuery = `
MERGE INTO profits dest
    USING( SELECT :userId AS user_id, :type AS type, :winnings AS winnings, :losses AS losses FROM dual) src
        ON( dest.user_id = src.user_id AND dest.type = src.type )
    WHEN MATCHED THEN
        UPDATE SET winnings = dest.winnings + src.winnings, losses = dest.losses + src.losses
    WHEN NOT MATCHED THEN
        INSERT( user_id, type, winnings, losses ) 
        VALUES( src.user_id, src.type, src.winnings, src.losses )
`;

interface ProfitsUpdate {
    userId: string;
    type: ProfitType;
    profit: number;
}
async function updateProfits(arr: ProfitsUpdate[]) {
    try {
        const connection = await oracledb.getConnection();
        for (const {userId, type, profit} of arr) {
            if (profit > 0) {
                await connection.execute(updateQuery, {userId, type, winnings: profit, losses: 0});
            }
            else if (profit < 0) {
                await connection.execute(updateQuery, {userId, type, winnings: 0, losses: -profit});
            }
            
        }
        await connection.close();
    }
    catch (err) {
        throw new Error(`updateProfits: ${err}`);
    }
}

export { createTableProfits, updateTableProfits, getUserTypeProfits, getUserAllProfits, getTotalProfits, getTopProfits, updateProfits, ProfitType, ProfitsUpdate };