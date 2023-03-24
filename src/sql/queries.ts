const createDisperseStreakHighscoreTable = `
CREATE TABLE disperse_streak_highscore (
    guild_id VARCHAR2(255) PRIMARY KEY,
    user_id VARCHAR2(255) NOT NULL,
    score NUMBER DEFAULT 0
)
`;

const createDisperseStreakCurrentScoreTable = `
CREATE TABLE disperse_streak_current_score (
    guild_id VARCHAR2(255) PRIMARY KEY,
    user_id VARCHAR2(255) NOT NULL,
    score NUMBER DEFAULT 0
)
`;

const createDisperseStreakBreaksTable = `
CREATE TABLE disperse_streak_breaks (
    user_id VARCHAR2(255) PRIMARY KEY,
    count NUMBER DEFAULT 0,
    score NUMBER DEFAULT 0
)
`;

const createGamersCounterTable = `
CREATE TABLE gamers_counter (
    user_id VARCHAR2(255) PRIMARY KEY,
    discharge NUMBER DEFAULT 0,
    disperse NUMBER DEFAULT 0,
    rise_up NUMBER DEFAULT 0
)
`;

const getGamersCounter = `
SELECT * FROM gamers_counter
WHERE user_id = :userId
`;

const updateGamersCounterDischarge = `
MERGE INTO gamers_counter dest
    USING( SELECT :userId AS user_id FROM dual) src
        ON( dest.user_id = src.user_id )
    WHEN MATCHED THEN
        UPDATE SET discharge = dest.discharge + 1
    WHEN NOT MATCHED THEN
        INSERT( user_id, discharge ) 
        VALUES( src.user_id, 1 )
`;

const updateGamersCounterDisperse = `
MERGE INTO gamers_counter dest
    USING( SELECT :userId AS user_id FROM dual) src
        ON( dest.user_id = src.user_id )
    WHEN MATCHED THEN
        UPDATE SET disperse = dest.disperse + 1
    WHEN NOT MATCHED THEN
        INSERT( user_id, disperse ) 
        VALUES( src.user_id, 1 )
`;

const updateGamersCounterRiseUp = `
MERGE INTO gamers_counter dest
    USING( SELECT :userId AS user_id FROM dual) src
        ON( dest.user_id = src.user_id )
    WHEN MATCHED THEN
        UPDATE SET rise_up = dest.rise_up + 1
    WHEN NOT MATCHED THEN
        INSERT( user_id, rise_up ) 
        VALUES( src.user_id, 1 )
`;

export default { createDisperseStreakHighscoreTable, createDisperseStreakCurrentScoreTable, createDisperseStreakBreaksTable, createGamersCounterTable, getGamersCounter, updateGamersCounterDischarge, updateGamersCounterDisperse, updateGamersCounterRiseUp };