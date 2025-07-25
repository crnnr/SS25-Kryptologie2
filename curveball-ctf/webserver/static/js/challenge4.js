/**
 * Challenge 4: Curve Parameters & Signature Validation
 * JavaScript for ECC parameter manipulation and signature testing
 */

// Global variables
let attemptCount = 0;
const maxAttempts = 8;
let currentParameters = {};
let originalParameters = {};

// Standard P-256 parameters
const STANDARD_P256 = {
    p: '0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff',
    a: '0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc',
    b: '0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b',
    gx: '0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296',
    gy: '0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5',
    n: '0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551'
};

// Correct flags for different manipulation methods (both formats supported)
const correctFlags = [
    'FLAG{curve_parameter_manipulation_signature_bypass}',
    'flag{curve_parameter_manipulation_signature_bypass}',
    'FLAG{ecc_generator_spoofing_validation_defeated}',
    'flag{ecc_generator_spoofing_validation_defeated}',
    'FLAG{curveball_mathematical_exploitation_complete}',
    'flag{curveball_mathematical_exploitation_complete}',
    'FLAG{signature_validation_compromised_by_parameters}',
    'flag{signature_validation_compromised_by_parameters}',
    'FLAG{microsoft_cryptoapi_vulnerability_exploited}',
    'flag{microsoft_cryptoapi_vulnerability_exploited}'
];

/**
 * Initialization when page loads
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeParameters();
    setupEventListeners();
    loadProgress();
});

/**
 * Initializes the parameter display
 */
function initializeParameters() {
    currentParameters = { ...STANDARD_P256 };
    originalParameters = { ...STANDARD_P256 };
    updateParameterDisplay();
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
    // Enter key for flag input
    const flagInput = document.getElementById('flagInput');
    if (flagInput) {
        flagInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkFlag();
            }
        });
    }

    // Manipulation method change
    const methodRadios = document.querySelectorAll('input[name="method"]');
    methodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateManipulationUI();
        });
    });

    // Parameter input validation
    const hexInputs = document.querySelectorAll('.hex-input, .param-input');
    hexInputs.forEach(input => {
        input.addEventListener('input', function() {
            validateHexInput(this);
        });
    });
}

/**
 * Updates the parameter display
 */
function updateParameterDisplay() {
    document.getElementById('currentP').textContent = currentParameters.p;
    document.getElementById('currentA').textContent = currentParameters.a;
    document.getElementById('currentB').textContent = currentParameters.b;
    document.getElementById('currentGx').textContent = currentParameters.gx;
    document.getElementById('currentGy').textContent = currentParameters.gy;
    document.getElementById('currentN').textContent = currentParameters.n;
}

/**
 * Updates the manipulation UI based on selected method
 */
function updateManipulationUI() {
    const selectedMethod = document.querySelector('input[name="method"]:checked').value;
    const resultDiv = document.getElementById('manipulationResult');
    
    let helpText = '';
    
    switch (selectedMethod) {
        case 'generator':
            helpText = '🎯 Sie manipulieren den Generator-Punkt G. Dies ist die klassische Curveball-Methode.';
            break;
        case 'curve':
            helpText = '📐 Sie ändern die Kurvenkoeffizienten a und b. Dies verändert die Kurvengleichung selbst.';
            break;
        case 'order':
            helpText = '🔢 Sie manipulieren die Gruppenordnung n. Dies beeinflusst die Modulo-Arithmetik.';
            break;
        case 'custom':
            helpText = '🎨 Vollständige Kontrolle über alle Parameter. Für Experten empfohlen.';
            break;
    }
    
    resultDiv.innerHTML = `<div class="method-help">${helpText}</div>`;
}

/**
 * Calculates manipulated parameters
 */
function calculateManipulation() {
    const method = document.querySelector('input[name="method"]:checked').value;
    const targetR = document.getElementById('targetR').value;
    const targetS = document.getElementById('targetS').value;
    const resultDiv = document.getElementById('manipulationResult');
    
    if (!targetR || !targetS) {
        showResult('❌ Bitte geben Sie Ziel-r und Ziel-s Werte ein!', 'error', resultDiv);
        return;
    }
    
    if (!isValidHex(targetR) || !isValidHex(targetS)) {
        showResult('❌ Ungültige Hex-Werte! Verwenden Sie das Format 0x...', 'error', resultDiv);
        return;
    }
    
    // Show animation
    resultDiv.innerHTML = '<div class="calculating">🔄 Berechne manipulierte Parameter...</div>';
    
    setTimeout(() => {
        const manipulatedParams = performManipulation(method, targetR, targetS);
        displayManipulationResult(manipulatedParams, resultDiv);
    }, 1500);
}

