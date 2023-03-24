CREATE INDEX gamers_hit_rate
ON gamers_counter (discharge, disperse, rise_up, gamers_counter((discharge + disperse + rise_up) AS total, (total / discharge * 100) AS discharge_rate, (total / disperse * 100) AS disperse_rate, (total / rise_up * 100) AS rise_up_rate));

-- Get disperse streak highscore of guild
SELECT * FROM disperse_streak_highscore
WHERE guild_id = :guild_id 
;

-- Update disperse streak highscore with new score
UPDATE disperse_streak_highscore
SET user_id = :user_id, score = :score
WHERE guild_id = :guild_id
;

-- Insert or Update gamers_counter
MERGE INTO users dest
  USING( SELECT :user_id AS user_id FROM dual) src
     ON( dest.user_id = src.user_id )
 WHEN MATCHED THEN
   UPDATE SET :col = src.:col + 1
 WHEN NOT MATCHED THEN
   INSERT( user_id, :col ) 
     VALUES( src.user_id, 1 );