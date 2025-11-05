#!/bin/bash

# API Testing Script for Swap Endpoints
# Make sure your Next.js server is running on http://localhost:3000

echo "🚀 Testing Swap API Endpoints"
echo "================================="

# You need to replace this with a real JWT token from your Supabase auth
# To get a token:
# 1. Go to http://localhost:3000/auth/login
# 2. Login with your account
# 3. Open browser dev tools -> Application -> Local Storage
# 4. Find the token in supabase.auth.token
JWT_TOKEN="YOUR_JWT_TOKEN_HERE"

if [ "$JWT_TOKEN" = "YOUR_JWT_TOKEN_HERE" ]; then
    echo "❌ Please update JWT_TOKEN in this script with a real token"
    echo "   1. Go to http://localhost:3000/auth/login"
    echo "   2. Login with your account"
    echo "   3. Open dev tools -> Application -> Local Storage"
    echo "   4. Copy the JWT token from supabase.auth.token"
    echo "   5. Replace JWT_TOKEN in this script"
    exit 1
fi

BASE_URL="http://localhost:3000"

echo ""
echo "1. 🔍 Testing GET /api/swappable-slots"
echo "   (Returns all swappable slots from other users)"
curl -X GET "$BASE_URL/api/swappable-slots" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.' || echo "Response received"

echo ""
echo "================================="
echo ""

echo "2. 📝 Testing POST /api/swap-request"
echo "   (Create a swap request - you need real slot IDs)"
echo "   Note: You'll need to replace SLOT_ID_1 and SLOT_ID_2 with real IDs"
echo ""
read -p "Enter your slot ID (mySlotId): " MY_SLOT_ID
read -p "Enter their slot ID (theirSlotId): " THEIR_SLOT_ID

if [ -n "$MY_SLOT_ID" ] && [ -n "$THEIR_SLOT_ID" ]; then
    curl -X POST "$BASE_URL/api/swap-request" \
      -H "Authorization: Bearer $JWT_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"mySlotId\": \"$MY_SLOT_ID\", \"theirSlotId\": \"$THEIR_SLOT_ID\"}" \
      | jq '.' || echo "Response received"
else
    echo "Skipping swap-request test (no slot IDs provided)"
fi

echo ""
echo "================================="
echo ""

echo "3. ✅ Testing POST /api/swap-response/[requestId]"
echo "   (Accept or reject a swap request)"
echo "   Note: You'll need a real swap request ID"
echo ""
read -p "Enter swap request ID (or press Enter to skip): " SWAP_REQUEST_ID
read -p "Accept the swap? (true/false): " ACCEPTED

if [ -n "$SWAP_REQUEST_ID" ] && [ -n "$ACCEPTED" ]; then
    curl -X POST "$BASE_URL/api/swap-response/$SWAP_REQUEST_ID" \
      -H "Authorization: Bearer $JWT_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"accepted\": $ACCEPTED}" \
      | jq '.' || echo "Response received"
else
    echo "Skipping swap-response test (no request ID provided)"
fi

echo ""
echo "================================="
echo ""

echo "🔍 Additional helpful endpoints:"
echo ""

echo "📋 GET /api/swap-requests (List your swap requests)"
curl -X GET "$BASE_URL/api/swap-requests" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.' || echo "Response received"

echo ""
echo "================================="
echo ""

echo "🧪 GET /api/test (Test connection and status)"
curl -X GET "$BASE_URL/api/test" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.' || echo "Response received"

echo ""
echo "✅ API Testing Complete!"
echo ""
echo "💡 Tips:"
echo "   - Make sure you're logged in to get a valid JWT token"
echo "   - Create some events and mark them as SWAPPABLE to test properly"
echo "   - Use the /api/test endpoint to verify your setup"