/**
 * Performs the actual parameter manipulation
 */
function performManipulation(method, targetR, targetS) {
    let manipulatedParams = { ...currentParameters };
    let manipulationDetails = {};
    
    switch (method) {
        case 'generator':
            manipulatedParams = manipulateGenerator(targetR, targetS);
            manipulationDetails = {
                method: 'Generator-Punkt Manipulation',
                description: 'Der Generator-Punkt wurde so gewählt, dass die Ziel-Signatur gültig wird',
                key_change: 'Gx und Gy wurden manipuliert'
            };
            break;
            
        case 'curve':
            manipulatedParams = manipulateCurve(targetR, targetS);
            manipulationDetails = {
                method: 'Kurvenparameter Manipulation',
                description: 'Die Kurvenkoeffizienten wurden angepasst',
                key_change: 'Parameter a und b wurden verändert'
            };
            break;
            
        case 'order':
            manipulatedParams = manipulateOrder(targetR, targetS);
            manipulationDetails = {
                method: 'Ordnungs-Manipulation',
                description: 'Die Gruppenordnung wurde modifiziert',
                key_change: 'Parameter n wurde angepasst'
            };
            break;
            
        case 'custom':
            manipulatedParams = manipulateCustom(targetR, targetS);
            manipulationDetails = {
                method: 'Benutzerdefinierte Manipulation',
                description: 'Mehrere Parameter wurden strategisch verändert',
                key_change: 'Kombinierte Manipulation aller Parameter'
            };
            break;
    }
    
    currentParameters = manipulatedParams;
    updateParameterDisplay();
    
    return {
        parameters: manipulatedParams,
        details: manipulationDetails,
        targetSignature: { r: targetR, s: targetS },
        exploitPotential: calculateExploitPotential(manipulatedParams)
    };
}

/**
 * Manipulates the generator point
 */
function manipulateGenerator(targetR, targetS) {
    const params = { ...currentParameters };
    
    // Calculate a "rogue" generator based on target signature
    const rogueGx = manipulateHexValue(params.gx, targetR);
    const rogueGy = manipulateHexValue(params.gy, targetS);
    
    params.gx = rogueGx;
    params.gy = rogueGy;
    
    return params;
}

/**
 * Manipulates the curve parameters
 */
function manipulateCurve(targetR, targetS) {
    const params = { ...currentParameters };
    
    // Modify a and b so that the target point lies on the new curve
    params.a = manipulateHexValue(params.a, targetR);
    params.b = manipulateHexValue(params.b, targetS);
    
    return params;
}

/**
 * Manipulates the group order
 */
function manipulateOrder(targetR, targetS) {
    const params = { ...currentParameters };
    
    // Change the order strategically
    params.n = manipulateHexValue(params.n, targetR);
    
    return params;
}

/**
 * Custom manipulation
 */
function manipulateCustom(targetR, targetS) {
    const params = { ...currentParameters };
    
    // Combined manipulation for maximum control
    params.gx = manipulateHexValue(params.gx, targetR);
    params.gy = manipulateHexValue(params.gy, targetS);
    params.a = manipulateHexValue(params.a, targetR.substring(0, 10));
    params.n = manipulateHexValue(params.n, targetS.substring(0, 10));
    
    return params;
}

/**
 * Manipulates a hex value based on a target value
 */
function manipulateHexValue(original, target) {
    // Remove 0x prefix
    let origHex = original.replace('0x', '');
    let targetHex = target.replace('0x', '');
    
    // Use parts of the target value for manipulation
    const targetPart = targetHex.padStart(8, '0').substring(0, 8);
    const manipulated = origHex.substring(0, origHex.length - 8) + targetPart;
    
    return '0x' + manipulated;
}

/**
 * Calculates the exploit potential
 */
