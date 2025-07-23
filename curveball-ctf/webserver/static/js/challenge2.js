/**
 * Challenge 2: Zertifikatsanalyse
 * JavaScript für Flag-Validierung und interaktive Elemente
 */

// Globale Variablen
let attemptCount = 0;
const maxAttempts = 10;

// Korrekte Flags (verschiedene Varianten für Flexibilität)
const correctFlags = [
    'FLAG{certs_reveal_secrets_in_san}',
    'flag{certs_reveal_secrets_in_san}',
    'FLAG{CERTS_REVEAL_SECRETS_IN_SAN}',
    'flag{CERTS_REVEAL_SECRETS_IN_SAN}',
    'FLAG{Certs_Reveal_Secrets_In_SAN}'
];

/**
 * Prüft die eingegebene Flag
 */
function checkFlag() {
    const flagInput = document.getElementById('flagInput');
    const flagResult = document.getElementById('flagResult');
    const userFlag = flagInput.value.trim();
    
    attemptCount++;
    updateAttemptCounter();
    
    // Leere Eingabe prüfen
    if (!userFlag) {
        showResult('Bitte geben Sie eine Flag ein!', 'error');
        return;
    }
    
    // Flag-Format prüfen
    if (!userFlag.startsWith('FLAG{') || !userFlag.endsWith('}')) {
        showResult('❌ Falsches Flag-Format! Verwenden Sie: FLAG{...}', 'error');
        return;
    }
    
    // Flag-Validierung
    const isCorrect = correctFlags.some(flag => 
        flag.toLowerCase() === userFlag.toLowerCase()
    );
    
    if (isCorrect) {
        showSuccess();
    } else {
        showResult(`❌ Falsche Flag! (Versuch ${attemptCount}/${maxAttempts})`, 'error');
        
        // Hints nach mehreren Versuchen
        if (attemptCount >= 3) {
            showHint();
        }
        
        if (attemptCount >= maxAttempts) {
            showMaxAttemptsReached();
        }
    }
}

/**
 * Zeigt Erfolg an
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
    
    // Eingabefeld deaktivieren
    document.getElementById('flagInput').disabled = true;
    
    // Konfetti-Effekt
    createConfetti();
    
    // Erfolg im Local Storage speichern
    localStorage.setItem('challenge2_completed', 'true');
    localStorage.setItem('challenge2_completion_time', new Date().toISOString());
}

/**
 * Zeigt Fehlermeldungen und Ergebnisse an
 */
function showResult(message, type) {
    const flagResult = document.getElementById('flagResult');
    const className = type === 'error' ? 'error-message' : 'info-message';
    
    flagResult.innerHTML = `<div class="${className}">${message}</div>`;
    
    // Automatisch ausblenden nach 5 Sekunden bei Fehlern
    if (type === 'error') {
        setTimeout(() => {
            if (flagResult.innerHTML.includes(message)) {
                flagResult.innerHTML = '';
            }
        }, 5000);
    }
}

/**
 * Zeigt progressive Hints
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
    
    // Hint unterhalb der Fehlermeldung anzeigen
    setTimeout(() => {
        const currentContent = document.getElementById('flagResult').innerHTML;
        document.getElementById('flagResult').innerHTML = currentContent + 
            `<div class="hint-message">${hint}</div>`;
    }, 2000);
}

/**
 * Zeigt Meldung bei maximalen Versuchen
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
 * Aktualisiert den Versuchszähler
 */
function updateAttemptCounter() {
    document.getElementById('attemptCount').textContent = attemptCount;
}

/**
 * Setzt die Challenge zurück
 */
function resetChallenge() {
    attemptCount = 0;
    updateAttemptCounter();
    document.getElementById('flagInput').value = '';
    document.getElementById('flagInput').disabled = false;
    document.getElementById('flagResult').innerHTML = '';
}

/**
 * Erstellt Konfetti-Effekt bei Erfolg
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
            
            // Entfernen nach Animation
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 50);
    }
}

/**
 * Generiert zufällige Farben für Konfetti
 */
function getRandomColor() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Enter-Taste für Flag-Eingabe
 */
document.addEventListener('DOMContentLoaded', function() {
    const flagInput = document.getElementById('flagInput');
    
    flagInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkFlag();
        }
    });
    
    // Lade vorherigen Fortschritt
    loadProgress();
});

/**
 * Lädt vorherigen Fortschritt
 */
function loadProgress() {
    const completed = localStorage.getItem('challenge2_completed');
    if (completed === 'true') {
        showResult('✅ Diese Challenge wurde bereits erfolgreich abgeschlossen!', 'success');
        document.getElementById('flagInput').disabled = true;
    }
}

/**
 * Kopiert OpenSSL-Befehle in die Zwischenablage
 */
function copyCommand(command) {
    navigator.clipboard.writeText(command).then(() => {
        // Kurze Bestätigung anzeigen
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

// Füge Click-Handler für Code-Blöcke hinzu
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
