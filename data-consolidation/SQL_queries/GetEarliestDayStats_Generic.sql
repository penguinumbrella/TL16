-- Create a temporary table to hold the data for the earliest day
WITH earliest_day_data AS (
    SELECT
        zone_id,
        DATEADD(SECOND, TimestampUnix, '1970-01-01') AS date,
        Vehicles,
		Capacity,
        TimestampUnix
    FROM 
        [Parking].[dbo].[RoseGardenParkade_Occupancy]
    WHERE
        CAST(DATEADD(SECOND, TimestampUnix, '1970-01-01') AS DATE) = (
            SELECT MIN(CAST(DATEADD(SECOND, TimestampUnix, '1970-01-01') AS DATE))
            FROM [Parking].[dbo].[RoseGardenParkade_Occupancy]
        )
),
-- Subquery to calculate average values
average_data AS (
    SELECT
        CAST(date AS DATE) AS date,
        zone_id,
        AVG(Vehicles) AS average_value
    FROM
        earliest_day_data
    GROUP BY
        CAST(date AS DATE),
        zone_id
),
-- Subquery to find peak values and their corresponding timestamps
peak_data AS (
    SELECT
        CAST(date AS DATE) AS date,
        zone_id,
        Vehicles AS peak_value,
        TimestampUnix AS peak_unix_timestamp,
		Capacity AS Capacity,
        ROW_NUMBER() OVER (PARTITION BY zone_id, CAST(date AS DATE) ORDER BY Vehicles DESC, TimestampUnix ASC) AS rn
    FROM
        earliest_day_data
)
-- Insert the aggregated data into 'Daily_Occupancy_Stats' table
INSERT INTO [Parking].[dbo].[Daily_Occupancy_Stats] (date, zone_id, average_occupancy, peak_occupancy, peak_occupancy_time, Capacity)
SELECT 
    a.date,
    a.zone_id,
    a.average_value,
    p.peak_value,
    p.peak_unix_timestamp,
	p.Capacity
FROM 
    average_data a
JOIN 
    (SELECT date, zone_id, peak_value, peak_unix_timestamp, Capacity
     FROM peak_data
     WHERE rn = 1) p
ON 
    a.date = p.date AND a.zone_id = p.zone_id;