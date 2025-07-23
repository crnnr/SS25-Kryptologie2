#!/usr/bin/env python3
"""
Curveball CTF Challenge 4 - Signatur-Validierungs-Simulator
==========================================================

Dieses Skript demonstriert, wie ECC-Parameter-Manipulation die Signaturvalidierung 
beeinflussen kann, ohne dass der Angreifer den ursprünglichen privaten Schlüssel kennt.

CVE-2020-0601 Demonstration
"""

import json
import hashlib
from typing import Dict, Tuple, Optional

class ECCSignatureValidator:
    """Simuliert ECC-Signaturvalidierung mit manipulierbaren Parametern"""
    
    def __init__(self, curve_params: Dict[str, str]):
        """
        Initialisiert den Validator mit Kurvenparametern
        
        Args:
            curve_params: Dictionary mit ECC-Kurvenparametern (p, a, b, generator, order)
        """
        self.p = int(curve_params['p'], 16) if isinstance(curve_params['p'], str) else curve_params['p']
        self.a = int(curve_params['a'], 16) if isinstance(curve_params['a'], str) else curve_params['a']
        self.b = int(curve_params['b'], 16) if isinstance(curve_params['b'], str) else curve_params['b']
        self.gx = int(curve_params['generator_x'], 16) if isinstance(curve_params['generator_x'], str) else curve_params['generator_x']
        self.gy = int(curve_params['generator_y'], 16) if isinstance(curve_params['generator_y'], str) else curve_params['generator_y']
        self.order = int(curve_params['order'], 16) if isinstance(curve_params['order'], str) else curve_params['order']
        
    def point_add(self, x1: int, y1: int, x2: int, y2: int) -> Tuple[int, int]:
        """Elliptische Kurven Punkt-Addition (vereinfacht)"""
        if x1 == x2:
            if y1 == y2:
                # Punkt-Verdopplung
                s = (3 * x1 * x1 + self.a) * pow(2 * y1, -1, self.p) % self.p
            else:
                return None, None  # Punkt im Unendlichen
        else:
            s = (y2 - y1) * pow(x2 - x1, -1, self.p) % self.p
        
        x3 = (s * s - x1 - x2) % self.p
        y3 = (s * (x1 - x3) - y1) % self.p
        return x3, y3
    
    def point_multiply(self, k: int, x: int, y: int) -> Tuple[int, int]:
        """Skalare Multiplikation auf elliptischer Kurve (vereinfacht)"""
        if k == 0:
            return None, None
        if k == 1:
            return x, y
        
        # Double-and-add Algorithmus (vereinfacht)
        result_x, result_y = None, None
        addend_x, addend_y = x, y
        
        while k:
            if k & 1:
                if result_x is None:
                    result_x, result_y = addend_x, addend_y
                else:
                    result_x, result_y = self.point_add(result_x, result_y, addend_x, addend_y)
            addend_x, addend_y = self.point_add(addend_x, addend_y, addend_x, addend_y)
            k >>= 1
        
        return result_x, result_y
    
    def validate_signature(self, message: str, signature_r: int, signature_s: int, 
                          public_key_x: int, public_key_y: int) -> Dict[str, any]:
        """
        Validiert eine ECDSA-Signatur
        
        Args:
            message: Nachricht die signiert wurde
            signature_r, signature_s: Signatur-Komponenten
            public_key_x, public_key_y: Öffentlicher Schlüssel
            
        Returns:
            Dictionary mit Validierungsergebnis und Details
        """
        try:
            # 1. Hash der Nachricht berechnen
            message_hash = int(hashlib.sha256(message.encode()).hexdigest(), 16)
            
            # 2. Signatur-Parameter prüfen
            if not (1 <= signature_r < self.order and 1 <= signature_s < self.order):
                return {
                    'valid': False,
                    'reason': 'Signatur-Parameter außerhalb des gültigen Bereichs',
                    'step': 'parameter_check'
                }
            
            # 3. Inverse von s berechnen
            try:
                s_inv = pow(signature_s, -1, self.order)
            except ValueError:
                return {
                    'valid': False,
                    'reason': 'Inverse von s existiert nicht',
                    'step': 'inverse_calculation'
                }
            
            # 4. u1 und u2 berechnen
            u1 = (message_hash * s_inv) % self.order
            u2 = (signature_r * s_inv) % self.order
            
            # 5. Punkt-Berechnung: u1*G + u2*Qa
            # u1 * Generator
            x1, y1 = self.point_multiply(u1, self.gx, self.gy)
            if x1 is None:
                return {
                    'valid': False,
                    'reason': 'Fehler bei Generator-Multiplikation',
                    'step': 'generator_multiplication'
                }
            
            # u2 * Public Key
            x2, y2 = self.point_multiply(u2, public_key_x, public_key_y)
            if x2 is None:
                return {
                    'valid': False,
                    'reason': 'Fehler bei Public-Key-Multiplikation',
                    'step': 'public_key_multiplication'
                }
            
            # Addition der Punkte
            result_x, result_y = self.point_add(x1, y1, x2, y2)
            if result_x is None:
                return {
                    'valid': False,
                    'reason': 'Fehler bei Punkt-Addition',
                    'step': 'point_addition'
                }
            
            # 6. Validierung: result_x mod order == signature_r
            final_x = result_x % self.order
            is_valid = final_x == signature_r
            
            return {
                'valid': is_valid,
                'reason': 'Signatur gültig' if is_valid else f'Signatur ungültig: {final_x} != {signature_r}',
                'step': 'final_validation',
                'calculations': {
                    'message_hash': hex(message_hash),
                    'u1': hex(u1),
                    'u2': hex(u2),
                    'result_point': (hex(result_x), hex(result_y)),
                    'final_x': hex(final_x),
                    'expected_r': hex(signature_r)
                }
            }
            
        except Exception as e:
            return {
                'valid': False,
                'reason': f'Unerwarteter Fehler: {str(e)}',
                'step': 'error'
            }

