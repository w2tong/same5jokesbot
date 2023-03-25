const createDisperseCurrentStreakTable = `
CREATE TABLE disperse_current_streak (
    guild_id VARCHAR2(255) PRIMARY KEY,
    user_id VARCHAR2(255) NOT NULL,
    streak NUMBER DEFAULT 0
)
`;

const createDisperseStreakBreaksTable = `
CREATE TABLE disperse_streak_breaks (
    user_id VARCHAR2(255) PRIMARY KEY,
    breaks NUMBER DEFAULT 0,
    score NUMBER DEFAULT 0
)
`;

const createDisperseStreakHighscoreTable = `
CREATE TABLE disperse_streak_highscore (
    guild_id VARCHAR2(255) PRIMARY KEY,
    user_id VARCHAR2(255) NOT NULL,
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
// DISPERSE_CURRENT_STREAK
const getDisperseCurrentStreak = `
SELECT user_id, streak FROM disperse_current_streak
WHERE guild_id = :guildId
`;

const updateDisperseCurrentStreak = `
MERGE INTO disperse_current_streak dest
    USING( SELECT :guildId AS guild_id, :userId AS user_id, :streak AS streak FROM dual) src
        ON( dest.guild_id = src.guild_id )
    WHEN MATCHED THEN
            UPDATE SET user_id = src.user_id, streak = src.streak
    WHEN NOT MATCHED THEN
        INSERT( guild_id, user_id, streak ) 
        VALUES( src.guild_id, src.user_id, src.streak )
`;

//DISPERSE_STREAK_BREAKS
const getDisperseStreakBreaks = `
SELECT breaks, score FROM disperse_streak_breaks
WHERE user_id = :userId
`;

const updateDisperseStreakBreaks = `
MERGE INTO disperse_streak_breaks dest
    USING( SELECT :userId AS user_id, :score AS score FROM dual) src
        ON( dest.user_id = src.user_id )
    WHEN MATCHED THEN
        UPDATE SET breaks = dest.breaks + 1, score = dest.score + src.score
    WHEN NOT MATCHED THEN
        INSERT( user_id, breaks, score ) 
        VALUES( src.user_id, 1, src.score )
`;

//DISPERSE_STREAK_HIGHSCORE
const getDisperseStreakHighScore = `
SELECT user_id, streak FROM disperse_streak_highscore
WHERE guild_id = :guildId
`;

const updateDisperseStreakHighScore = `
MERGE INTO disperse_streak_highscore dest
    USING( SELECT :guildId AS guild_id, :userId AS user_id, :streak AS streak FROM dual) src
        ON( dest.guild_id = src.guild_id )
    WHEN MATCHED THEN
            UPDATE SET user_id = src.user_id, streak = src.streak
            WHERE src.streak > dest.streak
    WHEN NOT MATCHED THEN
        INSERT( guild_id, user_id, streak ) 
        VALUES( src.guild_id, src.user_id, src.streak )
`;

// GAMERS_COUNTER queries
const getGamersCounter = `
SELECT discharge, disperse, rise_up FROM gamers_counter
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

export default { createDisperseCurrentStreakTable, createDisperseStreakBreaksTable, createDisperseStreakHighscoreTable, createGamersCounterTable, getDisperseCurrentStreak, updateDisperseCurrentStreak, getDisperseStreakBreaks, updateDisperseStreakBreaks, getDisperseStreakHighScore, updateDisperseStreakHighScore, getGamersCounter, updateGamersCounterDischarge, updateGamersCounterDisperse, updateGamersCounterRiseUp };