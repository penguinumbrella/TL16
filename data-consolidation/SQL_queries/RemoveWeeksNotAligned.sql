-- Delete rows where week_start_date is not a Monday
DELETE FROM [Parking].[dbo].[Weekly_Occupancy_Stats]
WHERE DATEPART(WEEKDAY, week_start_date) != 2;
