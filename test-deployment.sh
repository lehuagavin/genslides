#!/bin/bash

# Test script to verify Docker deployment

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Testing GenSlides Docker Deployment${NC}\n"

# Test 1: Check if containers are running
echo "Test 1: Checking if containers are running..."
if docker compose ps | grep -q "genslides-backend.*running"; then
    echo -e "${GREEN}✓ Backend container is running${NC}"
else
    echo -e "${RED}✗ Backend container is not running${NC}"
    exit 1
fi

if docker compose ps | grep -q "genslides-frontend.*running"; then
    echo -e "${GREEN}✓ Frontend container is running${NC}"
else
    echo -e "${RED}✗ Frontend container is not running${NC}"
    exit 1
fi

# Test 2: Check backend health
echo -e "\nTest 2: Checking backend health endpoint..."
if curl -sf http://localhost:3003/health > /dev/null; then
    echo -e "${GREEN}✓ Backend health check passed${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    exit 1
fi

# Test 3: Check frontend health
echo -e "\nTest 3: Checking frontend health endpoint..."
if curl -sf http://localhost/health > /dev/null; then
    echo -e "${GREEN}✓ Frontend health check passed${NC}"
else
    echo -e "${RED}✗ Frontend health check failed${NC}"
    exit 1
fi

# Test 4: Check API response
echo -e "\nTest 4: Testing API endpoint..."
response=$(curl -sf http://localhost:3003/api/slides/test 2>&1 || echo "error")
if [[ "$response" == *"error"* ]] && [[ "$response" != *"404"* ]]; then
    echo -e "${RED}✗ API endpoint test failed${NC}"
    exit 1
else
    echo -e "${GREEN}✓ API endpoint is accessible${NC}"
fi

# Test 5: Check frontend is serving
echo -e "\nTest 5: Checking frontend response..."
if curl -sf http://localhost/ | grep -q "<!DOCTYPE html>"; then
    echo -e "${GREEN}✓ Frontend is serving HTML${NC}"
else
    echo -e "${RED}✗ Frontend is not serving properly${NC}"
    exit 1
fi

# Test 6: Check volumes
echo -e "\nTest 6: Checking data persistence..."
if docker compose exec -T backend ls /app/slides > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Slides directory is mounted${NC}"
else
    echo -e "${RED}✗ Slides directory is not accessible${NC}"
    exit 1
fi

# Test 7: Check network connectivity
echo -e "\nTest 7: Checking inter-service connectivity..."
if docker compose exec -T frontend ping -c 1 backend > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend can reach backend${NC}"
else
    echo -e "${RED}✗ Frontend cannot reach backend${NC}"
    exit 1
fi

echo -e "\n${GREEN}All tests passed! ✓${NC}"
echo -e "\n${YELLOW}Deployment Status:${NC}"
docker compose ps
