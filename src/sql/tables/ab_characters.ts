import oracledb from 'oracledb';
import { selectExecuteOptions } from '../query-options';
import { classes, ClassName } from '../../autoBattler/Classes/classes';

const createTableABCharacters = {
    name: 'AB_CHARACTERS',
    query: `
        CREATE TABLE ab_characters (
            user_id VARCHAR2(64) NOT NULL,
            char_name VARCHAR2(32) NOT NULL,
            class_name VARCHAR2(16) NOT NULL,
            char_level INTEGER DEFAULT 1 NOT NULL,
            experience INTEGER DEFAULT 0 NOT NULL,
            CONSTRAINT pk_ab_characters PRIMARY KEY (user_id, char_name),
            CONSTRAINT chk_char_class CHECK (class_name IN (${Object.keys(classes).map(type => `'${type}'`).join(',')}))
        )
    `
};

const updateTableABCharacters = [`
ALTER TABLE ab_characters
DROP CONSTRAINT chk_class_name
`,
`
ALTER TABLE ab_characters
ADD CONSTRAINT chk_class_name CHECK (class_name IN (${Object.keys(classes).map(type => `'${type}'`).join(',')}))
`
];

const insertQuery = `
INSERT INTO lottery (user_id, char_name, class_name)
VALUES (:userId, :name, :className)
`;

async function insertABCharacter(userId: string, name: string, className: ClassName) {
    try {
        const connection = await oracledb.getConnection();
        const res = await connection.execute(insertQuery, {userId, name, className});
        await connection.close();
    }
    catch (err) {
        throw new Error(`insertABCharacter: ${err}`);
    }
}

export { createTableABCharacters, updateTableABCharacters, insertABCharacter };