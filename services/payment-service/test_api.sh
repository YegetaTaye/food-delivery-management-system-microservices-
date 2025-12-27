#!/bin/bash

# Test script for Payment Service API

BASE_URL="http://localhost:8003"

echo "=== Testing Payment Service API ==="
echo ""

# Test 1: Health Check
echo "1. Testing Health Check..."
curl -s "$BASE_URL/health" | jq .
echo ""
echo ""

# Test 2: Root Endpoint
echo "2. Testing Root Endpoint..."
curl -s "$BASE_URL/" | jq .
echo ""
echo ""

# Test 3: Create Payment
echo "3. Creating a payment..."
PAYMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/payments" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order-123",
    "amount": 100.50,
    "payment_method": "SIMULATED"
  }')

echo "$PAYMENT_RESPONSE" | jq .
PAYMENT_ID=$(echo "$PAYMENT_RESPONSE" | jq -r '.payment_id')
echo ""
echo ""

# Test 4: Get Payment by ID
if [ "$PAYMENT_ID" != "null" ] && [ -n "$PAYMENT_ID" ]; then
  echo "4. Getting payment by ID: $PAYMENT_ID"
  curl -s "$BASE_URL/payments/$PAYMENT_ID" | jq .
  echo ""
  echo ""
fi

# Test 5: Create multiple payments
echo "5. Creating multiple payments to test simulation..."
for i in {1..5}; do
  echo "Payment $i:"
  curl -s -X POST "$BASE_URL/payments" \
    -H "Content-Type: application/json" \
    -d "{
      \"order_id\": \"order-test-$i\",
      \"amount\": $((50 + i * 10)),
      \"payment_method\": \"SIMULATED\"
    }" | jq '.status'
done
echo ""

# Test 6: Test different payment methods
echo "6. Testing different payment methods..."
for method in "CARD" "CASH" "SIMULATED"; do
  echo "Method: $method"
  curl -s -X POST "$BASE_URL/payments" \
    -H "Content-Type: application/json" \
    -d "{
      \"order_id\": \"order-method-test\",
      \"amount\": 75.00,
      \"payment_method\": \"$method\"
    }" | jq '{payment_id, status, method}'
  echo ""
done

# Test 7: Test invalid payment ID
echo "7. Testing invalid payment ID (should return 404)..."
curl -s "$BASE_URL/payments/invalid-id" | jq .
echo ""

echo ""
echo "=== Tests Complete ==="
echo "Visit $BASE_URL/docs for Swagger UI"
