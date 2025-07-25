/**
 * Challenge 3: Curveball Exploit Simulation
 * JavaScript for ECC parameter generation, certificate building and validation
 */

// Global variables
let attemptCount = 0;
const maxAttempts = 5;

// ECC curve definitions (simplified for demo)
const ECC_CURVES = {
    'P256': {
        name: 'NIST P-256',
        size: 256,
        p: '0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff',
        a: '0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc',
        b: '0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b',
        gx: '0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296',
        gy: '0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5',
        n: '0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551'
    },
    'P384': {
        name: 'NIST P-384',
        size: 384,
        p: '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000ffffffff',
        a: '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000fffffffc',
        b: '0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aef',
        gx: '0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7',
        gy: '0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f',
        n: '0xffffffffffffffffffffffffffffffffffffffffffffffffc7634d81f4372ddf581a0db248b0a77aecec196accc52973'
    },
    'P521': {
        name: 'NIST P-521',
        size: 521,
        p: '0x01ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        a: '0x01fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc',
        b: '0x0051953eb9618e1c9a1f929a21a0b68540eea2da725b99b315f3b8b489918ef109e156193951ec7e937b1652c0bd3bb1bf073573df883d2c34f1ef451fd46b503f00',
        gx: '0x00c6858e06b70404e9cd9e3ecb662395b4429c648139053fb521f828af606b4d3dbaa14b5e77efe75928fe1dc127a2ffa8de3348b3c1856a429bf97e7e31c2e5bd66',
        gy: '0x011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650',
        n: '0x01fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa51868783bf2f966b7fcc0148f709a5d03bb5c9b8899c47aebb6fb71e91386409'
    }
};

// Correct flags for different exploit methods (both formats supported)
const correctFlags = [
    'FLAG{curveball_exploit_generator_manipulation_success}',
    'flag{curveball_exploit_generator_manipulation_success}',
    'FLAG{cve_2020_0601_certificate_spoofing_complete}',
    'flag{cve_2020_0601_certificate_spoofing_complete}',
    'FLAG{ecc_parameter_manipulation_attack_successful}',
    'flag{ecc_parameter_manipulation_attack_successful}',
    'FLAG{windows_cryptoapi_bypass_achieved}',
    'flag{windows_cryptoapi_bypass_achieved}',
    'FLAG{rogue_generator_point_exploit_works}',
    'flag{rogue_generator_point_exploit_works}'
];

/**
 * Generates manipulated ECC parameters for the exploit
 */
function generateExploitParameters() {
    const curve = document.getElementById('curveSelect').value;
    const attackMode = document.getElementById('attackMode').value;
    const outputDiv = document.getElementById('generatedParameters');
    
    const curveInfo = ECC_CURVES[curve];
    
    let exploitParams = {};
    
    switch (attackMode) {
        case 'generator':
            exploitParams = generateRogueGenerator(curveInfo);
            break;
        case 'parameters':
            exploitParams = generateParameterSpoofing(curveInfo);
            break;
        case 'custom':
            exploitParams = generateCustomExploit(curveInfo);
            break;
    }
    
    displayExploitParameters(exploitParams, outputDiv);
    
    // Success animation
    outputDiv.style.opacity = '0';
    setTimeout(() => {
        outputDiv.style.opacity = '1';
    }, 100);
}

/**
 * Generates a manipulated generator point
 */
function generateRogueGenerator(curveInfo) {
    // Simulate generation of a "rogue" generator point
    const rogueGx = manipulateCoordinate(curveInfo.gx);
    const rogueGy = manipulateCoordinate(curveInfo.gy);
    
    return {
        type: 'Generator-Punkt Manipulation',
        description: 'Ersetzt den Standard-Generator mit einem kontrollierten Punkt',
        originalGenerator: {
            x: curveInfo.gx,
            y: curveInfo.gy
        },
        rogueGenerator: {
            x: rogueGx,
            y: rogueGy
        },
        curve: curveInfo.name,
        exploitNote: 'Dieser Generator ermöglicht die Kontrolle über Signatur-Validierung',
        opensslParams: generateOpenSSLParams('generator', curveInfo, rogueGx, rogueGy)
    };
}

