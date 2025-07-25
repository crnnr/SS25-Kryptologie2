// Progress tracking system for Curveball CTF

class ChallengeProgress {
    constructor() {
        this.init();
    }

    init() {
        this.loadProgressFromServer();
        this.addProgressIndicator();
        this.addDebugControls();
    }

    async loadProgressFromServer() {
        try {
            const response = await fetch('/api/challenge_status');
            const data = await response.json();
            this.updateProgressDisplay(data);
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }

    updateProgressDisplay(status) {
        // Update challenge cards on main page
        const cards = document.querySelectorAll('.challenge-card');
        cards.forEach((card, index) => {
            const challengeNumber = index + 1;
            const isCompleted = status.completed.includes(challengeNumber);
            const isUnlocked = status.unlocked.includes(challengeNumber);

            // Update visual state
            if (isCompleted) {
                card.classList.add('completed');
                card.classList.remove('locked');
            } else if (!isUnlocked) {
                card.classList.add('locked');
                card.classList.remove('completed');
            } else {
                card.classList.remove('locked', 'completed');
            }

            // Update button state
            const button = card.querySelector('.challenge-btn');
            if (button) {
                if (!isUnlocked) {
                    button.classList.add('locked');
                    button.disabled = true;
                    button.textContent = '🔒 Gesperrt';
                } else if (isCompleted) {
                    button.textContent = 'Challenge wiederholen →';
                    button.classList.remove('locked');
                    button.disabled = false;
                } else {
                    button.textContent = 'Challenge starten →';
                    button.classList.remove('locked');
                    button.disabled = false;
                }
            }
        });

        // Update progress indicator
        this.updateProgressIndicator(status);
    }

    addProgressIndicator() {
        const challengesSection = document.querySelector('.challenges-section');
        if (!challengesSection) return;

        const progressHTML = `
            <div class="challenge-progress" id="challenge-progress">
                <div class="progress-dot" data-challenge="1"></div>
                <div class="progress-dot" data-challenge="2"></div>
                <div class="progress-dot" data-challenge="3"></div>
                <div class="progress-dot" data-challenge="4"></div>
            </div>
        `;

        // Insert before the challenges grid
        const grid = challengesSection.querySelector('.challenges-grid');
        if (grid) {
            grid.insertAdjacentHTML('beforebegin', progressHTML);
        }
    }

    updateProgressIndicator(status) {
        const dots = document.querySelectorAll('.progress-dot');
        dots.forEach((dot, index) => {
            const challengeNumber = index + 1;
            dot.classList.remove('completed', 'current');

            if (status.completed.includes(challengeNumber)) {
                dot.classList.add('completed');
            } else if (status.unlocked.includes(challengeNumber) && 
                      challengeNumber === Math.min(...status.unlocked.filter(n => !status.completed.includes(n)))) {
                dot.classList.add('current');
            }
        });
    }

    async markChallengeCompleted(challengeNumber) {
        try {
            const response = await fetch(`/api/complete_challenge/${challengeNumber}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                console.log(`Challenge ${challengeNumber} completed!`);
                this.updateProgressDisplay(data.status);
                this.showCompletionMessage(challengeNumber, data.status);
                return true;
            } else {
                console.error('Error completing challenge:', data.error);
                return false;
            }
        } catch (error) {
            console.error('Error marking challenge as completed:', error);
            return false;
        }
    }

    showCompletionMessage(challengeNumber, status) {
        const nextChallenge = challengeNumber + 1;
        const isLastChallenge = challengeNumber === 4;
        
        let message = `🎉 Challenge ${challengeNumber} abgeschlossen!`;
        
        if (!isLastChallenge && status.unlocked.includes(nextChallenge)) {
            message += `\n\n🔓 Challenge ${nextChallenge} wurde freigeschaltet!`;
        } else if (isLastChallenge) {
            message += '\n\n🏆 Herzlichen Glückwunsch! Sie haben alle Challenges abgeschlossen!';
        }

        // Create a nice modal instead of alert
        this.showModal(message, challengeNumber);
    }

    showModal(message, challengeNumber) {
        const modal = document.createElement('div');
        modal.className = 'completion-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🎉 Challenge Abgeschlossen!</h3>
                </div>
                <div class="modal-body">
                    <p>${message.replace(/\n/g, '<br>')}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.completion-modal').remove()">
                        Weiter
                    </button>
                    ${challengeNumber < 4 ? `
                    <button class="btn btn-secondary" onclick="window.location.href='/challenge${challengeNumber + 1}'">
                        Nächste Challenge →
                    </button>
                    ` : `
                    <button class="btn btn-secondary" onclick="window.location.href='/'">
                        Zur Übersicht
                    </button>
                    `}
                </div>
            </div>
        `;

        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .completion-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .modal-content {
                background: rgba(30, 30, 45, 0.95);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 15px;
                padding: 30px;
                max-width: 500px;
                text-align: center;
                backdrop-filter: blur(10px);
            }
            .modal-header h3 {
                color: #e2e8f0;
                margin-bottom: 20px;
                font-size: 1.5rem;
            }
            .modal-body p {
                color: #cbd5e1;
                line-height: 1.6;
                margin-bottom: 25px;
            }
            .modal-footer {
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
            }
            .modal-footer .btn {
                padding: 10px 20px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 500;
                border: none;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .modal-footer .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .modal-footer .btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                color: #e0e0e0;
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
            .modal-footer .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(modal);
    }

    addDebugControls() {
        // Add debug controls in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const debugPanel = document.createElement('div');
            debugPanel.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                z-index: 1000;
                font-size: 12px;
            `;
            debugPanel.innerHTML = `
                <strong>Debug Controls:</strong><br>
                <button onclick="progressTracker.resetProgress()">Reset Progress</button><br>
                <button onclick="progressTracker.markChallengeCompleted(1)">Complete C1</button>
                <button onclick="progressTracker.markChallengeCompleted(2)">Complete C2</button>
                <button onclick="progressTracker.markChallengeCompleted(3)">Complete C3</button>
                <button onclick="progressTracker.markChallengeCompleted(4)">Complete C4</button>
            `;
            document.body.appendChild(debugPanel);
        }
    }

    async resetProgress() {
        try {
            const response = await fetch('/api/reset_progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                this.updateProgressDisplay(data.status);
                console.log('Progress reset successfully');
            }
        } catch (error) {
            console.error('Error resetting progress:', error);
        }
    }
}

// Global function to mark challenges as completed (to be called from challenge pages)
window.markChallengeCompleted = function(challengeNumber) {
    if (window.progressTracker) {
        return window.progressTracker.markChallengeCompleted(challengeNumber);
    }
    return false;
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.progressTracker = new ChallengeProgress();
});
