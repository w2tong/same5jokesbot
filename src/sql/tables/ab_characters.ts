import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';
import { Classes, ClassName } from '../../autoBattler/Classes/classes';
import { logError } from '../../logger';
import { levelExp } from '../../autoBattler/experience';

const createTableABCharacters = {
    name: 'AB_CHARACTERS',
    query: `
        CREATE TABLE ab_characters (
            user_id VARCHAR2(64) NOT NULL,
            char_name VARCHAR2(32) NOT NULL,
            class_name VARCHAR2(16) NOT NULL,
            char_level INTEGER DEFAULT 1 NOT NULL,
            experience INTEGER DEFAULT 0 NOT NULL,
            selected NUMBER(1,0) DEFAULT 0 NOT NULL,
            CONSTRAINT pk_ab_characters PRIMARY KEY (user_id, char_name),
            CONSTRAINT chk_class_name CHECK (class_name IN (${Object.keys(Classes).map(type => `'${type}'`).join(',')}))
        )
    `
};

const updateTableABCharacters = [`
ALTER TABLE ab_characters
DROP CONSTRAINT chk_class_name
`,
`
ALTER TABLE ab_characters
ADD CONSTRAINT chk_class_name CHECK (class_name IN (${Object.keys(Classes).map(type => `'${type}'`).join(',')}))
`
];

const insertQuery = `
INSERT INTO ab_characters (user_id, char_name, class_name)
VALUES (:userId, :name, :className)
`;

async function insertABChar(userId: string, name: string, className: ClassName): Promise<boolean> {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(insertQuery, {userId, name, className});
        await connection.close();
        return true;
    }
    catch (err) {
        logError(err);
        return false;
    }
}

const deleteQuery = `
DELETE FROM ab_characters
WHERE user_id = :userId
AND char_name = :name
`;

async function deleteABChar(userId: string, name: string) {
    try {
        const connection = await oracledb.getConnection();
        const res = await connection.execute(deleteQuery, {userId, name});
        await connection.close();
        return res;
    }
    catch (err) {
        throw new Error(`deleteABChar: ${err}`);
    }
}

const getPlayerCharQuery = `
SELECT *
FROM ab_characters
WHERE user_id = :userId
AND char_name = :name
`;
async function getABPlayerChar(userId: string, name: string): Promise<ABCharacter|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<ABCharacter> = await connection.execute(getPlayerCharQuery, {userId, name}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getABPlayerChars: ${err}`);
    }
}

const getPlayerCharsQuery = `
SELECT *
FROM ab_characters
WHERE user_id = :userId
`;
type ABCharacter = {
    USER_ID: string;
    CHAR_NAME: string;
    CLASS_NAME: ClassName;
    CHAR_LEVEL: number;
    EXPERIENCE: number;
    SELECTED: number;
}
async function getABPlayerChars(userId: string): Promise<ABCharacter[]> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<ABCharacter> = await connection.execute(getPlayerCharsQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getABPlayerChars: ${err}`);
    }
}

const selectCharQuery = `
UPDATE ab_characters
SET selected = (CASE char_name WHEN :name THEN 1 ELSE 0 END)
WHERE user_id = :userId
`;
async function selectABChar(userId: string, name: string) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(selectCharQuery, {userId, name});
        await connection.close();
    }
    catch (err) {
        throw new Error(`selectABChar: ${err}`);
    }
}

const getSelectedCharQuery = `
SELECT *
FROM ab_characters
WHERE user_id = :userId
AND selected = 1
`;
async function getABSelectedChar(userId: string): Promise<ABCharacter|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<ABCharacter> = await connection.execute(getSelectedCharQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getABSelectedChar: ${err}`);
    }
}

// TODO: level up character if they are past exp threshold
const updateExpQuery = `
UPDATE ab_characters
SET char_level = :charLevel, experience = :experience
WHERE user_id = :userId and char_name = :name
`;
async function updateABCharExp(userId: string, name: string, amount: number): Promise<{level: number, exp: number}|null> {
    try {
        const connection = await oracledb.getConnection();
        const char = await getABPlayerChar(userId, name);
        if (!char) return null;
        if (!levelExp[char.CHAR_LEVEL]) return null;
        let experience = Math.max(char.EXPERIENCE + amount, 0);
        let charLevel = char.CHAR_LEVEL;
        while (levelExp[charLevel] && experience >= levelExp[charLevel]) {
            experience -= levelExp[charLevel];
            charLevel++;
        }
        if (!levelExp[charLevel]) experience = 0;
        await connection.execute(updateExpQuery, {userId, name, charLevel, experience}, selectExecuteOptions);
        await connection.close();
        return {level: charLevel, exp: experience};
    }
    catch (err) {
        throw new Error(`updateABCharExp: ${err}`);
    }
}

export { createTableABCharacters, updateTableABCharacters, insertABChar, deleteABChar, getABPlayerChars, selectABChar, getABSelectedChar, updateABCharExp };