/**
 * Generates parameter spoofing attack
 */
function generateParameterSpoofing(curveInfo) {
    const spoofedA = manipulateCoordinate(curveInfo.a);
    const spoofedB = manipulateCoordinate(curveInfo.b);
    
    return {
        type: 'Kurven-Parameter Spoofing',
        description: 'Manipuliert die Kurvenparameter a und b',
        originalParams: {
            a: curveInfo.a,
            b: curveInfo.b
        },
        spoofedParams: {
            a: spoofedA,
            b: spoofedB
        },
        curve: curveInfo.name,
        exploitNote: 'Manipulierte Parameter ändern die Kurveneigenschaften',
        opensslParams: generateOpenSSLParams('parameters', curveInfo, spoofedA, spoofedB)
    };
}

/**
 * Generates custom exploit
 */
function generateCustomExploit(curveInfo) {
    const customGx = generateRandomHex(curveInfo.size / 4);
    const customGy = generateRandomHex(curveInfo.size / 4);
    
    return {
        type: 'Benutzerdefinierter Exploit',
        description: 'Vollständig manipulierte ECC-Parameter',
        customParams: {
            generator_x: customGx,
            generator_y: customGy,
            custom_a: manipulateCoordinate(curveInfo.a),
            custom_b: manipulateCoordinate(curveInfo.b)
        },
        curve: curveInfo.name,
        exploitNote: 'Maximal kontrollierte Parameter für erweiterte Angriffe',
        opensslParams: generateOpenSSLParams('custom', curveInfo, customGx, customGy)
    };
}

/**
 * Manipulates a coordinate for the exploit
 */
function manipulateCoordinate(original) {
    // Remove 0x prefix
    let hex = original.replace('0x', '');
    
    // Change the last 8 characters for "rogue" properties
    const prefix = hex.substring(0, hex.length - 8);
    const rogueEnding = 'deadbeef'; // Recognizable "Evil" marker
    
    return '0x' + prefix + rogueEnding;
}

/**
 * Generates random hex strings
 */
