// Basic functionality for the Curveball CTF main page
// All tutorial and interactive challenge functionality has been removed

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Curveball CTF Main Page loaded');

});

// Easter eggs
let konami = [];
const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA

document.addEventListener('keydown', function(e) {
    konami.push(e.keyCode);
    if (konami.length > konamiCode.length) {
        konami = konami.slice(-konamiCode.length);
    }
    
    if (konami.length === konamiCode.length && 
        konami.every((code, index) => code === konamiCode[index])) {
        
        // Konami Code activated!
        alert("🎮 Konami Code aktiviert! Sie haben den geheimen Code gefunden!");

        // Reset konami sequence
        konami = [];
        
        // Add some visual effects
        document.body.style.animation = 'none';
        document.body.style.background = 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff, #ff0000)';
        document.body.style.backgroundSize = '400% 400%';
        document.body.style.animation = 'gradientShift 2s ease infinite';
        
        setTimeout(() => {
            document.body.style.background = '';
            document.body.style.animation = '';
        }, 5000);
    }
});
