#!/bin/bash

if [ "$#" -ne 3 ]; then
  echo "Missing arguments"
  exit 1
fi

GH_USERNAME=$1
GH_PAT=$2
GH_BRANCH=$3

# Define variables
INSTANCE_TYPE="t3.medium"
KEY_NAME="test-ubc-parking"
SECURITY_GROUP="launch-wizard-1"
REGION="ca-central-1"
AMI_ID="ami-0c4596ce1e7ae3e68"  # Ubuntu
INSTANCE_NAME="UBCParkingReact"
USER="ubuntu"


# Create EC2 instance
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_ID \
  --count 1 \
  --instance-type $INSTANCE_TYPE \
  --key-name $KEY_NAME \
  --security-groups $SECURITY_GROUP \
  --region $REGION \
  --query "Instances[0].InstanceId" \
  --output text)

echo "Instance ID: $INSTANCE_ID"

# Tag the instance
aws ec2 create-tags \
  --resources $INSTANCE_ID \
  --tags Key=Name,Value=$INSTANCE_NAME \
  --region $REGION

# Wait for the instance to be in 'running' state
echo "Waiting for instance to be ready..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $REGION

# Get the public DNS of the instance
PUBLIC_DNS=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --region $REGION \
  --query "Reservations[0].Instances[0].PublicDnsName" \
  --output text)

echo "Instance Public DNS: $PUBLIC_DNS"

# Create a separate folder for the frontend .env file
ssh -i ~/.ssh/$KEY_NAME.pem $USER@$PUBLIC_DNS "mkdir ~/frontendEnv/" 
# send .env over to the EC2
scp -i ~/.ssh/$KEY_NAME.pem ./app/.env $USER@$PUBLIC_DNS:~/
scp -i ~/.ssh/$KEY_NAME.pem ./app/frontend/.env $USER@$PUBLIC_DNS:~/frontendEnv/


# SSH into the EC2 instance and run commands
ssh -i ~/.ssh/$KEY_NAME.pem $USER@$PUBLIC_DNS << EOF
  sudo apt update
  sudo apt install npm -y
  sudo apt install nginx -y
  sudo apt install python-is-python3 -y
  sudo apt install python3-pip -y


  git clone https://$GH_USERNAME:$GH_PAT@github.com/penguinumbrella/TL16

  echo "Navigating to application directory..."
  cd TL16

  git checkout $GH_BRANCH

  pip install -r ./requirements.txt --break-system-packages

  sed -i 's/SERVER_PLACEHOLDER/$PUBLIC_DNS/g' nginx.txt
  sudo cat nginx.txt | sudo tee /etc/nginx/sites-available/default > /dev/null

  sudo nginx -t
  sudo systemctl restart nginx

  cd app
  mv ~/.env ./
  mv ~/frontendEnv/.env ./frontend/
  npm install
  npm run build  
  nohup npm run start > server.log 2>&1 & 
  echo "Done with the remote commands."
EOF

echo "Script completed successfully."
echo "App running at http://$PUBLIC_DNS"
