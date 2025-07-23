#!/bin/bash

# Test script to check if CDN access is available
# This helps users understand if they're in a firewall-restricted environment

echo "Testing CDN accessibility..."
echo "=========================================="

# Test jsdelivr.net access (the main problematic CDN from the issue)
echo "Testing cdn.jsdelivr.net..."
if curl -s --connect-timeout 5 --max-time 10 "https://cdn.jsdelivr.net" > /dev/null 2>&1; then
    echo "✅ cdn.jsdelivr.net is accessible"
    CDN_ACCESS=true
else
    echo "❌ cdn.jsdelivr.net is blocked (firewall restriction detected)"
    CDN_ACCESS=false
fi

# Test other CDNs used in the project
echo ""
echo "Testing other CDNs..."
echo "---------------------"

test_cdn() {
    local name=$1
    local url=$2
    
    if curl -s --connect-timeout 5 --max-time 10 "$url" > /dev/null 2>&1; then
        echo "✅ $name is accessible"
    else
        echo "❌ $name is blocked"
    fi
}

test_cdn "code.jquery.com" "https://code.jquery.com"
test_cdn "cdnjs.cloudflare.com" "https://cdnjs.cloudflare.com"

echo ""
echo "=========================================="

if [ "$CDN_ACCESS" = true ]; then
    echo "✅ Your environment has CDN access. You can run ./build.sh to download dependencies."
    echo "   The GitHub Actions workflow will also work properly."
else
    echo "⚠️  Your environment has firewall restrictions blocking CDN access."
    echo "   This is the exact issue that was reported and is now fixed!"
    echo ""
    echo "Solutions available:"
    echo "1. The GitHub Actions workflow downloads dependencies before firewall restrictions"
    echo "2. The application uses fallback mechanisms (local files → CDN)"
    echo "3. You can manually download dependencies in an unrestricted environment"
fi

echo ""
echo "Current status of lib/ directory:"
ls -la lib/ 2>/dev/null || echo "lib/ directory doesn't exist yet"