def load_signature_data(file_path: str = 'signature_data.json') -> Dict:
    """Lädt Signatur-Testdaten aus JSON-Datei"""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Datei {file_path} nicht gefunden!")
        return None

def demonstrate_curveball_exploit():
    """Demonstriert CVE-2020-0601 Curveball Exploit"""
    
    print("🔐 Curveball CTF Challenge 4 - Signatur-Validierungs-Simulator")
    print("=" * 70)
    
    # Lade Testdaten
    data = load_signature_data()
    if not data:
        return
    
    sig_data = data['signature_data']
    original_params = sig_data['original_curve_params']
    signature_r = int(sig_data['original_signature']['r'], 16)
    signature_s = int(sig_data['original_signature']['s'], 16)
    
    # Simuliere einen öffentlichen Schlüssel
    public_key_x = int(original_params['generator_x'], 16)
    public_key_y = int(original_params['generator_y'], 16)
    
    print(f"📝 Test-Nachricht: {sig_data['message'][:50]}...")
    print(f"🔢 Signatur r: {hex(signature_r)[:20]}...")
    print(f"🔢 Signatur s: {hex(signature_s)[:20]}...")
    print()
    
    # Test 1: Normale Validierung
    print("1️⃣  Normale Signatur-Validierung mit ursprünglichen Parametern")
    print("-" * 50)
    
    validator_original = ECCSignatureValidator(original_params)
    result_original = validator_original.validate_signature(
        sig_data['message'], signature_r, signature_s, public_key_x, public_key_y
    )
    
    print(f"✅ Ergebnis: {'GÜLTIG' if result_original['valid'] else 'UNGÜLTIG'}")
    print(f"💭 Grund: {result_original['reason']}")
    print()
    
    # Test 2: Manipulation von Parametern
    print("2️⃣  Curveball-Angriff: Parameter-Manipulation")
    print("-" * 50)
    
    for i, example in enumerate(sig_data['manipulated_examples'], 1):
        print(f"   Test {i}: {example['method']}")
        print(f"   📊 Ausnutzbarkeit: {example['exploitation_factor'].upper()}")
        print(f"   📋 {example['description']}")
        
        # Erstelle manipulierte Parameter
        manipulated_params = original_params.copy()
        
        if 'new_generator_x' in example:
            manipulated_params['generator_x'] = example['new_generator_x']
            manipulated_params['generator_y'] = example['new_generator_y']
        if 'new_a' in example:
            manipulated_params['a'] = example['new_a']
        if 'new_order' in example:
            manipulated_params['order'] = example['new_order']
        
        validator_manipulated = ECCSignatureValidator(manipulated_params)
        result_manipulated = validator_manipulated.validate_signature(
            sig_data['message'], signature_r, signature_s, public_key_x, public_key_y
        )
        
        print(f"   🎯 Ergebnis: {'EXPLOIT MÖGLICH' if not result_manipulated['valid'] else 'EXPLOIT FEHLGESCHLAGEN'}")
        print(f"   💭 Details: {result_manipulated['reason']}")
        print()
    
    # Sicherheitshinweise
    print("🛡️  Schutzmaßnahmen gegen Curveball")
    print("-" * 40)
    print("• Immer Kurvenparameter gegen vertrauenswürdige Standards validieren")
    print("• Generator-Punkt aus CA-Root-Zertifikat verwenden, nicht aus Leaf-Zertifikat")
    print("• Zusätzliche Validierung der elliptischen Kurven-Eigenschaften")
    print("• Regelmäßige Updates der Zertifikats-Validierungslogik")
    print()
    
    print("🎓 Challenge 4 abgeschlossen! Sie verstehen jetzt die mathematischen")
    print("   Grundlagen des CVE-2020-0601 Curveball-Angriffs.")

if __name__ == '__main__':
    demonstrate_curveball_exploit()
