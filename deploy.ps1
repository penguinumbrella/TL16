y# Variables
$clusterName = "TL16-UBCParking"
$taskDefinition = "UBCParkingTask"
$subnetId = "subnet-0b6c2c62288fee95b"
$securityGroupId = "sg-0de90974509951919" 
$waitTimeout = 600 # Maximum wait time in seconds (10 minutes)

# Network Configuration
$networkConfiguration = @{
    "awsvpcConfiguration" = @{
        "subnets" = @($subnetId)
        "securityGroups" = @($securityGroupId)
        "assignPublicIp" = "ENABLED"
    }
}

# Convert network configuration to JSON
$networkConfigurationJson = $networkConfiguration | ConvertTo-Json -Depth 9 -Compress | ConvertTo-Json -Depth 9;

echo $networkConfigurationJson

# Run the ECS Task
$runTaskOutput = aws ecs run-task `
    --cluster $clusterName `
    --task-definition $taskDefinition `
    --network-configuration $networkConfigurationJson `
    --launch-type "FARGATE" | ConvertFrom-Json

$taskArn = $runTaskOutput.tasks[0].taskArn
$taskId = $taskArn.Split('/')[-1]

Write-Host "Task started with ARN: $taskArn"

# Wait for the task to reach RUNNING status
$taskStatus = ""
$elapsedTime = 0
while ($taskStatus -ne "RUNNING" -and $elapsedTime -lt $waitTimeout) {
    Start-Sleep -Seconds 5
    $elapsedTime += 5

    $describeTasksOutput = aws ecs describe-tasks `
        --cluster $clusterName `
        --tasks $taskArn | ConvertFrom-Json

    $taskStatus = $describeTasksOutput.tasks[0].lastStatus
    Write-Host "Current task status: $taskStatus (Elapsed Time: $elapsedTime seconds)"
}

if ($taskStatus -eq "RUNNING") {
    Write-Host "Task is now in RUNNING status."

    # Get the ENI attached to the task
    $eniId = $describeTasksOutput.tasks[0].attachments[0].details | Where-Object { $_.name -eq "networkInterfaceId" } | Select-Object -ExpandProperty value

    # Get the public IP associated with the ENI
    $eniDescription = aws ec2 describe-network-interfaces --network-interface-ids $eniId | ConvertFrom-Json
    $publicIp = $eniDescription.NetworkInterfaces[0].Association.PublicIp

    Write-Host "Public IP Address of the container: http://${publicIp}:8080"
} else {
    Write-Host "Task did not reach RUNNING status within the timeout period."
}
