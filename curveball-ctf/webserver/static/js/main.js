// Progressive Hint System
let currentFailedAttempts = window.currentFailedAttempts || 0;

async function loadHints() {
    const container = document.getElementById('hints-container');
    const hintsList = document.getElementById('hints-list');
    const progressInfo = document.getElementById('progress-info');
    
    if (!container.classList.contains('hidden')) {
        container.classList.add('hidden');
        return;
    }

    try {
        const response = await fetch('/hint');
        const data = await response.json();
        
        // Leere vorherige Inhalte
        hintsList.innerHTML = '';
        progressInfo.innerHTML = '';
        
        if (data.hints.length === 0) {
            // Keine Hints verfügbar
            const nextHint = data.next_hint_at || 3;
            const remaining = nextHint - data.failed_attempts;
            
            progressInfo.innerHTML = `
                <div class="hints-locked">
                    🔒 Noch keine Hints verfügbar!<br>
                    <strong>Fehlversuche:</strong> ${data.failed_attempts}<br>
                    <strong>Nächster Hint:</strong> Nach ${nextHint} Fehlversuchen (noch ${remaining} Versuche)
                </div>
            `;
        } else {
            // Zeige verfügbare Hints an
            progressInfo.innerHTML = `
                <strong>📊 Fortschritt:</strong> ${data.failed_attempts} Fehlversuche - ${data.hints.length} Hint(s) freigeschaltet<br>
                ${data.next_hint_at ? `<strong>Nächster Hint:</strong> Nach ${data.next_hint_at} Fehlversuchen` : '<strong>✅ Alle Hints freigeschaltet!</strong>'}
            `;
            
            data.hints.forEach((hint, index) => {
                const hintDiv = document.createElement('div');
                hintDiv.className = 'hint-item hint-unlocked';
                hintDiv.innerHTML = `<strong>Hint ${index + 1}:</strong> ${hint}`;
                hintsList.appendChild(hintDiv);
                
                // Verzögertes Erscheinen für besseren Effekt
                setTimeout(() => {
                    hintDiv.style.opacity = '1';
                }, index * 200);
            });
        }
        
        container.classList.remove('hidden');
        
        // Update Button Text
        updateHintButton(data.failed_attempts, data.hints.length, data.next_hint_at);
        
    } catch (error) {
        console.error('Error loading hints:', error);
        progressInfo.innerHTML = '<div class="hints-locked">❌ Fehler beim Laden der Hints</div>';
        container.classList.remove('hidden');
    }
}

function updateHintButton(failedAttempts, availableHints, nextHintAt) {
    const button = document.querySelector('.hint-button');
    const counter = document.getElementById('hint-counter');
    
    if (availableHints === 0) {
        const remaining = (nextHintAt || 3) - failedAttempts;
        counter.textContent = `(${remaining} Versuche bis zum ersten Hint)`;
        button.style.background = 'linear-gradient(45deg, #666, #555)';
    } else if (nextHintAt) {
        const remaining = nextHintAt - failedAttempts;
        counter.textContent = `(${availableHints} verfügbar, ${remaining} bis zum nächsten)`;
        button.style.background = 'linear-gradient(45deg, #f39c12, #e67e22)';
    } else {
        counter.textContent = `(${availableHints} verfügbar - alle freigeschaltet!)`;
        button.style.background = 'linear-gradient(45deg, #4caf50, #45a049)';
    }
}

