WITH FilteredPlates AS (
    SELECT
        Plate,
        TimestampLocal,
        DeviceId,
        ROW_NUMBER() OVER (PARTITION BY Plate ORDER BY TimestampLocal DESC) AS rn
    FROM
        [LPRManager].[dbo].[Reads]
    WHERE 
        CONVERT(DATE, TimestampLocal) = '2024-07-29'
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
    flp.Plate,
    flp.TimestampLocal,
    flp.DeviceId,
    flp.ParkadeName,
    ap.ZoneId,
    ap.PermitId,
    ap.EffectiveDate,
    ap.ExpiryDate
FROM
    FilteredLatestPlates flp
LEFT JOIN
    ActivePlates ap ON flp.Plate = ap.Plate AND ap.rn = 1;
