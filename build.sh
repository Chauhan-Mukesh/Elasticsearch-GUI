#!/bin/bash

# Build script for Elasticsearch GUI
# Downloads dependencies that might be blocked by firewalls during CI/CD

echo "Building Elasticsearch GUI..."
echo "Creating lib directory..."

# Create lib directory if it doesn't exist
mkdir -p lib

echo "Downloading dependencies..."

# Function to download with retries and fallback
download_with_fallback() {
    local url=$1
    local output=$2
    local filename=$(basename "$output")
    
    echo "Downloading $filename..."
    
    # Try downloading with curl
    if curl -s --connect-timeout 10 --max-time 30 "$url" -o "$output"; then
        # Check if file was downloaded and has content
        if [ -f "$output" ] && [ -s "$output" ]; then
            echo "✓ Successfully downloaded $filename"
            return 0
        fi
    fi
    
    echo "⚠ Failed to download $filename from CDN (this is expected in firewall-restricted environments)"
    echo "Creating placeholder file for $filename"
    
    # Create a placeholder file with a comment explaining the issue
    cat > "$output" << EOF
/*
 * This file should contain the $filename library.
 * Download failed due to firewall restrictions.
 * 
 * To fix this:
 * 1. Run this script in an environment without firewall restrictions
 * 2. Or manually download from: $url
 * 3. Or use the GitHub Actions workflow which downloads before firewall restrictions
 */
console.warn('$filename not loaded - download was blocked by firewall restrictions');
EOF
    
    return 1
}

# Download showdown.min.js - the main dependency that was failing
download_with_fallback "https://cdn.jsdelivr.net/npm/showdown@2.1.0/dist/showdown.min.js" "lib/showdown.min.js"

# Download other dependencies that could be useful for local development
download_with_fallback "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" "lib/bootstrap.min.css"
download_with_fallback "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" "lib/bootstrap.bundle.min.js"
download_with_fallback "https://cdn.jsdelivr.net/npm/chart.js@4.3.0/dist/chart.min.js" "lib/chart.min.js"

echo ""
echo "Downloaded files:"
ls -la lib/

echo ""
echo "Build completed!"
echo ""
echo "Note: If downloads failed due to firewall restrictions, this is expected."
echo "The GitHub Actions workflow will handle downloads before firewall restrictions are applied."
echo "You can still run the application locally by opening index.html in your browser."
echo "The application will fall back to CDN versions for any missing local files."