// AJAX form submission to prevent page reload and jumping
async function validateParameters(event) {
    event.preventDefault(); // Verhindert das normale Form-Submit
    
    const form = event.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('.validate-btn');
    
    // Button-Status während der Anfrage ändern
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '🔄 Validiere Parameter...';
    submitButton.disabled = true;
    submitButton.classList.add('validating');
    
    try {
        const response = await fetch('/', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const html = await response.text();
            
            // Parse die Response und extrahiere die relevanten Bereiche
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Update validation results
            const oldValidationResult = document.querySelector('.validation-result');
            const newValidationResult = doc.querySelector('.validation-result');
            
            if (oldValidationResult && newValidationResult) {
                oldValidationResult.outerHTML = newValidationResult.outerHTML;
            } else if (newValidationResult) {
                // Füge Validation Result nach dem Form hinzu
                form.parentElement.insertAdjacentHTML('afterend', newValidationResult.outerHTML);
            } else if (oldValidationResult) {
                oldValidationResult.remove();
            }
            
            // Update certificate info
            const oldCertSection = document.querySelector('.certificate-section');
            const newCertSection = doc.querySelector('.certificate-section');
            
            if (oldCertSection && newCertSection) {
                oldCertSection.outerHTML = newCertSection.outerHTML;
            } else if (newCertSection) {
                // Füge Certificate Section am Ende hinzu, aber vor hints/flag
                const hintsSection = document.querySelector('.hints-section');
                if (hintsSection) {
                    hintsSection.insertAdjacentHTML('beforebegin', newCertSection.outerHTML);
                } else {
                    document.querySelector('.container').insertAdjacentHTML('beforeend', newCertSection.outerHTML);
                }
            } else if (oldCertSection) {
                oldCertSection.remove();
            }
            
            // Update flag if present
            const oldFlag = document.querySelector('.flag-container');
            const newFlag = doc.querySelector('.flag-container');
            
            if (oldFlag && newFlag) {
                oldFlag.outerHTML = newFlag.outerHTML;
            } else if (newFlag) {
                // Füge Flag am Ende hinzu
                document.querySelector('.container').insertAdjacentHTML('beforeend', newFlag.outerHTML);
            } else if (oldFlag) {
                oldFlag.remove();
            }
            
            // Update failed attempts counter
            const scriptTag = doc.querySelector('script');
            if (scriptTag) {
                const scriptContent = scriptTag.textContent;
                const match = scriptContent.match(/currentFailedAttempts = (\d+)/);
                if (match) {
                    currentFailedAttempts = parseInt(match[1]);
                    updateHintButtonForNewAttempts();
                }
            }
            
            // Kurzer Erfolgs-Indikator
            submitButton.innerHTML = '✅ Validiert!';
            submitButton.style.background = 'linear-gradient(45deg, #4caf50 0%, #45a049 100%)';
            
            // Smooth scroll zu den Ergebnissen nach kurzer Verzögerung
            setTimeout(() => {
                const resultSection = document.querySelector('.validation-result') || 
                                   document.querySelector('.certificate-section');
                if (resultSection) {
                    resultSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start',
                        inline: 'nearest'
                    });
                    
                    // Kurzes Highlight der neuen Inhalte
                    resultSection.style.animation = 'none';
                    resultSection.style.transform = 'scale(1.02)';
                    resultSection.style.transition = 'transform 0.3s ease';
                    
                    setTimeout(() => {
                        resultSection.style.transform = 'scale(1)';
                    }, 300);
                }
            }, 300);
            
        } else {
            throw new Error('Fehler bei der Validierung');
        }
        
    } catch (error) {
        console.error('Error:', error);
        submitButton.innerHTML = '❌ Fehler!';
        submitButton.style.background = 'linear-gradient(45deg, #f44336 0%, #d32f2f 100%)';
        
        setTimeout(() => {
            alert('❌ Fehler bei der Parameter-Validierung. Bitte versuchen Sie es erneut.');
        }, 500);
    } finally {
        // Button-Status nach 2 Sekunden zurücksetzen
        setTimeout(() => {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            submitButton.classList.remove('validating');
            submitButton.style.background = '';
        }, 2000);
    }
}

function updateHintButtonForNewAttempts() {
    // Simuliere Hint-Update basierend auf neuen Fehlversuchen
    const button = document.querySelector('.hint-button');
    const counter = document.getElementById('hint-counter');
    
    // Berechne verfügbare Hints basierend auf Fehlversuchen
    const hintThresholds = [3, 4, 5, 6, 7, 8, 10];
    const availableHints = hintThresholds.filter(threshold => currentFailedAttempts >= threshold).length;
    const nextThreshold = hintThresholds.find(threshold => threshold > currentFailedAttempts);
    
    if (availableHints === 0) {
        const remaining = 3 - currentFailedAttempts;
        counter.textContent = `(${remaining} Versuche bis zum ersten Hint)`;
        button.style.background = 'linear-gradient(45deg, #666, #555)';
    } else if (nextThreshold) {
        const remaining = nextThreshold - currentFailedAttempts;
        counter.textContent = `(${availableHints} verfügbar, ${remaining} bis zum nächsten)`;
        button.style.background = 'linear-gradient(45deg, #f39c12, #e67e22)';
    } else {
        counter.textContent = `(${availableHints} verfügbar - alle freigeschaltet!)`;
        button.style.background = 'linear-gradient(45deg, #4caf50, #45a049)';
    }
}

