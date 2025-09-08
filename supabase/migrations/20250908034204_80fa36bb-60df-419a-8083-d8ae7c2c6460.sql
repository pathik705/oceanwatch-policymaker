-- Fix the missing foreign key relationship between pollution_incidents and profiles
ALTER TABLE pollution_incidents 
ADD CONSTRAINT fk_pollution_incidents_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id);