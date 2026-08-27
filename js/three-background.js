// Initialize Vanta.js 3D Background
document.addEventListener('DOMContentLoaded', () => {
    try {
        VANTA.NET({
            el: "#vanta-bg",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x6c5ce7, // Primary brand color
            backgroundColor: 0xf0f1a, // Dark background
            points: 12.00,
            maxDistance: 22.00,
            spacing: 18.00
        });
    } catch (e) {
        console.error("Vanta.js initialization failed: ", e);
    }
});