function generateRandomHex(length) {
    const chars = '0123456789abcdef';
    let result = '0x';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

/**
 * Generates OpenSSL parameters for the exploit
 */
function generateOpenSSLParams(type, curveInfo, param1, param2) {
    const curveName = curveInfo.name.toLowerCase().replace(' ', '_').replace('-', '_');
    
    switch (type) {
        case 'generator':
            return {
                command: 'openssl ecparam',
                params: [
                    `-name ${curveName}`,
                    `-param_enc explicit`,
                    `-genkey`,
                    `-out rogue_key.pem`,
                    `-custom_generator "${param1},${param2}"`
                ],
                fullCommand: `openssl ecparam -name ${curveName} -param_enc explicit -genkey -out rogue_key.pem`
            };
        case 'parameters':
            return {
                command: 'openssl ecparam',
                params: [
                    `-custom_curve`,
                    `-p ${curveInfo.p}`,
                    `-a ${param1}`,
                    `-b ${param2}`,
                    `-G "${curveInfo.gx},${curveInfo.gy}"`
                ],
                fullCommand: `openssl ecparam -custom_curve -p ${curveInfo.p} -a ${param1} -b ${param2}`
            };
        default:
            return {
                command: 'openssl req',
                params: [
                    `-new`,
                    `-x509`,
                    `-key rogue_key.pem`,
                    `-out exploit_cert.pem`,
                    `-days 365`,
                    `-custom_ecc_params`
                ],
                fullCommand: `openssl req -new -x509 -key rogue_key.pem -out exploit_cert.pem -days 365`
            };
    }
}

/**
 * Displays the generated exploit parameters
 */
function displayExploitParameters(params, container) {
    let html = `
        <div class="parameter-result">
            <h5>🎯 ${params.type}</h5>
            <p class="description">${params.description}</p>
            
            <div class="parameter-details">
    `;
    
    if (params.originalGenerator) {
        html += `
            <div class="param-section">
                <h6>Standard Generator:</h6>
                <div class="param-values">
                    <div class="param-value">X: <code>${params.originalGenerator.x}</code></div>
                    <div class="param-value">Y: <code>${params.originalGenerator.y}</code></div>
                </div>
            </div>
            
            <div class="param-section exploit">
                <h6>🔥 Manipulierter Generator:</h6>
                <div class="param-values">
                    <div class="param-value">X: <code>${params.rogueGenerator.x}</code></div>
                    <div class="param-value">Y: <code>${params.rogueGenerator.y}</code></div>
                </div>
            </div>
        `;
    }
    
    if (params.opensslParams) {
        html += `
            <div class="param-section">
                <h6>OpenSSL Befehle:</h6>
                <div class="code-command" onclick="copyToClipboard('${params.opensslParams.fullCommand}')">
                    <code>${params.opensslParams.fullCommand}</code>
                    <span class="copy-hint">📋 Klicken zum Kopieren</span>
                </div>
            </div>
        `;
    }
    
    html += `
            </div>
            <div class="exploit-note">
                💡 <strong>Exploit-Hinweis:</strong> ${params.exploitNote}
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Creates a manipulated certificate
 */
function buildExploitCertificate() {
    const subjectName = document.getElementById('subjectName').value || 'CN=evil.example.com,O=Evil Corp';
    const issuerName = document.getElementById('issuerName').value || 'CN=Microsoft Root CA,O=Microsoft';
    const exploitType = document.getElementById('exploitType').value;
    const outputDiv = document.getElementById('certificateOutput');
    
    const certificate = generateExploitCertificate(subjectName, issuerName, exploitType);
    displayCertificateOutput(certificate, outputDiv);
}

/**
 * Generates exploit certificate based on parameters
 */
function generateExploitCertificate(subject, issuer, exploitType) {
    const now = new Date();
    const validFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days back
    const validUntil = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year ahead
    
    // Simulate certificate data
    const serialNumber = generateRandomHex(16);
    const publicKey = generateRandomHex(64);
    
    let exploitDetails = {};
    
    switch (exploitType) {
        case 'generator_spoofing':
            exploitDetails = {
                method: 'Generator Point Spoofing',
                description: 'Ersetzt Standard-Generator mit kontrolliertem Punkt',
                parameters: {
                    algorithm: 'id-ecPublicKey',
                    curve: 'prime256v1',
                    generator: '0x04deadbeef' + generateRandomHex(56),
                    publicKey: '0x04' + publicKey
                },
                vulnerability: 'Windows validiert Generator-Punkt nicht korrekt'
            };
            break;
        case 'curve_manipulation':
            exploitDetails = {
                method: 'Curve Parameter Manipulation',
                description: 'Manipuliert Kurvenparameter a und b',
                parameters: {
                    algorithm: 'id-ecPublicKey',
                    curve: 'explicit',
                    a: '0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc',
                    b: '0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b',
                    manipulated_a: manipulateCoordinate('0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc')
                },
                vulnerability: 'Kurvenparameter werden nicht validiert'
            };
            break;
        case 'signature_forge':
            exploitDetails = {
                method: 'Signature Forgery',
                description: 'Fälscht Signatur mit manipulierten Parametern',
                parameters: {
                    algorithm: 'ecdsa-with-SHA256',
                    signature: '0x30' + generateRandomHex(70),
                    forged: true
                },
                vulnerability: 'Signatur-Validierung umgangen durch Parameter-Kontrolle'
            };
            break;
    }
    
    return {
        format: 'X.509 Certificate (PEM)',
        subject: subject,
        issuer: issuer,
        serialNumber: serialNumber.replace('0x', '').toUpperCase(),
        validFrom: validFrom.toISOString(),
        validUntil: validUntil.toISOString(),
        exploitDetails: exploitDetails,
        pemData: generateMockPEM(subject, issuer, exploitDetails),
        instructions: generateCertificateInstructions(exploitType)
    };
}

/**
 * Generates mock PEM data for demonstration
 */
function generateMockPEM(subject, issuer, exploitDetails) {
    const header = '-----BEGIN CERTIFICATE-----';
    const footer = '-----END CERTIFICATE-----';
    
    // Generate base64-like data (not real, just for demo)
    const lines = [];
    for (let i = 0; i < 20; i++) {
        lines.push(generateRandomBase64Line());
    }
    
    // Add "exploit marker"
    lines[10] = 'deadbeef' + lines[10].substring(8); // Recognizable marker
    
    return header + '\n' + lines.join('\n') + '\n' + footer;
}

/**
 * Generates random base64-like lines
 */
function generateRandomBase64Line() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let line = '';
    for (let i = 0; i < 64; i++) {
        line += chars[Math.floor(Math.random() * chars.length)];
    }
    return line;
}

/**
 * Generates instructions for certificate creation
 */
function generateCertificateInstructions(exploitType) {
    const instructions = {
        'generator_spoofing': [
            'Generiere manipulierten Generator-Punkt',
            'Erstelle Private Key mit neuen Parametern',
            'Generiere Zertifikat mit gefälschtem Issuer',
            'Teste gegen verification.py'
        ],
        'curve_manipulation': [
            'Definiere benutzerdefinierte Kurvenparameter',
            'Erstelle explizite Parameter-Definition',
            'Generiere Schlüsselpaar mit neuen Parametern',
            'Signiere Zertifikat mit manipulierten Parametern'
        ],
        'signature_forge': [
            'Analysiere Ziel-CA-Zertifikat',
            'Erstelle eigenes Schlüsselpaar',
            'Fälsche Signatur mit kontrollierten Parametern',
            'Validiere gegen verwundbare Implementierung'
        ]
    };
    
    return instructions[exploitType] || ['Allgemeine Exploit-Schritte'];
}

/**
 * Displays the generated certificate
 */
function displayCertificateOutput(cert, container) {
    const html = `
        <div class="certificate-result">
            <h5>🎯 Generiertes Exploit-Zertifikat</h5>
            
            <div class="cert-overview">
                <div class="cert-field">
                    <strong>Subject:</strong> ${cert.subject}
                </div>
                <div class="cert-field">
                    <strong>Issuer:</strong> ${cert.issuer}
                </div>
                <div class="cert-field">
                    <strong>Serial:</strong> ${cert.serialNumber}
                </div>
                <div class="cert-field">
                    <strong>Exploit-Methode:</strong> ${cert.exploitDetails.method}
                </div>
            </div>
            
            <div class="exploit-details">
                <h6>🔥 Exploit-Details:</h6>
                <p>${cert.exploitDetails.description}</p>
                <div class="vulnerability-info">
                    <strong>Schwachstelle:</strong> ${cert.exploitDetails.vulnerability}
                </div>
            </div>
            
            <div class="pem-output">
                <h6>📄 PEM-Daten (Mock):</h6>
                <div class="code-block" onclick="copyToClipboard(this.textContent)">
                    <pre>${cert.pemData}</pre>
                </div>
            </div>
            
            <div class="instructions">
                <h6>📋 Nächste Schritte:</h6>
                <ol>
                    ${cert.instructions.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
            
            <div class="action-buttons">
                <button onclick="downloadCertificate('${cert.pemData}')" class="tool-btn">
                    💾 Zertifikat herunterladen
                </button>
                <button onclick="testCertificate()" class="tool-btn primary">
                    Gegen verification testen
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Downloads the generated certificate
 */
function downloadCertificate(pemData) {
    const blob = new Blob([pemData], { type: 'application/x-pem-file' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exploit_certificate.pem';
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('📄 Zertifikat wurde heruntergeladen!');
}

/**
 * Tests a certificate against validation
 */
function testCertificate() {
    showNotification('🧪 Teste Zertifikat... (Simulation)');
    
    setTimeout(() => {
        const success = Math.random() > 0.3; // 70% success probability for demo
        
        if (success) {
            showValidationSuccess();
        } else {
            showValidationFailure();
        }
    }, 2000);
}

/**
 * Validates uploaded certificate
 */
function validateCertificate() {
    const fileInput = document.getElementById('certificateFile');
    const outputDiv = document.getElementById('validationResult');
    
    if (!fileInput.files[0]) {
        showResult('❌ Bitte wählen Sie zuerst ein Zertifikat aus!', 'error', outputDiv);
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const certData = e.target.result;
        performValidation(certData, outputDiv);
    };
    
    reader.readAsText(file);
}

/**
 * Performs certificate validation
 */
function performValidation(certData, outputDiv) {
    outputDiv.innerHTML = '<div class="loading">🔍 Validiere Zertifikat...</div>';
    
    setTimeout(() => {
        // Simulate validation
        const hasExploitMarkers = certData.includes('deadbeef') || 
                                 certData.includes('evil') || 
                                 certData.includes('rogue');
        
        const isValidFormat = certData.includes('BEGIN CERTIFICATE') && 
                             certData.includes('END CERTIFICATE');
        
        if (!isValidFormat) {
            showResult('❌ Ungültiges Zertifikatsformat! Verwenden Sie PEM-Format.', 'error', outputDiv);
            return;
        }
        
        if (hasExploitMarkers) {
            showValidationSuccess(outputDiv);
            // Show flag automatically
            setTimeout(() => {
                const flag = correctFlags[Math.floor(Math.random() * correctFlags.length)];
                showResult(`🎉 <strong>EXPLOIT ERFOLGREICH!</strong><br>Flag: <code>${flag}</code>`, 'success', outputDiv);
            }, 1500);
        } else {
            showValidationFailure(outputDiv);
        }
    }, 2000);
}

/**
 * Shows successful validation
 */
function showValidationSuccess(container = null) {
    const message = `
        <div class="success-message">
            ✅ <strong>Zertifikat erfolgreich validiert!</strong>
            <div class="validation-details">
                <p>🎯 Das manipulierte Zertifikat wurde von der simulierten CryptoAPI als gültig erkannt!</p>
                <p>🔥 CVE-2020-0601 Exploit erfolgreich ausgeführt!</p>
                <div class="exploit-confirmation">
                    <h6>Erkannte Exploit-Merkmale:</h6>
                    <ul>
                        <li>✓ Manipulierte ECC-Parameter</li>
                        <li>✓ Rogue Generator-Punkt</li>
                        <li>✓ Gefälschte CA-Signatur</li>
                        <li>✓ Umgehung der Validierung</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    if (container) {
        container.innerHTML = message;
    } else {
        showNotification('✅ Exploit erfolgreich!');
    }
}

/**
 * Shows failed validation
 */
function showValidationFailure(container = null) {
    const message = `
        <div class="error-message">
            ❌ <strong>Validierung fehlgeschlagen</strong>
            <div class="validation-details">
                <p>Das Zertifikat konnte nicht als gültiger Exploit erkannt werden.</p>
                <div class="failure-hints">
                    <h6>💡 Mögliche Probleme:</h6>
                    <ul>
                        <li>ECC-Parameter nicht korrekt manipuliert</li>
                        <li>Generator-Punkt entspricht Standard</li>
                        <li>Keine erkennbaren Exploit-Marker</li>
                        <li>Signatur-Algorithmus nicht angreifbar</li>
                    </ul>
                </div>
                <p><strong>Tipp:</strong> Verwenden Sie die Parameter-Generator-Tools oben!</p>
            </div>
        </div>
    `;
    
    if (container) {
        container.innerHTML = message;
    } else {
        showNotification('❌ Validierung fehlgeschlagen');
    }
}

/**
 * Checks the manually entered flag
 */
function checkFlag() {
    const flagInput = document.getElementById('flagInput');
    const flagResult = document.getElementById('flagResult');
    const userFlag = flagInput.value.trim();
    
    attemptCount++;
    
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
            showExploitHint(flagResult);
        }
    }
}

/**
 * Shows final success
 */
function showFinalSuccess(container) {
    const html = `
        <div class="success-message final-success">
            🎉 <strong>CHALLENGE 3 ABGESCHLOSSEN!</strong>
            <div class="success-details">
                <p>🏆 Sie haben erfolgreich CVE-2020-0601 simuliert und ein gefälschtes ECC-Zertifikat erstellt!</p>
                
                <div class="achievement-summary">
                    <h6>🎯 Was Sie erreicht haben:</h6>
                    <ul>
                        <li>✅ ECC-Parameter manipuliert</li>
                        <li>✅ Generator-Punkt-Spoofing durchgeführt</li>
                        <li>✅ Windows CryptoAPI Schwachstelle ausgenutzt</li>
                        <li>✅ Gefälschtes Zertifikat als "vertrauenswürdig" validiert</li>
                    </ul>
                </div>
                
                <div class="learning-summary">
                    <h6>📚 Gelernte Konzepte:</h6>
                    <ul>
                        <li>Elliptische Kurven-Kryptographie</li>
                        <li>X.509 Zertifikat-Struktur</li>
                        <li>PKI Schwachstellen</li>
                        <li>Kryptographische Parameter-Validierung</li>
                    </ul>
                </div>
                
                <div class="next-steps">
                    <p><strong>🚀 Herzlichen Glückwunsch!</strong> Sie haben die vorletzte Challenge erfolgreich abgeschlossen!</p>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    createConfetti();
    
    // Save success
    localStorage.setItem('challenge3_completed', 'true');
    localStorage.setItem('all_challenges_completed', 'true');
    
    // Mark challenge as completed
    if (typeof markChallengeCompleted === 'function') {
        markChallengeCompleted(3);
    }
}

/**
 * Shows exploit hints
 */
function showExploitHint(container) {
    const hints = [
        '💡 Verwenden Sie die Parameter-Generator-Tools auf dieser Seite',
        '💡 Achten Sie auf "deadbeef" Marker in den generierten Parametern',
        '💡 Das verification.py Skript erwartet spezifische Exploit-Merkmale',
        '💡 Versuchen Sie Generator-Point-Spoofing als Angriffsmethode'
    ];
    
    const hint = hints[Math.min(attemptCount - 3, hints.length - 1)];
    
    setTimeout(() => {
        const currentContent = container.innerHTML;
        container.innerHTML = currentContent + `<div class="hint-message">${hint}</div>`;
    }, 1500);
}

/**
 * Shows results in a container
 */
function showResult(message, type, container) {
    const className = type === 'error' ? 'error-message' : 
                     type === 'success' ? 'success-message' : 'info-message';
    
    container.innerHTML = `<div class="${className}">${message}</div>`;
}

/**
 * Copies text to clipboard
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('📋 In Zwischenablage kopiert!');
    });
}

/**
 * Shows notifications
 */
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

/**
 * Creates confetti effect
 */
function createConfetti() {
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = getRandomColor();
            confetti.style.animationDelay = Math.random() * 3 + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 30);
    }
}

/**
 * Generates random colors
 */
function getRandomColor() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#a78bfa'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Enter key for flag input
    const flagInput = document.getElementById('flagInput');
    if (flagInput) {
        flagInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkFlag();
            }
        });
    }
    
    // File upload styling
    const fileInput = document.getElementById('certificateFile');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const label = document.querySelector('.file-label');
            if (this.files[0]) {
                label.textContent = `📄 ${this.files[0].name}`;
                label.style.color = '#10b981';
            }
        });
    }
    
    // Load progress
    loadProgress();
});

/**
 * Loads saved progress
 */
function loadProgress() {
    const completed = localStorage.getItem('challenge3_completed');
    if (completed === 'true') {
        const flagResult = document.getElementById('flagResult');
        if (flagResult) {
            showResult('✅ Diese Challenge wurde bereits erfolgreich abgeschlossen!', 'success', flagResult);
        }
    }
}
