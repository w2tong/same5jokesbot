import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';
import { Classes, ClassName } from '../../autoBattler/Classes/classes';
import { logError } from '../../logger';

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

async function insertABCharacter(userId: string, name: string, className: ClassName): Promise<boolean> {
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

async function deleteABCharacter(userId: string, name: string) {
    try {
        const connection = await oracledb.getConnection();
        const res = await connection.execute(deleteQuery, {userId, name});
        await connection.close();
        return res;
    }
    catch (err) {
        throw new Error(`deleteABCharacter: ${err}`);
    }
}

const getPlayerCharactersQuery = `
SELECT *
FROM ab_characters
WHERE user_id = :userId
`;
type ABCharacter = {
    USER_ID: string;
    CHAR_NAME: string;
    CLASS_NAME: ClassName,
    CHAR_LEVEL: number;
    EXPERIENCE: number;
}
async function getABPlayerCharacters(userId: string): Promise<ABCharacter[]> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<ABCharacter> = await connection.execute(getPlayerCharactersQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows;
        }
        return [];
    }
    catch (err) {
        throw new Error(`getABPlayerCharacters: ${err}`);
    }
}

const selectCharacterQuery = `
UPDATE ab_characters
SET selected = (CASE char_name WHEN :name THEN 1 ELSE 0 END)
WHERE user_id = :userId
`;
async function selectABCharacter(userId: string, name: string) {
    try {
        const connection = await oracledb.getConnection();
        await connection.execute(selectCharacterQuery, {userId, name});
        await connection.close();
    }
    catch (err) {
        throw new Error(`selectABCharacter: ${err}`);
    }
}

const getSelectedCharacterQuery = `
SELECT *
FROM ab_characters
WHERE user_id = :userId
AND selected = 1
`;
async function getABPSelectedCharacter(userId: string): Promise<ABCharacter|null> {
    try {
        const connection = await oracledb.getConnection();
        const result: oracledb.Result<ABCharacter> = await connection.execute(getSelectedCharacterQuery, {userId}, selectExecuteOptions);
        await connection.close();
        if (result && result.rows && result.rows.length !== 0) {
            return result.rows[0];
        }
        return null;
    }
    catch (err) {
        throw new Error(`getABPSelectedCharacter: ${err}`);
    }
}

export { createTableABCharacters, updateTableABCharacters, insertABCharacter, deleteABCharacter, getABPlayerCharacters, selectABCharacter, getABPSelectedCharacter };