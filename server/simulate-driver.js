const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

// REPLACE THIS with a real Order ID from your DB if you want to see it update in the UI
const orderId = process.argv[2] || "test_order_12345";

console.log(`🚀 Starting Driver Simulation for Order: ${orderId}`);

// Path from Point A to Point B (Madurai city area)
const path = [
    { lat: 9.9252, lng: 78.1198 },
    { lat: 9.9265, lng: 78.1210 },
    { lat: 9.9280, lng: 78.1225 },
    { lat: 9.9300, lng: 78.1240 },
    { lat: 9.9320, lng: 78.1260 },
    { lat: 9.9340, lng: 78.1280 },
    { lat: 9.9360, lng: 78.1300 },
    { lat: 9.9380, lng: 78.1320 },
    { lat: 9.9400, lng: 78.1340 },
    { lat: 9.9420, lng: 78.1360 }
];

let currentIndex = 0;

socket.on("connect", () => {
    console.log("✅ Connected to Server");

    // Join the room
    socket.emit("join_order_room", orderId);

    // Start moving
    const interval = setInterval(() => {
        const coords = path[currentIndex];

        console.log(`📍 Sending Location: [${coords.lat}, ${coords.lng}] (${currentIndex + 1}/${path.length})`);

        socket.emit("send_location", {
            orderId: orderId,
            lat: coords.lat,
            lng: coords.lng
        });

        currentIndex++;

        if (currentIndex >= path.length) {
            console.log("🏁 Destination Reached!");
            clearInterval(interval);
            setTimeout(() => {
                console.log("👋 Disconnecting...");
                socket.disconnect();
                process.exit(0);
            }, 2000);
        }
    }, 3000); // Update every 3 seconds
});

socket.on("connect_error", (err) => {
    console.error("❌ Connection Error:", err.message);
});

socket.on("disconnect", () => {
    console.log("❌ Disconnected from Server");
});
