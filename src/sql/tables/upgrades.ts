import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';
import { upgradeIds } from '../../upgrades/upgradeManager';

const createTableUpgrades = {
    name: 'UPGRADES',
    query: `
        CREATE TABLE upgrades (
            user_id VARCHAR2(64) NOT NULL,
            upgrade_id VARCHAR2(64) NOT NULL,
            upgrade_level NUMBER DEFAULT 0,
            CONSTRAINT pk_upgrades PRIMARY KEY (user_id, upgrade_id),
            CONSTRAINT chk_upgrades CHECK (upgrade_level IN (${upgradeIds.map(type => `'${type}'`).join(',')}))
        )
    `
};

const updateTableUpgrades = [`
ALTER TABLE upgrades
DROP CONSTRAINT chk_upgrades
`,
`
ALTER TABLE upgrades
ADD CONSTRAINT chk_upgrades CHECK (upgrade_level IN (${upgradeIds.map(type => `'${type}'`).join(',')}))
`
];

type UpgradeRow = {
    USER_ID: string;
    UPGRADE_ID: string;
    UPGRADE_LEVEL: number
}

const getUserQuery = `
SELECT user_id, upgrade_id, upgrade_level
FROM upgrades
WHERE user_id = :userId
`;

async function getUserUpgrades(userId: string): Promise<UpgradeRow[]> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<UpgradeRow> = await connection.execute(getUserQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getUserUpgrades: ${err}`);
    }
}

const getAllQuery = `
SELECT user_id, upgrade_id, upgrade_level
FROM upgrades
`;

async function getAllUpgrades(): Promise<UpgradeRow[]> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<UpgradeRow> = await connection.execute(getAllQuery, {}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getAllUpgrades: ${err}`);
    }
}

const updateQuery = `
MERGE INTO upgrades dest
    USING( SELECT :userId AS user_id, :upgrade_id AS upgrade_id FROM dual) src
        ON( dest.user_id = src.user_id AND dest.upgrade_id = src.upgrade_id )
    WHEN MATCHED THEN
        UPDATE SET upgrade_level = dest.upgrade_level + 1
    WHEN NOT MATCHED THEN
        INSERT( user_id, upgrade_id, upgrade_level ) 
        VALUES( src.user_id, src.upgrade_id, 1 )
`;

async function updateUpgrades(userId: string, upgradeId: string) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(updateQuery, {userId, upgradeId});
        await connection.close();
    }
    catch (err) {
        throw new Error(`updateUpgrades: ${err}`);
    }
}

export { createTableUpgrades, updateTableUpgrades, getUserUpgrades, getAllUpgrades, updateUpgrades };