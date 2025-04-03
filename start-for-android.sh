#!/bin/bash

echo "===================================================="
echo "Starting Fluxis Finance App for Android Emulator"
echo "===================================================="

# Start the application
npm run dev &
SERVER_PID=$!

echo "Server starting up..."
sleep 5

echo "===================================================="
echo "Access Information:"
echo "===================================================="
echo "1. In your Android emulator, open the browser"
echo "2. Navigate to: http://10.0.2.2:5000"
echo "3. Login with your Fluxis credentials"
echo ""
echo "Notes:"
echo "- 10.0.2.2 is a special IP that allows the emulator to"
echo "  access your computer's localhost"
echo "- Make sure your Android emulator is running before"
echo "  accessing the URL"
echo "===================================================="
echo ""
echo "Press Ctrl+C to stop the server when done"

# Wait for user to press Ctrl+C
trap "kill $SERVER_PID; echo 'Server stopped'; exit" INT
wait