function toggleParameterInfo(descriptionId) {
    // Schließe alle anderen Beschreibungen
    const allDescriptions = document.querySelectorAll('.parameter-description');
    allDescriptions.forEach(desc => {
        if (desc.id !== descriptionId) {
            desc.classList.remove('show');
        }
    });
    
    // Toggle die gewünschte Beschreibung
    const targetDescription = document.getElementById(descriptionId);
    if (targetDescription) {
        targetDescription.classList.toggle('show');
        
        // Smooth scroll zur Beschreibung wenn sie geöffnet wird
        if (targetDescription.classList.contains('show')) {
            setTimeout(() => {
                targetDescription.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'start'
                });
            }, 150);
        }
    }
}

// Interactive Tutorial System
let currentTutorialStep = 1;
let tutorialActive = true;

function nextTutorialStep() {
    const currentStep = document.getElementById(`tutorial-step-${currentTutorialStep}`);
    const nextStep = document.getElementById(`tutorial-step-${currentTutorialStep + 1}`);
    
    if (nextStep) {
        currentStep.classList.remove('active');
        nextStep.classList.add('active');
        currentTutorialStep++;
        
        // Smooth scroll to tutorial section
        document.getElementById('tutorial-section').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function prevTutorialStep() {
    const currentStep = document.getElementById(`tutorial-step-${currentTutorialStep}`);
    const prevStep = document.getElementById(`tutorial-step-${currentTutorialStep - 1}`);
    
    if (prevStep) {
        currentStep.classList.remove('active');
        prevStep.classList.add('active');
        currentTutorialStep--;
        
        // Smooth scroll to tutorial section
        document.getElementById('tutorial-section').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function closeTutorial() {
    const tutorialSection = document.getElementById('tutorial-section');
    tutorialSection.style.display = 'none';
    tutorialActive = false;
    
    // Scroll to challenge section
    const challengeSection = document.querySelector('.challenge-info');
    challengeSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function completeTutorial() {
    closeTutorial();
    
    // Show success message
    showTutorialOverlay(
        "🎉 Tutorial abgeschlossen!",
        "Sie sind jetzt bereit für die Curveball Challenge. Viel Erfolg beim Aufdecken der CVE-2020-0601 Schwachstelle!"
    );
}

function startGuidedExample() {
    // Hide tutorial and scroll to form
    closeTutorial();
    
    // Wait for scroll, then guide through example
    setTimeout(() => {
        // Scroll to interactive section
        const interactiveSection = document.querySelector('.interactive-section');
        interactiveSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Start guided example after scroll
        setTimeout(runGuidedExample, 1000);
    }, 500);
}

function runGuidedExample() {
    // Step 1: Highlight curve selection
    highlightElement('curve', "Schritt 1: Wählen Sie 'secp256r1' als Kurve");
    
    setTimeout(() => {
        // Auto-select curve
        document.getElementById('curve').value = 'secp256r1';
        document.getElementById('curve').dispatchEvent(new Event('change'));
        
        // Step 2: Highlight generator preset
        setTimeout(() => {
            highlightElement('generator_preset', "Schritt 2: Wählen Sie 'rogue' Generator");
            
            setTimeout(() => {
                // Auto-select rogue generator
                document.getElementById('generator_preset').value = 'rogue';
                document.getElementById('generator_preset').dispatchEvent(new Event('change'));
                
                // Step 3: Highlight private key
                setTimeout(() => {
                    highlightElement('private_key', "Schritt 3: Geben Sie 'curveball123' ein");
                    document.getElementById('private_key').focus();
                    document.getElementById('private_key').value = 'curveball123';
                    
                    // Step 4: Highlight validate button
                    setTimeout(() => {
                        highlightElement('validate-btn', "Schritt 4: Klicken Sie auf 'Parameter validieren'");
                    }, 2000);
                }, 2000);
            }, 2000);
        }, 2000);
    }, 2000);
}

function highlightElement(elementId, message) {
    // Clear previous highlights
    clearHighlights();
    
    // Add highlight class
    const element = document.getElementById(elementId) || document.querySelector(`.${elementId}`);
    if (element) {
        element.classList.add('parameter-highlight');
        
        // Show overlay message if provided
        if (message) {
            showTutorialOverlay("💡 Guided Example", message, 3000);
        }
    }
}

function clearHighlights() {
    const highlighted = document.querySelectorAll('.parameter-highlight');
    highlighted.forEach(el => el.classList.remove('parameter-highlight'));
}

function showTutorialOverlay(title, message, autoClose = 0) {
    // Create or get overlay
    let overlay = document.getElementById('tutorial-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.className = 'tutorial-overlay';
        overlay.innerHTML = `
            <div class="tutorial-popup">
                <h4 id="overlay-title"></h4>
                <p id="overlay-message"></p>
                <button class="tutorial-btn" onclick="hideTutorialOverlay()">Verstanden</button>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Close overlay when clicking outside
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                hideTutorialOverlay();
            }
        });
    }
    
    // Update content
    document.getElementById('overlay-title').textContent = title;
    document.getElementById('overlay-message').textContent = message;
    
    // Show overlay
    overlay.classList.add('active');
    
    // Auto-close if specified
    if (autoClose > 0) {
        setTimeout(hideTutorialOverlay, autoClose);
    }
}

function hideTutorialOverlay() {
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

function restartTutorial() {
    // Reset tutorial state
    currentTutorialStep = 1;
    tutorialActive = true;
    
    // Hide all steps
    const steps = document.querySelectorAll('.tutorial-step');
    steps.forEach(step => step.classList.remove('active'));
    
    // Show first step
    document.getElementById('tutorial-step-1').classList.add('active');
    
    // Show tutorial section
    const tutorialSection = document.getElementById('tutorial-section');
    tutorialSection.style.display = 'block';
    
    // Scroll to tutorial
    tutorialSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Download functionality
function downloadCertificate() {
    // This would need to be implemented in the backend
    fetch('/download-certificate')
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'curveball-certificate.pem';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Download failed:', error);
            alert('Download fehlgeschlagen. Zertifikat ist möglicherweise nicht verfügbar.');
        });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const curveSelect = document.getElementById('curve');
    const curveInfo = document.getElementById('curve-info');
    const generatorPreset = document.getElementById('generator_preset');
    const generatorX = document.getElementById('generator_x');

    // Update curve info on selection
    if (curveSelect && curveInfo) {
        curveSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const size = selectedOption.dataset.size;
            const secure = selectedOption.dataset.secure === 'true';
            
            curveInfo.innerHTML = `
                <strong>Sicherheitslevel:</strong> ${size} bit 
                <span style="color: ${secure ? '#4caf50' : '#ff9800'}">
                    (${secure ? 'Sicher' : 'Schwach'})
                </span>
            `;
        });
        
        // Trigger initial update
        curveSelect.dispatchEvent(new Event('change'));
    }

    // Auto-fill generator X coordinate from preset
    if (generatorPreset && generatorX) {
        generatorPreset.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const xValue = selectedOption.dataset.x;
            const isValid = selectedOption.dataset.valid === 'true';
            
            if (xValue && xValue !== 'None') {
                generatorX.value = xValue;
            }
            
            generatorX.style.borderColor = isValid ? 'rgba(78, 205, 196, 0.3)' : 'rgba(255, 107, 107, 0.5)';
        });
    }

    // Initialize hint button
    updateHintButtonForNewAttempts();
    
    // Set current failed attempts from template (will be overridden by template)
    // currentFailedAttempts is set in template
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
        
        // Konami Code aktiviert!
        showTutorialOverlay(
            "🎮 Konami Code aktiviert!",
            "Du hast den geheimen Code gefunden! Als Belohnung hier ein Extra-Hint: Versuche 'evil' als Generator X-Koordinate für versteckte Exploits!"
        );
        
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
