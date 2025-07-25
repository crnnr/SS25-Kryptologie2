/**
 * Challenge 2: Certificate Analysis
 * JavaScript for flag validation and interactive elements
 */

// Global variables
let attemptCount = 0;
const maxAttempts = 10;

// Correct flags (various variants for flexibility)
const correctFlags = [
    'FLAG{certs_reveal_secrets_in_san}',
    'flag{certs_reveal_secrets_in_san}',
    'FLAG{CERTS_REVEAL_SECRETS_IN_SAN}',
    'flag{CERTS_REVEAL_SECRETS_IN_SAN}',
    'FLAG{Certs_Reveal_Secrets_In_SAN}',
    'flag{certs_reveal_secrets_in_san}'
];

/**
 * Checks the entered flag
 */
function checkFlag() {
    const flagInput = document.getElementById('flagInput');
    const flagResult = document.getElementById('flagResult');
    const userFlag = flagInput.value.trim();
    
    attemptCount++;
    updateAttemptCounter();
    
    // Check for empty input
    if (!userFlag) {
        showResult('Bitte geben Sie eine Flag ein!', 'error');
        return;
    }
    
    // Check flag format
    if (
        !(userFlag.startsWith('FLAG{') || userFlag.startsWith('flag{')) ||
        !userFlag.endsWith('}')
    ) {
        showResult('❌ Falsches Flag-Format! Verwenden Sie: FLAG{...} oder flag{...}', 'error');
        return;
    }
    
    // Flag validation
    const isCorrect = correctFlags.some(flag => 
        flag.toLowerCase() === userFlag.toLowerCase()
    );
    
    if (isCorrect) {
        showSuccess();
    } else {
        showResult(`❌ Falsche Flag! (Versuch ${attemptCount}/${maxAttempts})`, 'error');
        
        // Hints after multiple attempts
        if (attemptCount >= 3) {
            showHint();
        }
        
        if (attemptCount >= maxAttempts) {
            showMaxAttemptsReached();
        }
    }
}

/**
 * Shows success message
 */
function showSuccess() {
    const result = `
        <div class="success-message">
            ✅ <strong>Richtig!</strong> Sie haben die versteckte Information im Zertifikat gefunden!
            <div class="success-details">
                <p>🎯 Challenge 2 erfolgreich abgeschlossen!</p>
                <p>Sie haben gelernt, wie man X.509-Zertifikate mit OpenSSL analysiert und versteckte Informationen findet.</p>
                <div class="next-challenge">
                    <a href="/challenge3" class="success-btn">Weiter zu Challenge 3 →</a>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('flagResult').innerHTML = result;
    
    // Disable input field
    document.getElementById('flagInput').disabled = true;
    
    // Confetti effect
    createConfetti();
    
    // Save success in local storage
    localStorage.setItem('challenge2_completed', 'true');
    localStorage.setItem('challenge2_completion_time', new Date().toISOString());
    
    // Mark challenge as completed
    if (typeof markChallengeCompleted === 'function') {
        markChallengeCompleted(2);
    }
}

/**
 * Shows error messages and results
 */
function showResult(message, type) {
    const flagResult = document.getElementById('flagResult');
    const className = type === 'error' ? 'error-message' : 'info-message';
    
    flagResult.innerHTML = `<div class="${className}">${message}</div>`;
    
    // Auto-hide after 5 seconds for errors
    if (type === 'error') {
        setTimeout(() => {
            if (flagResult.innerHTML.includes(message)) {
                flagResult.innerHTML = '';
            }
        }, 5000);
    }
}

/**
 * Shows progressive hints
 */
function showHint() {
    const hints = [
        '💡 Tipp: Schauen Sie sich alle Felder des Zertifikats genau an, nicht nur die grundlegenden Informationen.',
        '💡 Tipp: X509v3 Extensions können interessante Informationen enthalten.',
        '💡 Tipp: Versuchen Sie "openssl x509 -in mystery_cert.pem -text -noout" und durchsuchen Sie die Ausgabe.',
        '💡 Tipp: Manchmal sind Flags in Subject Alternative Names oder anderen Extensions versteckt.',
        '💡 Letzter Tipp: Verwenden Sie grep, um nach "FLAG" oder "flag" in der OpenSSL-Ausgabe zu suchen.'
    ];
    
    const hintIndex = Math.min(attemptCount - 3, hints.length - 1);
    const hint = hints[hintIndex];
    
    // Show hint below error message
    setTimeout(() => {
        const currentContent = document.getElementById('flagResult').innerHTML;
        document.getElementById('flagResult').innerHTML = currentContent + 
            `<div class="hint-message">${hint}</div>`;
    }, 2000);
}

/**
 * Shows message when maximum attempts reached
 */
function showMaxAttemptsReached() {
    const maxMessage = `
        <div class="max-attempts-message">
            ⚠️ <strong>Maximale Anzahl von Versuchen erreicht!</strong>
            <div class="help-content">
                <p>Hier sind einige Tipps zur Zertifikatsanalyse:</p>
                <ul>
                    <li>Verwenden Sie: <code>openssl x509 -in mystery_cert.pem -text -noout</code></li>
                    <li>Suchen Sie in Extensions: <code>| grep -A 10 "X509v3 extensions"</code></li>
                    <li>Durchsuchen Sie nach Flags: <code>| grep -i flag</code></li>
                </ul>
                <button onclick="resetChallenge()" class="reset-btn">🔄 Challenge zurücksetzen</button>
            </div>
        </div>
    `;
    
    document.getElementById('flagResult').innerHTML = maxMessage;
}

/**
 * Updates the attempt counter
 */
function updateAttemptCounter() {
    document.getElementById('attemptCount').textContent = attemptCount;
}

/**
 * Resets the challenge
 */
function resetChallenge() {
    attemptCount = 0;
    updateAttemptCounter();
    document.getElementById('flagInput').value = '';
    document.getElementById('flagInput').disabled = false;
    document.getElementById('flagResult').innerHTML = '';
}

/**
 * Creates confetti effect on success
 */
function createConfetti() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = getRandomColor();
            confetti.style.animationDelay = Math.random() * 3 + 's';
            document.body.appendChild(confetti);
            
            // Remove after animation
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 50);
    }
}

/**
 * Generates random colors for confetti
 */
function getRandomColor() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Enter key for flag input
 */
document.addEventListener('DOMContentLoaded', function() {
    const flagInput = document.getElementById('flagInput');
    
    flagInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkFlag();
        }
    });
    
    // Load previous progress
    loadProgress();
});

/**
 * Loads previous progress
 */
function loadProgress() {
    const completed = localStorage.getItem('challenge2_completed');
    if (completed === 'true') {
        showResult('✅ Diese Challenge wurde bereits erfolgreich abgeschlossen!', 'success');
        document.getElementById('flagInput').disabled = true;
    }
}

/**
 * Copies OpenSSL commands to clipboard
 */
function copyCommand(command) {
    navigator.clipboard.writeText(command).then(() => {
        // Show brief confirmation
        const notification = document.createElement('div');
        notification.textContent = '📋 Befehl kopiert!';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4ecdc4;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-weight: bold;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    });
}

// Add click handlers for code blocks
document.addEventListener('DOMContentLoaded', function() {
    const codeBlocks = document.querySelectorAll('.code-block code');
    codeBlocks.forEach(block => {
        block.style.cursor = 'pointer';
        block.title = 'Klicken zum Kopieren';
        block.addEventListener('click', () => {
            copyCommand(block.textContent);
        });
    });
});
