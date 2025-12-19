#!/bin/bash
# Script untuk test semua endpoints API

echo "=================================="
echo "Testing PertaSmart API Endpoints"
echo "=================================="

BASE_URL="${1:-http://localhost:5000}"

echo ""
echo "1. Testing Health Check..."
curl -s "$BASE_URL/health" | jq '.' || echo "FAILED"

echo ""
echo "2. Testing Live Data..."
curl -s "$BASE_URL/api/data/live" | jq '.success' || echo "FAILED"

echo ""
echo "3. Testing Honeywell Status..."
curl -s "$BASE_URL/api/honeywell/status" | jq '.' || echo "FAILED"

echo ""
echo "4. Testing Honeywell Test Connection..."
curl -s "$BASE_URL/api/honeywell/test-connection" | jq '.success' || echo "FAILED"

echo ""
echo "5. Testing Dashboard Stats..."
curl -s "$BASE_URL/api/data/dashboard/stats" | jq '.success' || echo "FAILED"

echo ""
echo "=================================="
echo "Test Complete"
echo "=================================="
