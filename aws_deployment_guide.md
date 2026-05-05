# AWS Deployment Guide: Asset Access Manager

This guide walks you through deploying the application on an AWS EC2 instance using **Docker Compose**. This is the most reliable and fastest way to get your production environment up and running.

## 1. Prepare your AWS EC2 Instance
- **Instance Type**: t3.medium or larger is recommended (at least 2GB RAM).
- **OS**: Ubuntu 22.04 LTS.
- **Security Group**: Ensure the following ports are open:
    - `22` (SSH)
    - `80` (HTTP)
    - `443` (HTTPS)
    - `5173` (Frontend - temporary)
    - `5051` (Backend API)

## 2. Install Docker & Docker Compose on the Server
SSH into your instance and run:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install -y docker-compose

# Add user to docker group (so you don't need sudo)
sudo usermod -aG docker $USER
# Log out and log back in for this to take effect
```

## 3. Upload/Clone the Code
Copy your code to the server using `git clone` or `scp`.
```bash
git clone <your-repository-url>
cd asset-access-manager
```

## 4. Configuration (Environment Variables)
Update your `docker-compose.yml` or create a `.env` file on the server.

### CRITICAL: Update API URLs
Vite builds the frontend at compile time. In `docker-compose.yml`, update the `VITE_API_URL` to your server's Public IP or Domain:

```yaml
# client service in docker-compose.yml
environment:
  - VITE_API_URL=http://your-server-ip:5051/api
```

### Update SMTP & Secrets
Ensure your `JWT_SECRET` is changed to a long random string and your SMTP credentials are correct for email notifications.

## 5. Launch the Application
Run the following command to build and start all services (Database, Backend, Frontend):
```bash
docker-compose up -d --build
```

## 6. Verification
- **Frontend**: Visit `http://your-server-ip:5173`
- **Backend API**: Visit `http://your-server-ip:5051/api/health`

## 7. Recommended Production Hardening
Once working, you should:
1. **Nginx Reverse Proxy**: Set up Nginx to serve the frontend on port 80 and proxy `/api` requests to port 5051.
2. **SSL**: Use Certbot (Let's Encrypt) to enable HTTPS.
3. **Database Backup**: Set up a cron job to dump the Postgres volume regularly.

### Quick Troubleshooting
- **Logs**: View real-time logs with `docker-compose logs -f`
- **Restart**: `docker-compose restart`
- **Database Shell**: `docker-compose exec db psql -U postgres -d aam_db`
