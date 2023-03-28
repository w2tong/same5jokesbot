// DISPERSE_CURRENT_STREAK
const createDisperseCurrentStreakTable = `
CREATE TABLE disperse_current_streak (
    guild_id VARCHAR2(255) PRIMARY KEY,
    user_ids VARCHAR2(1000) NOT NULL,
    streak NUMBER DEFAULT 0
)
`;

const getDisperseCurrentStreak = `
SELECT user_ids, streak FROM disperse_current_streak
WHERE guild_id = :guildId
`;

const updateDisperseCurrentStreak = `
MERGE INTO disperse_current_streak dest
    USING( SELECT :guildId AS guild_id, :userIds AS user_ids, :streak AS streak FROM dual) src
        ON( dest.guild_id = src.guild_id )
    WHEN MATCHED THEN
            UPDATE SET user_ids = src.user_ids, streak = src.streak
    WHEN NOT MATCHED THEN
        INSERT( guild_id, user_ids, streak ) 
        VALUES( src.guild_id, src.user_ids, src.streak )
`;

//DISPERSE_STREAK_BREAKS
const createDisperseStreakBreaksTable = `
CREATE TABLE disperse_streak_breaks (
    user_id VARCHAR2(255) PRIMARY KEY,
    breaks NUMBER DEFAULT 0,
    score NUMBER DEFAULT 0
)
`;

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
const createDisperseStreakHighscoreTable = `
CREATE TABLE disperse_streak_highscore (
    guild_id VARCHAR2(255) PRIMARY KEY,
    user_ids VARCHAR2(255) NOT NULL,
    streak NUMBER DEFAULT 0
)
`;

const getDisperseStreakHighScore = `
SELECT user_ids, streak FROM disperse_streak_highscore
WHERE guild_id = :guildId
`;

const updateDisperseStreakHighScore = `
MERGE INTO disperse_streak_highscore dest
    USING( SELECT :guildId AS guild_id, :userIds AS user_ids, :streak AS streak FROM dual) src
        ON( dest.guild_id = src.guild_id )
    WHEN MATCHED THEN
            UPDATE SET user_ids = src.user_ids, streak = src.streak
            WHERE src.streak > dest.streak
    WHEN NOT MATCHED THEN
        INSERT( guild_id, user_ids, streak ) 
        VALUES( src.guild_id, src.user_ids, src.streak )
`;

// GAMERS_COUNTER queries
const createGamersCounterTable = `
CREATE TABLE gamers_counter (
    user_id VARCHAR2(255) PRIMARY KEY,
    discharge NUMBER DEFAULT 0,
    disperse NUMBER DEFAULT 0,
    rise_up NUMBER DEFAULT 0
)
`;

const getGamersCounter = `
SELECT discharge, disperse, rise_up FROM gamers_counter
WHERE user_id = :userId
`;

const getTopDisperseRate = `
SELECT gc.user_id, disperse/total.sum*100 AS disperse_pc, sum
FROM (SELECT user_id, discharge + disperse + rise_up AS sum FROM gamers_counter) total
JOIN gamers_counter gc
ON total.user_id = gc.user_id
ORDER BY disperse_pc DESC
`;

const getTopDisperseStreakBreaks =
`
SELECT * FROM disperse_streak_breaks
ORDER BY score DESC
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

// KNIT_COUNT queries
const createKnitCountTable = `
CREATE TABLE knit_count (
    user_id VARCHAR2(255) PRIMARY KEY,
    count NUMBER DEFAULT 0
)
`;

const getKnitCount = `
SELECT count FROM knit_count
WHERE user_id = :userId
`;

const updateKnitCount = `
MERGE INTO knit_count dest
    USING( SELECT :userId AS user_id FROM dual) src
        ON( dest.user_id = src.user_id )
    WHEN MATCHED THEN
        UPDATE SET count = dest.count + 1
    WHEN NOT MATCHED THEN
        INSERT( user_id, count ) 
        VALUES( src.user_id, 1 )
`;

// KNIT_SNEEZE queries
const createSneezeCountTable = `
CREATE TABLE sneeze_count (
    user_id VARCHAR2(255) PRIMARY KEY,
    count NUMBER DEFAULT 0
)
`;

const getSneezeCount = `
SELECT count FROM sneeze_count
WHERE user_id = :userId
`;

const updateSneezeCount = `
MERGE INTO sneeze_count dest
    USING( SELECT :userId AS user_id FROM dual) src
        ON( dest.user_id = src.user_id )
    WHEN MATCHED THEN
        UPDATE SET count = dest.count + 1
    WHEN NOT MATCHED THEN
        INSERT( user_id, count ) 
        VALUES( src.user_id, 1 )
`;

export default { 
    createTable: [ createDisperseCurrentStreakTable, createDisperseStreakBreaksTable, createDisperseStreakHighscoreTable, createGamersCounterTable, createKnitCountTable, createSneezeCountTable ],
    getDisperseCurrentStreak, updateDisperseCurrentStreak, getDisperseStreakBreaks, updateDisperseStreakBreaks, getDisperseStreakHighScore, updateDisperseStreakHighScore, getGamersCounter, getTopDisperseRate, getTopDisperseStreakBreaks, updateGamersCounterDischarge, updateGamersCounterDisperse, updateGamersCounterRiseUp, getKnitCount, updateKnitCount, getSneezeCount, updateSneezeCount };