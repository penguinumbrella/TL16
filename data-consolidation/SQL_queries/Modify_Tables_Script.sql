-- Change the data type of column 'b' from INT to NVARCHAR(50)
-- ALTER TABLE [Parking].[dbo].[Daily_Occupancy_Stats]
-- DROP COLUMN unittimestamp;

-- Change the data type of column 'b' from INT to NVARCHAR(50)
-- ALTER TABLE [Parking].[dbo].[CamerasList]
-- ADD ParkadeName NVARCHAR(255);

-- ALTER TABLE [Parking].[dbo].[Daily_Occupancy_Stats]
-- ALTER COLUMN zone_id NVARCHAR(50);

-- Change the data type of column 'b' from INT to NVARCHAR(50)
-- ALTER TABLE [Parking].[dbo].[Weekly_Occupancy_Stats]
--ADD Capacity int;

-- Remove all rows from the table
-- TRUNCATE TABLE [Parking].[dbo].[Weekly_Occupancy_Stats];

UPDATE [Parking].[dbo].[CamerasList]
SET ParkadeName = 'UnivWstBlvd'
WHERE ParkadeName = 'UBRDLot';
