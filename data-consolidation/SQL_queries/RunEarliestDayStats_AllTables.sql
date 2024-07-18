-- Step 1: Define a list of table names
DECLARE @TableList TABLE (TableName NVARCHAR(255));

-- Insert your table names into the list
INSERT INTO @TableList (TableName)
VALUES 
    ('[Parking].[dbo].[FraserParkade_Occupancy]'),
    ('[Parking].[dbo].[WestParkade_Occupancy]'),
	('[Parking].[dbo].[ThunderbirdParkade_Occupancy]'),
	('[Parking].[dbo].[NorthParkade_Occupancy]'),
	('[Parking].[dbo].[UnivWstBlvdParkade_Occupancy]'),
	('[Parking].[dbo].[HealthSciencesParkade_Occupancy]'),
    ('[Parking].[dbo].[RoseGardenParkade_Occupancy]'); -- Add all your table names here

-- Step 2: Declare variables for the cursor
DECLARE @TableName NVARCHAR(255);
DECLARE @SQL NVARCHAR(MAX);

-- Step 3: Declare the cursor for the table list
DECLARE TableCursor CURSOR FOR
SELECT TableName FROM @TableList;

-- Step 4: Read the SQL script from the file
-- DECLARE @ScriptTemplate NVARCHAR(MAX);
-- SELECT @ScriptTemplate = BulkColumn
-- FROM OPENROWSET(BULK 'C:\!Capstone\repo\TL16\data-consolidation\SQL_queries\GetEarliestDayStats_Generic.sql', SINGLE_CLOB) AS Script;

-- Step 5: Open the cursor
OPEN TableCursor;

-- Step 6: Fetch the first table name
FETCH NEXT FROM TableCursor INTO @TableName;

-- Step 7: Loop through the table names
WHILE @@FETCH_STATUS = 0
BEGIN
    -- Step 8: Replace the placeholder with the actual table name for SQL script from file
    SET @SQL = N'WITH earliest_day_data AS (
    SELECT
        zone_id,
        DATEADD(SECOND, TimestampUnix, "1970-01-01") AS date,
        Vehicles,
        TimestampUnix
    FROM 
         ' + QUOTENAME(@TableName) + '
    WHERE
        CAST(DATEADD(SECOND, TimestampUnix, "1970-01-01") AS DATE) = (
            SELECT MIN(CAST(DATEADD(SECOND, TimestampUnix, "1970-01-01") AS DATE))
            FROM  ' + QUOTENAME(@TableName) + '
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
        ROW_NUMBER() OVER (PARTITION BY zone_id, CAST(date AS DATE) ORDER BY Vehicles DESC, TimestampUnix ASC) AS rn
    FROM
        earliest_day_data
)
-- Insert the aggregated data into "Daily_Occupancy_Stats" table
INSERT INTO [Parking].[dbo].[Daily_Occupancy_Stats] (date, zone_id, average_occupancy, peak_occupancy, peak_occupancy_time)
SELECT 
    a.date,
    a.zone_id,
    a.average_value,
    p.peak_value,
    p.peak_unix_timestamp
FROM 
    average_data a
JOIN 
    (SELECT date, zone_id, peak_value, peak_unix_timestamp
     FROM peak_data
     WHERE rn = 1) p
ON 
    a.date = p.date AND a.zone_id = p.zone_id;
';

    -- Step 8: Execute the dynamic SQL script
    EXEC sp_executesql @SQL;

    -- Fetch the next table name
    FETCH NEXT FROM TableCursor INTO @TableName;
END;

-- Step 9: Close and deallocate the cursor
CLOSE TableCursor;
DEALLOCATE TableCursor;