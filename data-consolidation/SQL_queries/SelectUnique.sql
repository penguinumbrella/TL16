WITH RankedRows AS (
    SELECT 
        DeviceId,
		UnitId,
        TimestampLocal,
        ROW_NUMBER() OVER (PARTITION BY DeviceId ORDER BY TimestampLocal) AS RowNum
    FROM [LPRManager].[dbo].[Reads] WHERE TimestampLocal > '2024-07-01'
)
SELECT DeviceId, UnitId, TimestampLocal
FROM RankedRows
WHERE RowNum = 1;
