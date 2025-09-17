#!/bin/bash

# Stream AI Forecasting System - Deployment Script
# This script helps deploy the application using Docker

echo "Stream AI Forecasting System Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Check if Docker is installed
echo -e "${YELLOW}Checking Docker installation...${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}Docker is installed: ${DOCKER_VERSION}${NC}"
else
    echo -e "${RED}Docker is not installed or not running!${NC}"
    echo -e "${RED}Please install Docker from: https://www.docker.com/get-started${NC}"
    exit 1
fi

# Check if Docker Compose is available
echo -e "${YELLOW}Checking Docker Compose...${NC}"
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo -e "${GREEN}Docker Compose is available: ${COMPOSE_VERSION}${NC}"
else
    echo -e "${RED}Docker Compose is not available!${NC}"
    exit 1
fi

# Make sure Docker daemon is running
echo -e "${YELLOW}Checking Docker daemon...${NC}"
if ! docker info &> /dev/null; then
    echo -e "${RED}Docker daemon is not running! Please start Docker.${NC}"
    exit 1
fi

# Stop any existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose down

# Build and start the application
echo -e "${YELLOW}Building and starting containers...${NC}"
docker-compose up --build -d

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 30

# Check if services are running
echo -e "${YELLOW}Checking service status...${NC}"
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}Deployment successful!${NC}"
    echo ""
    echo -e "${CYAN}Application URLs:${NC}"
    echo -e "${WHITE}   Frontend: http://localhost${NC}"
    echo -e "${WHITE}   Backend API: http://localhost:5500${NC}"
    echo -e "${WHITE}   Database: localhost:3306${NC}"
    echo ""
    echo -e "${YELLOW}To view logs: docker-compose logs -f${NC}"
    echo -e "${YELLOW}To stop: docker-compose down${NC}"
else
    echo -e "${RED}Some services failed to start!${NC}"
    echo -e "${YELLOW}Check logs with: docker-compose logs${NC}"
    exit 1
fi