-- Remove duplicates
WITH CTE AS (
    SELECT
        *,
        ROW_NUMBER() OVER (PARTITION BY date, zone_id ORDER BY peak_occupancy) AS row_num
    FROM [dbo].[Daily_Occupancy_Stats]
)
DELETE FROM CTE
WHERE row_num > 1;