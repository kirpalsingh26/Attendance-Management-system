#!/bin/bash

echo "🧪 Testing Gemini Image Upload API"
echo "===================================="
echo ""

# Test 1: Health check
echo "1️⃣ Testing health endpoint..."
curl -s http://localhost:5001/api/health | jq '.' 2>/dev/null || curl -s http://localhost:5001/api/health
echo ""
echo ""

# Test 2: Upload endpoint without auth
echo "2️⃣ Testing upload-image endpoint (no auth - should fail)..."
curl -s -X POST http://localhost:5001/api/timetable/upload-image | jq '.' 2>/dev/null || curl -s -X POST http://localhost:5001/api/timetable/upload-image
echo ""
echo ""

# Test 3: Check if route exists
echo "3️⃣ Testing if route is registered..."
curl -s -X OPTIONS http://localhost:5001/api/timetable/upload-image -v 2>&1 | grep -E "(HTTP|Allow)" | head -5
echo ""
echo ""

echo "✅ API Test Complete!"
echo ""
echo "Next steps:"
echo "1. Make sure you're logged in on the frontend"
echo "2. Open browser console (F12)"
echo "3. Try uploading an image"
echo "4. Check backend logs above for detailed output"
