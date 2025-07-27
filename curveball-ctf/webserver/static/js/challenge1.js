// Challenge 1: ECC Fundamentals - Point Multiplication
// Curve: y² ≡ x³ + 3x + 3 (mod 97)
// Generator: G = (11, 3)
// Private Key: d = 7

const CURVE_A = 3;
const CURVE_B = 3;
const MODULUS = 97;
const GENERATOR = { x: 11, y: 3 };

// Correct answers for the steps
const CORRECT_ANSWERS = {
    '2G': { x: 13, y: 69 },
    '4G': { x: 39, y: 50 },
    '6G': { x: 54, y: 2 },
    '7G': { x: 16, y: 49 }
};

// Helper functions for modular arithmetic
function modInverse(a, m) {
    a = ((a % m) + m) % m;
    for (let x = 1; x < m; x++) {
        if ((a * x) % m === 1) return x;
    }
    return 1;
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

// Check if a point lies on the curve
function isOnCurve(x, y) {
    const leftSide = mod(y * y, MODULUS);
    const rightSide = mod(x * x * x + CURVE_A * x + CURVE_B, MODULUS);
    return leftSide === rightSide;
}

// Point addition on elliptic curves
function pointAdd(P, Q) {
    if (P === null) return Q;
    if (Q === null) return P;
    
    const { x: x1, y: y1 } = P;
    const { x: x2, y: y2 } = Q;
    
    let lambda;
    
    if (x1 === x2) {
        if (y1 === y2) {
            // Point doubling
            const numerator = mod(3 * x1 * x1 + CURVE_A, MODULUS);
            const denominator = mod(2 * y1, MODULUS);
            lambda = mod(numerator * modInverse(denominator, MODULUS), MODULUS);
        } else {
            // Points are inverse to each other
            return null; // Point at infinity
        }
    } else {
        // Normal point addition
        const numerator = mod(y2 - y1, MODULUS);
        const denominator = mod(x2 - x1, MODULUS);
        lambda = mod(numerator * modInverse(denominator, MODULUS), MODULUS);
    }
    
    const x3 = mod(lambda * lambda - x1 - x2, MODULUS);
    const y3 = mod(lambda * (x1 - x3) - y1, MODULUS);
    
    return { x: x3, y: y3 };
}

// Scalar multiplication (for verification only)
function scalarMult(k, point) {
    if (k === 0) return null;
    if (k === 1) return point;
    
    let result = null;
    let addend = point;
    
    while (k > 0) {
        if (k & 1) {
            result = pointAdd(result, addend);
        }
        addend = pointAdd(addend, addend);
        k >>= 1;
    }
    
    return result;
}

// Challenge-specific check functions
function check2G() {
    const x = parseInt(document.getElementById('x2g').value);
    const y = parseInt(document.getElementById('y2g').value);
    const feedback = document.getElementById('feedback2g');
    
    if (isNaN(x) || isNaN(y)) {
        feedback.innerHTML = '<span class="error">Bitte geben Sie gültige Zahlen ein.</span>';
        return;
    }
    
    if (x === CORRECT_ANSWERS['2G'].x && y === CORRECT_ANSWERS['2G'].y) {
        feedback.innerHTML = '<span class="success">✅ Korrekt! 2G = (13, 69)</span>';
        showCalculationDetails('2G');
        setTimeout(() => {
            document.getElementById('step3').style.display = 'block';
            document.getElementById('step3').scrollIntoView({ behavior: 'smooth' });
        }, 1000);
    } else {
        feedback.innerHTML = '<span class="error">❌ Nicht korrekt. Überprüfen Sie Ihre Berechnung.</span>';
        showHint2G();
    }
}

function check4G() {
    const x = parseInt(document.getElementById('x4g').value);
    const y = parseInt(document.getElementById('y4g').value);
    const feedback = document.getElementById('feedback4g');
    
    if (isNaN(x) || isNaN(y)) {
        feedback.innerHTML = '<span class="error">Bitte geben Sie gültige Zahlen ein.</span>';
        return;
    }
    
    if (x === CORRECT_ANSWERS['4G'].x && y === CORRECT_ANSWERS['4G'].y) {
        feedback.innerHTML = '<span class="success">✅ Korrekt! 4G = (39, 50)</span>';
        showCalculationDetails('4G');
        setTimeout(() => {
            document.getElementById('step4').style.display = 'block';
            document.getElementById('step4').scrollIntoView({ behavior: 'smooth' });
        }, 1000);
    } else {
        feedback.innerHTML = '<span class="error">❌ Nicht korrekt. Verdoppeln Sie das Ergebnis von 2G.</span>';
    }
}

function check6G() {
    const x = parseInt(document.getElementById('x6g').value);
    const y = parseInt(document.getElementById('y6g').value);
    const feedback = document.getElementById('feedback6g');
    
    if (isNaN(x) || isNaN(y)) {
        feedback.innerHTML = '<span class="error">Bitte geben Sie gültige Zahlen ein.</span>';
        return;
    }
    
    if (x === CORRECT_ANSWERS['6G'].x && y === CORRECT_ANSWERS['6G'].y) {
        feedback.innerHTML = '<span class="success">✅ Korrekt! 6G = (54, 2)</span>';
        setTimeout(() => {
            document.getElementById('step5').style.display = 'block';
            document.getElementById('step5').scrollIntoView({ behavior: 'smooth' });
        }, 1000);
    } else {
        feedback.innerHTML = '<span class="error">❌ Nicht korrekt. Addieren Sie 4G + 2G.</span>';
    }
}

function check7G() {
    const x = parseInt(document.getElementById('x7g').value);
    const y = parseInt(document.getElementById('y7g').value);
    const feedback = document.getElementById('feedback7g');
    
    if (isNaN(x) || isNaN(y)) {
        feedback.innerHTML = '<span class="error">Bitte geben Sie gültige Zahlen ein.</span>';
        return;
    }
    
    if (x === CORRECT_ANSWERS['7G'].x && y === CORRECT_ANSWERS['7G'].y) {
        feedback.innerHTML = '<span class="success">🎉 Perfekt! Sie haben den Public Key berechnet!</span>';
        document.getElementById('finalX').textContent = x;
        document.getElementById('finalY').textContent = y;
        setTimeout(() => {
            document.getElementById('successSection').style.display = 'block';
            document.getElementById('successSection').scrollIntoView({ behavior: 'smooth' });
            
            // Mark challenge as completed
            if (typeof markChallengeCompleted === 'function') {
                markChallengeCompleted(1);
            }
        }, 1000);
    } else {
        feedback.innerHTML = '<span class="error">❌ Nicht korrekt. Addieren Sie 6G + 1G.</span>';
    }
}

// Show detailed calculation steps
function showCalculationDetails(step) {
    if (step === '2G') {
        const details = `
            <div class="calculation-details">
                <h5>Detaillierte Berechnung für 2G:</h5>
                <div class="calc-step">λ = (3 × 11² + 3) × (2 × 3)⁻¹ mod 97</div>
                <div class="calc-step">λ = (3 × 121 + 3) × 6⁻¹ mod 97</div>
                <div class="calc-step">λ = 75 × 81 mod 97 = 61</div>
                <div class="calc-step">x₃ = 61² - 2 × 11 mod 97 = 3721 - 22 mod 97 = 13</div>
                <div class="calc-step">y₃ = 61 × (11 - 13) - 3 mod 97 = 61 × (-2) - 3 mod 97 = 69</div>
            </div>
        `;
        document.getElementById('feedback2g').innerHTML += details;
    } else if (step === '4G') {
        const details = `
            <div class="calculation-details">
                <h5>Detaillierte Berechnung für 4G = 2(2G):</h5>
                <div class="calc-step">Mit 2G = (13, 69):</div>
                <div class="calc-step">λ = (3 × 13² + 3) × (2 × 69)⁻¹ mod 97</div>
                <div class="calc-step">λ = 25 × 71 mod 97 = 29</div>
                <div class="calc-step">x₃ = 29² - 2 × 13 mod 97 = 841 - 26 mod 97 = 39</div>
                <div class="calc-step">y₃ = 29 × (13 - 39) - 69 mod 97 = 29 × (-26) - 69 mod 97 = 50</div>
            </div>
        `;
        document.getElementById('feedback4g').innerHTML += details;
    }
}

function showHint2G() {
    const hint = `
        <div class="hint-section">
            <h5>💡 Tipp für 2G:</h5>
            <div class="hint-content">
                <p>Für die Punktverdopplung G + G mit G = (11, 3):</p>
                <ul>
                    <li>Berechnen Sie λ = (3 × 11² + 3) / (2 × 3) mod 97</li>
                    <li>Der modulare Inverse von 6 mod 97 ist 81</li>
                    <li>Also: λ = 75 × 81 mod 97 = 61</li>
                </ul>
            </div>
        </div>
    `;
    document.getElementById('feedback2g').innerHTML += hint;
}

// Helper functions
function calculateModInverse() {
    const a = parseInt(document.getElementById('modInvA').value);
    const p = parseInt(document.getElementById('modInvP').value);
    const result = document.getElementById('modInvResult');
    
    if (isNaN(a) || isNaN(p)) {
        result.innerHTML = '<span class="error">Bitte geben Sie gültige Zahlen ein.</span>';
        return;
    }
    
    const inverse = modInverse(a, p);
    result.innerHTML = `<span class="success">${a}⁻¹ ≡ ${inverse} (mod ${p})</span>`;
    
    // Show verification
    const verification = mod(a * inverse, p);
    result.innerHTML += `<br><small>Verifikation: ${a} × ${inverse} ≡ ${verification} (mod ${p})</small>`;
}

function verifyPoint() {
    const x = parseInt(document.getElementById('verifyX').value);
    const y = parseInt(document.getElementById('verifyY').value);
    const result = document.getElementById('verifyResult');
    
    if (isNaN(x) || isNaN(y)) {
        result.innerHTML = '<span class="error">Bitte geben Sie gültige Zahlen ein.</span>';
        return;
    }
    
    if (isOnCurve(x, y)) {
        result.innerHTML = `<span class="success">✅ Punkt (${x}, ${y}) liegt auf der Kurve!</span>`;
    } else {
        result.innerHTML = `<span class="error">❌ Punkt (${x}, ${y}) liegt NICHT auf der Kurve.</span>`;
    }
    
    // Show the calculation
    const leftSide = mod(y * y, MODULUS);
    const rightSide = mod(x * x * x + CURVE_A * x + CURVE_B, MODULUS);
    result.innerHTML += `<br><small>y² mod 97 = ${leftSide}, x³ + 3x + 3 mod 97 = ${rightSide}</small>`;
}

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Challenge 1: ECC Grundlagen geladen');
    console.log('Kurve: y² ≡ x³ + 3x + 3 (mod 97)');
    console.log('Generator G =', GENERATOR);
    
    // Verification of correct answers (for development only)
    console.log('Verifikation der Antworten:');
    console.log('2G =', scalarMult(2, GENERATOR));
    console.log('4G =', scalarMult(4, GENERATOR));
    console.log('6G =', scalarMult(6, GENERATOR));
    console.log('7G =', scalarMult(7, GENERATOR));
});
