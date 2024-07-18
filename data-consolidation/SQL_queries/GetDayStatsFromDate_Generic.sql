DECLARE @GivenDate DATETIME = '2018-09-05'; -- Replace with your desired date

-- Step 1: Get all data later than the given date
WITH filtered_data AS (
    SELECT 
        zone_id,
        Vehicles,
		Capacity,
        TimestampUnix,
        DATEADD(SECOND, TimestampUnix, '1970-01-01') AS date
    FROM 
        [Parking].[dbo].[WestParkade_Occupancy]
    WHERE 
        DATEADD(SECOND, TimestampUnix, '1970-01-01') > @GivenDate
),

-- Step 2: Calculate average values
average_data AS (
    SELECT
        CAST(date AS DATE) AS date,
        zone_id,
        AVG(Vehicles) AS average_value
    FROM
        filtered_data
    GROUP BY
        CAST(date AS DATE),
        zone_id
),

-- Step 3: Find peak values and their corresponding timestamps
peak_data AS (
    SELECT
        CAST(date AS DATE) AS date,
        zone_id,
        Vehicles AS peak_value,
        TimestampUnix AS peak_unix_timestamp,
		Capacity AS Capacity,
        ROW_NUMBER() OVER (PARTITION BY zone_id, CAST(date AS DATE) ORDER BY Vehicles DESC, TimestampUnix ASC) AS rn
    FROM
        filtered_data
)

-- Step 4: Insert the aggregated data into 'Daily_Occupancy_Stats' table
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