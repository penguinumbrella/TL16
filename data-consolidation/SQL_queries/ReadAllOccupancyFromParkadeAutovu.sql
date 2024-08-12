/****** Script for SelectTopNRows command from SSMS  ******/
SELECT
      [ZoneId]
      ,REPLACE(REPLACE(REPLACE(CONVERT(VARCHAR(20), [TimestampUtc], 120), '-', ''), ' ', ''), ':', '') AS TimestampUtc
      ,REPLACE(REPLACE(REPLACE(CONVERT(VARCHAR(20), [Timestamp], 120), '-', ''), ' ', ''), ':', '') AS Timestamp
      ,[Capacity]
      ,[Vehicles]
      ,[Violations]
      ,[ViolationsEnforced]
      ,DATEDIFF(SECOND, '1970-01-01 00:00:00', [Timestamp]) AS TimestampUnix
  FROM [LPRManager].[dbo].[ParkingOccupancies] 
  WHERE ZoneId = '1B3D7D69-A1D0-4B8B-B86A-D31F8CFF2B2E' 
  ORDER BY [Timestamp] DESC