function calculateExploitPotential(params) {
    let score = 0;
    let factors = [];
    
    // Generator point change
    if (params.gx !== originalParameters.gx || params.gy !== originalParameters.gy) {
        score += 40;
        factors.push('Generator-Punkt manipuliert');
    }
    
    // Curve parameter change
    if (params.a !== originalParameters.a || params.b !== originalParameters.b) {
        score += 30;
        factors.push('Kurvenparameter verändert');
    }
    
    // Order change
    if (params.n !== originalParameters.n) {
        score += 20;
        factors.push('Gruppenordnung modifiziert');
    }
    
    // Prime change (very dangerous)
    if (params.p !== originalParameters.p) {
        score += 50;
        factors.push('Primzahl manipuliert (extrem gefährlich!)');
    }
    
    return {
        score: Math.min(score, 100),
        factors: factors,
        level: score >= 70 ? 'Hoch' : score >= 40 ? 'Mittel' : 'Niedrig'
    };
}

/**
 * Shows the manipulation result
 */
function displayManipulationResult(result, container) {
    const html = `
        <div class="manipulation-result">
            <h5>⚡ ${result.details.method}</h5>
            <p class="description">${result.details.description}</p>
            
            <div class="manipulation-summary">
                <div class="change-info">
                    <strong>Hauptänderung:</strong> ${result.details.key_change}
                </div>
                <div class="exploit-potential">
                    <strong>Exploit-Potenzial:</strong> 
                    <span class="potential-${result.exploitPotential.level.toLowerCase()}">
                        ${result.exploitPotential.level} (${result.exploitPotential.score}/100)
                    </span>
                </div>
            </div>
            
            <div class="exploit-factors">
                <h6>🎯 Manipulationsfaktoren:</h6>
                <ul>
                    ${result.exploitPotential.factors.map(factor => `<li>${factor}</li>`).join('')}
                </ul>
            </div>
            
            <div class="target-signature-info">
                <h6>📋 Ziel-Signatur:</h6>
                <div class="signature-values">
                    <div class="sig-value">r: <code>${result.targetSignature.r}</code></div>
                    <div class="sig-value">s: <code>${result.targetSignature.s}</code></div>
                </div>
            </div>
            
            <div class="next-steps">
                <h6>🚀 Nächste Schritte:</h6>
                <ol>
                    <li>Kopieren Sie die manipulierten Parameter</li>
                    <li>Verwenden Sie sie im Signatur-Tester</li>
                    <li>Testen Sie gegen signature_validator.py</li>
                    <li>Bei Erfolg erhalten Sie die Flag!</li>
                </ol>
            </div>
            
            <div class="action-buttons">
                <button onclick="copyParametersToTester()" class="tool-btn primary">
                    📋 Parameter zum Tester kopieren
                </button>
                <button onclick="exportParametersAsJSON()" class="tool-btn">
                    📄 Als JSON exportieren
                </button>
                <button onclick="fillManualInputs()" class="tool-btn secondary">
                    ✏️ Manuelle Eingabe ausfüllen
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Success animation if high exploit potential
    if (result.exploitPotential.score >= 70) {
        container.style.border = '2px solid #10b981';
        setTimeout(() => {
            container.style.border = '';
        }, 3000);
    }
}

/**
 * Copies parameters to signature tester
 */
function copyParametersToTester() {
    // Fill tester input fields with current parameters
    document.getElementById('testPublicKey').value = '04' + currentParameters.gx.replace('0x', '') + currentParameters.gy.replace('0x', '');
    
    showNotification('📋 Parameter zum Tester kopiert!');
}

/**
 * Exports parameters as JSON
 */
function exportParametersAsJSON() {
    const exportData = {
        curveball_exploit: {
            method: 'Parameter Manipulation',
            original_parameters: originalParameters,
            manipulated_parameters: currentParameters,
            timestamp: new Date().toISOString()
        }
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    downloadTextFile(jsonString, 'manipulated_parameters.json', 'application/json');
    
    showNotification('📄 Parameter als JSON exportiert!');
}

/**
 * Fills manual input fields
 */
function fillManualInputs() {
    document.getElementById('manualP').value = currentParameters.p;
    document.getElementById('manualA').value = currentParameters.a;
    document.getElementById('manualB').value = currentParameters.b;
    document.getElementById('manualN').value = currentParameters.n;
    document.getElementById('manualGx').value = currentParameters.gx;
    document.getElementById('manualGy').value = currentParameters.gy;
    
    showNotification('✏️ Manuelle Eingabe ausgefüllt!');
}

/**
 * Tests a signature with current parameters
 */
function testSignature() {
    const message = document.getElementById('testMessage').value;
    const publicKey = document.getElementById('testPublicKey').value;
    const signatureR = document.getElementById('testSignatureR').value;
    const signatureS = document.getElementById('testSignatureS').value;
    const resultDiv = document.getElementById('testResult');
    
    if (!message || !publicKey || !signatureR || !signatureS) {
        showResult('❌ Bitte füllen Sie alle Felder aus!', 'error', resultDiv);
        return;
    }
    
    if (!isValidHex(publicKey) || !isValidHex(signatureR) || !isValidHex(signatureS)) {
        showResult('❌ Ungültige Hex-Werte!', 'error', resultDiv);
        return;
    }
    
    // Simulate signature test
    resultDiv.innerHTML = '<div class="testing">🧪 Teste Signatur mit manipulierten Parametern...</div>';
    
    setTimeout(() => {
        const testResult = simulateSignatureValidation(message, publicKey, signatureR, signatureS);
        displayTestResult(testResult, resultDiv);
    }, 2000);
}

/**
 * Simulates signature validation
 */
function simulateSignatureValidation(message, publicKey, signatureR, signatureS) {
    // Check if parameters were manipulated
    const isManipulated = JSON.stringify(currentParameters) !== JSON.stringify(originalParameters);
    
    // Simulate different validation steps
    const validationSteps = [
        { step: 'Message Hash', status: 'success', details: 'SHA-256 Hash berechnet' },
        { step: 'Public Key Check', status: 'success', details: 'Public Key Format validiert' },
        { step: 'Signature Format', status: 'success', details: 'Signatur-Format korrekt' },
        { step: 'Parameter Validation', status: isManipulated ? 'warning' : 'success', 
          details: isManipulated ? 'MANIPULIERTE Parameter verwendet!' : 'Standard-Parameter' },
        { step: 'Mathematical Verification', status: isManipulated ? 'exploit' : 'failed', 
          details: isManipulated ? 'Manipulation erfolgreich - Signatur akzeptiert!' : 'Signatur ungültig' }
    ];
    
    const success = isManipulated;
    
    return {
        success: success,
        steps: validationSteps,
        exploitDetected: isManipulated,
        message: success ? 
            '🎯 EXPLOIT ERFOLGREICH! Die manipulierten Parameter haben die Validierung umgangen!' :
            '❌ Validierung fehlgeschlagen. Versuchen Sie andere Parameter.',
        flagHint: success ? 'Das signature_validator.py Skript würde jetzt die Flag ausgeben!' : null
    };
}

/**
 * Shows the test result
 */
function displayTestResult(result, container) {
    let stepsHtml = result.steps.map(step => {
        const statusClass = step.status === 'success' ? 'success' : 
                           step.status === 'warning' ? 'warning' :
                           step.status === 'exploit' ? 'exploit' : 'error';
        
        const statusIcon = step.status === 'success' ? '✅' : 
                          step.status === 'warning' ? '⚠️' :
                          step.status === 'exploit' ? '🎯' : '❌';
        
        return `
            <div class="validation-step ${statusClass}">
                <span class="step-icon">${statusIcon}</span>
                <span class="step-name">${step.step}:</span>
                <span class="step-details">${step.details}</span>
            </div>
        `;
    }).join('');
    
    const html = `
        <div class="test-result ${result.success ? 'success' : 'failure'}">
            <h5>${result.success ? '🎉 Test erfolgreich!' : '❌ Test fehlgeschlagen'}</h5>
            <p class="result-message">${result.message}</p>
            
            <div class="validation-steps">
                <h6>🔍 Validierungsschritte:</h6>
                ${stepsHtml}
            </div>
            
            ${result.exploitDetected ? `
                <div class="exploit-summary">
                    <h6>⚡ Exploit-Details:</h6>
                    <p>Die Signatur wurde mit manipulierten ECC-Parametern validiert. In einem echten System würde dies bedeuten, dass eine ungültige Signatur als gültig akzeptiert wird!</p>
                </div>
            ` : ''}
            
            ${result.flagHint ? `
                <div class="flag-hint">
                    <h6>🚩 Flag-Hinweis:</h6>
                    <p>${result.flagHint}</p>
                </div>
            ` : ''}
            
            <div class="next-action">
                ${result.success ? 
                    '<button onclick="proceedToValidation()" class="tool-btn primary">🧪 Mit signature_validator.py testen</button>' :
                    '<button onclick="adjustParameters()" class="tool-btn">🔧 Parameter anpassen</button>'
                }
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Loads data from downloaded files
 */
function loadFromFiles() {
    showNotification('📁 Implementierung: Laden Sie die Challenge-Dateien herunter und verwenden Sie die darin enthaltenen Daten.');
}

/**
 * Validates manual parameter inputs
 */
function validateManualParameters() {
    const params = {
        p: document.getElementById('manualP').value,
        a: document.getElementById('manualA').value,
        b: document.getElementById('manualB').value,
        n: document.getElementById('manualN').value,
        gx: document.getElementById('manualGx').value,
        gy: document.getElementById('manualGy').value
    };
    
    const resultDiv = document.getElementById('manualResult');
    
    // Validate all parameters
    const validation = validateParameterSet(params);
    
    if (validation.valid) {
        currentParameters = params;
        updateParameterDisplay();
        showResult('✅ Parameter erfolgreich validiert und übernommen!', 'success', resultDiv);
    } else {
        showResult(`❌ Validierung fehlgeschlagen: ${validation.errors.join(', ')}`, 'error', resultDiv);
    }
}

/**
 * Validates a parameter set
 */
function validateParameterSet(params) {
    const errors = [];
    
    for (const [key, value] of Object.entries(params)) {
        if (!value) {
            errors.push(`${key} ist leer`);
        } else if (!isValidHex(value)) {
            errors.push(`${key} ist kein gültiger Hex-Wert`);
        }
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Exports current parameters
 */
function exportParameters() {
    const paramString = Object.entries(currentParameters)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    
    downloadTextFile(paramString, 'ecc_parameters.txt', 'text/plain');
    showNotification('📄 Parameter exportiert!');
}

/**
 * Resets parameters
 */
function resetParameters() {
    currentParameters = { ...originalParameters };
    updateParameterDisplay();
    
    // Also clear manual input fields
    ['manualP', 'manualA', 'manualB', 'manualN', 'manualGx', 'manualGy'].forEach(id => {
        document.getElementById(id).value = '';
    });
    
    document.getElementById('manualResult').innerHTML = '';
    showNotification('🔄 Parameter zurückgesetzt!');
}

/**
 * Checks the entered flag
 */
function checkFlag() {
    const flagInput = document.getElementById('flagInput');
    const flagResult = document.getElementById('flagResult');
    const userFlag = flagInput.value.trim();
    
    attemptCount++;
    updateAttemptCounter();
    
    if (!userFlag) {
        showResult('Bitte geben Sie eine Flag ein!', 'error', flagResult);
        return;
    }
    
    if (
        !(userFlag.startsWith('FLAG{') || userFlag.startsWith('flag{')) ||
        !userFlag.endsWith('}')
    ) {
        showResult('❌ Falsches Flag-Format! Verwenden Sie: FLAG{...} oder flag{...}', 'error', flagResult);
        return;
    }
    
    const isCorrect = correctFlags.some(flag => 
        flag.toLowerCase() === userFlag.toLowerCase()
    );
    
    if (isCorrect) {
        showFinalSuccess(flagResult);
    } else {
        showResult(`❌ Falsche Flag! (Versuch ${attemptCount}/${maxAttempts})`, 'error', flagResult);
        
        if (attemptCount >= 3) {
            showParameterHint(flagResult);
        }
        
        if (attemptCount >= maxAttempts) {
            showMaxAttemptsReached(flagResult);
        }
    }
}

/**
 * Shows final success
 */
function showFinalSuccess(container) {
    const html = `
        <div class="success-message final-success">
            🎉 <strong>CHALLENGE 4 ABGESCHLOSSEN!</strong>
            <div class="success-details">
                <p>🏆 Herzlichen Glückwunsch! Sie haben die komplexeste Challenge gemeistert und das Herzstück der Curveball-Schwachstelle verstanden!</p>
                
                <div class="mastery-summary">
                    <h6>🎓 Sie haben gemeistert:</h6>
                    <ul>
                        <li>✅ ECC-Mathematik und Signaturvalidierung</li>
                        <li>✅ Kurvenparameter</li>
                        <li>✅ Generator-Punkt-Spoofing</li>
                        <li>✅ Die mathematischen Grundlagen von CVE-2020-0601</li>
                        <li>✅ Praktische Anwendung von Kryptographie-Schwachstellen</li>
                    </ul>
                </div>
                
                <div class="final-achievement">
                    <h6>🏅 Finale Errungenschaft:</h6>
                    <p><strong>Curveball-Experte!</strong> Sie verstehen jetzt, wie eine der kritischsten Kryptographie-Schwachstellen der letzten Jahre funktioniert und wie verheerend die Auswirkungen sein können.</p>
                </div>
                
                <div class="completion-stats">
                    <h6>📊 Challenge-Statistiken:</h6>
                    <p>Alle 4 Challenges erfolgreich abgeschlossen! 🎯</p>
                    <p>Sie sind jetzt ein Curveball-CTF-Champion! 🏆</p>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    createMasteryConfetti();
    
    // Save success
    localStorage.setItem('challenge4_completed', 'true');
    localStorage.setItem('curveball_master', 'true');
    localStorage.setItem('final_completion_time', new Date().toISOString());
    
    // Mark challenge as completed
    if (typeof markChallengeCompleted === 'function') {
        markChallengeCompleted(4);
    }
}

/**
 * Shows parameter hints
 */
function showParameterHint(container) {
    const hints = [
        '💡 Stellen Sie sicher, dass Sie die Parameter wirklich manipuliert haben',
        '💡 Der Generator-Punkt ist oft der Schlüssel zum Erfolg',
        '💡 Verwenden Sie die Tools zur Parameter-Generation',
        '💡 Testen Sie Ihre Parameter mit dem Signatur-Tester'
    ];
    
    const hint = hints[Math.min(attemptCount - 3, hints.length - 1)];
    
    setTimeout(() => {
        const currentContent = container.innerHTML;
        container.innerHTML = currentContent + `<div class="hint-message">${hint}</div>`;
    }, 1500);
}

/**
 * Shows maximum attempts reached
 */
function showMaxAttemptsReached(container) {
    const maxMessage = `
        <div class="max-attempts-message">
            ⚠️ <strong>Maximale Anzahl von Versuchen erreicht!</strong>
            <div class="help-content">
                <p>Tipps für Challenge 4:</p>
                <ul>
                    <li>Verwenden Sie die Parameter-Manipulations-Tools</li>
                    <li>Stellen Sie sicher, dass die Parameter wirklich verändert wurden</li>
                    <li>Testen Sie mit dem Signatur-Tester</li>
                    <li>Das signature_validator.py Skript gibt die korrekte Flag aus</li>
                </ul>
                <button onclick="resetChallenge4()" class="reset-btn">🔄 Challenge zurücksetzen</button>
            </div>
        </div>
    `;
    
    container.innerHTML = maxMessage;
}

/**
 * Updates the attempt counter
 */
function updateAttemptCounter() {
    document.getElementById('attemptCount').textContent = attemptCount;
}

/**
 * Resets Challenge 4
 */
function resetChallenge4() {
    attemptCount = 0;
    updateAttemptCounter();
    document.getElementById('flagInput').value = '';
    document.getElementById('flagResult').innerHTML = '';
    resetParameters();
}

/**
 * Creates mastery confetti effect
 */
function createMasteryConfetti() {
    for (let i = 0; i < 150; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = getRandomMasteryColor();
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.width = Math.random() * 10 + 10 + 'px';
            confetti.style.height = confetti.style.width;
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }, i * 20);
    }
}

/**
 * Generates mastery colors
 */
function getRandomMasteryColor() {
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#a78bfa', '#10b981'];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Helper functions
 */

function isValidHex(value) {
    return /^0x[0-9a-fA-F]+$/.test(value);
}

function validateHexInput(input) {
    const value = input.value;
    if (value && !isValidHex(value)) {
        input.style.borderColor = '#ef4444';
    } else {
        input.style.borderColor = '';
    }
}

function showResult(message, type, container) {
    const className = type === 'error' ? 'error-message' : 
                     type === 'success' ? 'success-message' : 'info-message';
    
    container.innerHTML = `<div class="${className}">${message}</div>`;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4ecdc4;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(78, 205, 196, 0.3);
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function downloadTextFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function loadProgress() {
    const completed = localStorage.getItem('challenge4_completed');
    if (completed === 'true') {
        const flagResult = document.getElementById('flagResult');
        if (flagResult) {
            showResult('✅ Diese Challenge wurde bereits erfolgreich abgeschlossen!', 'success', flagResult);
        }
    }
}
