DECLARE @GivenDate DATETIME = '2018-09-05'; -- Replace with your desired date

-- Step 1: Get all data later than the given date
WITH filtered_data AS (
    SELECT 
        zone_id,
        Vehicles,
        Capacity,
        TimestampUnix,
        DATEADD(SECOND, TimestampUnix, '1970-01-01') AS date,
        CONVERT(VARCHAR(10), DATEADD(DAY, -DATEPART(WEEKDAY, DATEADD(SECOND, TimestampUnix, '1970-01-01')) + 1, DATEADD(SECOND, TimestampUnix, '1970-01-01')), 23) AS week_start_date,
        CONVERT(VARCHAR(10), DATEADD(DAY, 7 - DATEPART(WEEKDAY, DATEADD(SECOND, TimestampUnix, '1970-01-01')), DATEADD(SECOND, TimestampUnix, '1970-01-01')), 23) AS week_end_date
    FROM 
        [Parking].[dbo].[FraserParkade_Occupancy]
    WHERE 
        DATEADD(SECOND, TimestampUnix, '1970-01-01') > @GivenDate
),

-- Step 2: Calculate average values per week
average_data AS (
    SELECT
        week_start_date,
        week_end_date,
        zone_id,
        AVG(Vehicles) AS average_value
    FROM
        filtered_data
    GROUP BY
        week_start_date,
        week_end_date,
        zone_id
),

-- Step 3: Find peak values and their corresponding timestamps per week
peak_data AS (
    SELECT
        week_start_date,
        week_end_date,
        zone_id,
        Vehicles AS peak_value,
        TimestampUnix AS peak_occupancy_timestamp,
        Capacity AS Capacity,
        ROW_NUMBER() OVER (PARTITION BY zone_id, week_start_date, week_end_date ORDER BY Vehicles DESC, TimestampUnix ASC) AS rn
    FROM
        filtered_data
)

-- Step 4: Insert the aggregated data into 'Weekly_Occupancy_Stats' table
INSERT INTO [Parking].[dbo].[Weekly_Occupancy_Stats] (week_start_date, week_end_date, zone_id, average_occupancy, peak_occupancy, peak_occupancy_time, Capacity)
SELECT 
    a.week_start_date,
    a.week_end_date,
    a.zone_id,
    a.average_value,
    p.peak_value,
    p.peak_occupancy_timestamp,
    p.Capacity
FROM 
    average_data a
JOIN 
    (SELECT week_start_date, week_end_date, zone_id, peak_value, peak_occupancy_timestamp, Capacity
     FROM peak_data
     WHERE rn = 1) p
ON 
    a.week_start_date = p.week_start_date AND a.zone_id = p.zone_id;
