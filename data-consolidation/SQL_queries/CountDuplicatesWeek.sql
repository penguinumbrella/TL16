-- Query to find duplicates based on 'week_start_date' and 'zone_id'
SELECT 
    week_start_date, 
    zone_id, 
    COUNT(*) AS count
FROM 
    [Parking].[dbo].[Weekly_Occupancy_Stats]
GROUP BY 
    week_start_date, 
    zone_id
HAVING 
    COUNT(*) > 1;
