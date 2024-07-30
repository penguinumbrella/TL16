WITH LatestOccupancies AS (
    SELECT
        ZoneId,
        TimestampUtc,
        Timestamp,
        TimeZoneId,
        Capacity,
        Vehicles,
        Violations,
        ViolationsEnforced,
        ROW_NUMBER() OVER (PARTITION BY ZoneId ORDER BY Timestamp DESC) AS rn
    FROM
        [LPRManager].[dbo].[ParkingOccupancies]
)
SELECT
    ZoneId,
    TimestampUtc,
    Timestamp,
    TimeZoneId,
    Capacity,
    Vehicles,
    Violations,
    ViolationsEnforced,
    CASE 
        WHEN ZoneId = 'E10D7DB4-C792-42AC-BAE8-969FA63F198D' THEN 'West Parkade'
        WHEN ZoneId = '33B31206-E1F8-44CE-87A5-318C6D198416' THEN 'Rose Garden Parkade'
        WHEN ZoneId = '859835AD-E855-4DBF-83ED-419DEF40537C' THEN 'Health Sciences Parkade'
        WHEN ZoneId = '3B3F3EC1-5D84-4C80-9CAD-2CCC9A9268A4' THEN 'Fraser Parkade'
        WHEN ZoneId = '7A5B3916-AD6C-445E-A6C5-BC582EB20530' THEN 'Thunderbird Parkade'
        WHEN ZoneId = 'ACF9CF85-6991-42B9-9467-6094008D1094' THEN 'North Parkade'
        WHEN ZoneId = '1B3D7D69-A1D0-4B8B-B86A-D31F8CFF2B2E' THEN 'University West Boulevard'
        ELSE 'Unknown Parkade'
    END AS ParkadeName
FROM
    LatestOccupancies
WHERE
    rn = 1;



WITH FilteredPlates AS (
    SELECT
        Plate,
        TimestampLocal,
        DeviceId,
        ROW_NUMBER() OVER (PARTITION BY Plate ORDER BY TimestampLocal DESC) AS rn
    FROM
        [LPRManager].[dbo].[Reads]
    WHERE 
        TimestampUtc >= '2024-07-29 03:00:00'
),
LatestPlates AS (
    SELECT
        Plate,
        TimestampLocal,
        DeviceId
    FROM
        FilteredPlates
    WHERE
        rn = 1
),
EntryDevices AS (
    SELECT *
    FROM (VALUES
        ('2084F4DA-E6EC-4013-9B79-2414D488F804', 'Fraser'),
        ('B4FD97C7-41C8-40F7-9772-759752373A53', 'Fraser'),
        ('68629885-7E9F-4B8F-8306-D1001D36720D', 'HealthSciences'),
        ('EB498796-DD80-46D0-AE40-8DED5983B66D', 'HealthSciences'),
        ('A06921B1-628E-4233-8579-E6701894DC2F', 'HealthSciences'),
        ('584E0CE0-E0BB-4324-B1E0-070950B456AC', 'North'),
        ('5B88D16F-4F3C-4D03-B158-9301BA7F7B95', 'North'),
        ('149ADAA5-7DE2-4EFE-8E04-490DB7B4F8BF', 'North'),
        ('D8DC7032-E6CA-4F09-818C-ABCAFD4E2AFB', 'Rose'),
        ('8AEE758A-C7D5-4B9B-9F3E-8E9D67FBDBE6', 'Rose'),
        ('78474174-61AE-4D8F-8D79-A6DD2B6EEEFA', 'Rose'),
        ('AD848ED9-8191-417E-B7D0-92B410071D17', 'Thunderbird'),
        ('4478A7D4-34D8-46D5-90EA-FD5F6FCD36FB', 'Thunderbird'),
        ('7C72ADB0-8824-4EB3-B16F-B57FCC09BDF3', 'Thunderbird'),
        ('46C5937F-40AE-475A-B6BC-6E24F9CE2BC7', 'UnivWstBlvd'),
        ('20A08C9D-7AF4-40C9-BA2B-53F6F5FC8B79', 'West'),
        ('B828434B-DE54-4FA8-83F4-65461D01FE97', 'West'),
        ('D48B0656-5B5A-4675-A18C-DBAACF916521', 'West')
    ) AS T (DeviceId, ParkadeName)
),
FilteredLatestPlates AS (
    SELECT 
        lp.Plate,
        lp.TimestampLocal,
        lp.DeviceId,
        ed.ParkadeName
    FROM 
        LatestPlates lp
    JOIN 
        EntryDevices ed ON lp.DeviceId = ed.DeviceId
),
ActivePlates AS (
    SELECT
        Plate,
        ZoneId,
        PermitId,
        EffectiveDate,
        ExpiryDate,
        ROW_NUMBER() OVER (PARTITION BY Plate ORDER BY ExpiryDate DESC) AS rn
    FROM
        [PaybyPlateSync].[dbo].[ActivePlates]
)
SELECT
    flp.ParkadeName,
    COUNT(*) AS PlateCount
FROM
    FilteredLatestPlates flp
LEFT JOIN
    ActivePlates ap ON flp.Plate = ap.Plate AND ap.rn = 1
GROUP BY
    flp.ParkadeName;
