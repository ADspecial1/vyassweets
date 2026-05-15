#!/bin/bash
# Run this script ONCE on a fresh Ubuntu 22.04 EC2 instance
# Usage: bash setup-ec2.sh

set -e

echo "=== [1/7] System update ==="
sudo apt-get update && sudo apt-get upgrade -y

echo "=== [2/7] Install Node.js 20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v && npm -v

echo "=== [3/7] Install PM2 globally ==="
sudo npm install -g pm2
pm2 -v

echo "=== [4/7] Install Nginx ==="
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

echo "=== [5/7] Install Java (required for Jenkins) ==="
sudo apt-get install -y openjdk-17-jdk
java -version

echo "=== [6/7] Install Jenkins ==="
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update
sudo apt-get install -y jenkins
sudo systemctl enable jenkins
sudo systemctl start jenkins

echo "=== [7/7] Install Git & certbot ==="
sudo apt-get install -y git
sudo apt-get install -y certbot python3-certbot-nginx

echo ""
echo "=== Setup complete ==="
echo "Jenkins initial admin password:"
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
echo ""
echo "Jenkins is at: http://$(curl -s ifconfig.me):8080"
echo "Create log dir:"
mkdir -p /home/ubuntu/logs
