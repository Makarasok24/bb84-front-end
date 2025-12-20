# RSA vs BB84 Comparison Metrics - Quick Reference

## Overview
This document explains the four key metrics used to compare Classical RSA Encryption with BB84 Quantum Key Distribution.

---

## 1. Error Rate Distribution

### RSA (Classical Encryption)
- **Value:** 0%
- **Why:** Classical communication channels are stable and reliable. Data transmission over wires, fiber optics, or radio has built-in error correction.
- **Visualization:** Green metric box showing perfect transmission
- **Interpretation:** ✅ **Advantage for RSA** - No data loss or corruption during transmission

### BB84 (Quantum Key Distribution)
- **Value:** Variable (typically 0-5% without Eve, >11% with Eve)
- **Why:** Quantum states can be disturbed by noise, measurement, or eavesdropping. Errors are inherent to quantum transmission.
- **Visualization:** Yellow/Red metric showing QBER percentage
- **Interpretation:** 
  - Low error rate (<11%): ✅ Secure, no eavesdropping
  - High error rate (>11%): 🔴 Eavesdropper detected, abort communication

**Key Difference:** 
- RSA errors indicate technical problems only
- BB84 errors indicate **security compromise** - this is a feature, not a bug!

---

## 2. Eve's Detection Rate

### RSA (Classical Encryption)
- **Value:** 0%
- **Why:** Eavesdropping leaves no physical trace on classical data. Eve can copy encrypted bits without disturbing them.
- **Visualization:** Red warning box emphasizing critical security limitation
- **Interpretation:** ⚠️ **Critical Weakness** - You never know if someone is listening

**How Eve Attacks RSA:**
1. Intercepts encrypted message in transit
2. Makes a perfect copy (classical data can be cloned)
3. Original message continues to Bob unchanged
4. No alerts, no warnings, no detection possible
5. Eve stores encrypted data for future decryption attempts

### BB84 (Quantum Key Distribution)
- **Value:** ~100% (when QBER > 11%)
- **Why:** Quantum mechanics: measuring a quantum state disturbs it (No-Cloning Theorem, Heisenberg Uncertainty)
- **Visualization:** Green shield icon with detection success rate
- **Interpretation:** ✅ **Major Advantage** - Guaranteed eavesdropper detection

**How Eve is Detected in BB84:**
1. Eve intercepts quantum bits (qubits)
2. Must measure them to read (collapses quantum state)
3. Re-sends disturbed qubits to Bob
4. Alice and Bob compare bases publicly
5. Error rate (QBER) increases above threshold
6. Detection: "Someone is listening! Abort and restart."

**Key Difference:** This is the **fundamental advantage** of quantum cryptography!

---

## 3. Eavesdrop Detection (Detection Mechanism)

### RSA (Classical Encryption)
- **Mechanism:** None - mathematically impossible to detect
- **Security Model:** Computational security (hard math problems)
- **Assumption:** Factoring large numbers takes too long
- **Weakness:** 
  - Quantum computers (Shor's algorithm) can break RSA
  - "Harvest now, decrypt later" attack: Eve stores data and waits for better computers
  - Zero-day cryptanalysis breakthroughs

### BB84 (Quantum Key Distribution)
- **Mechanism:** Physical law - Heisenberg Uncertainty Principle
- **Security Model:** Information-theoretic security (laws of physics)
- **Detection Process:**
  1. Alice sends qubits encoded in random bases (+ or ×)
  2. Bob measures with random bases
  3. Public basis reconciliation (discard mismatches)
  4. Sample remaining bits to calculate QBER
  5. If QBER > threshold: Eve detected!
- **Advantage:**
  - No computational assumptions
  - Secure even against future technology
  - Real-time detection during key exchange

**Visual Comparison:**
```
RSA:  Alice → [encrypted data] → (Eve copies silently) → Bob
      Result: ✅ Delivery successful, ❌ Eve unknown

BB84: Alice → [qubits] → (Eve measures & disturbs) → Bob
      QBER Analysis: 🔴 Errors detected → Eve present!
```

---

## 4. Key Efficiency

### RSA (Classical Encryption)
- **Value:** 100%
- **Why:** All encrypted data sent is received and usable. No data is discarded.
- **Process:**
  1. Alice encrypts message with public key
  2. Entire ciphertext transmitted
  3. Bob decrypts with private key
  4. 100% of data is recovered
- **Interpretation:** ✅ **Advantage for RSA** - Efficient data transmission

### BB84 (Quantum Key Distribution)
- **Value:** ~50% (can be as low as 25%)
- **Why:** Basis reconciliation discards roughly half the qubits
- **Process:**
  1. Alice sends N qubits with random bases
  2. Bob measures with random bases
  3. Basis matching: ~50% of bases match by chance
  4. Discard non-matching bases (~N/2 qubits lost)
  5. Sample some for QBER testing (~N/4 lost)
  6. Final key: ~N/4 bits (25-50% efficiency)
- **Interpretation:** ⚠️ **Trade-off** - Lower efficiency for higher security

**Example:**
```
RSA:  Send 1000 bits → Receive 1000 bits (100%)
BB84: Send 1000 qubits → Match ~500 → Test 100 → Final key ~400 bits (40%)
```

**Why This Matters:**
- BB84 requires more quantum transmission for same key length
- Slower key generation rate
- Higher cost per bit of secure key
- But: Guaranteed security detection makes up for inefficiency

---

## Comparison Summary Table

| Metric | RSA | BB84 | Winner |
|--------|-----|------|--------|
| **Error Rate** | 0% (perfect) | Variable (0-25%) | ✅ RSA |
| **Eve Detection Rate** | 0% (none) | ~100% (guaranteed) | ✅ BB84 |
| **Eavesdrop Detection** | ❌ Impossible | ✅ Automatic | ✅ BB84 |
| **Key Efficiency** | 100% | ~25-50% | ✅ RSA |
| **Quantum-Safe** | ❌ No | ✅ Yes | ✅ BB84 |
| **Implementation Cost** | Low | High | ✅ RSA |
| **Real-world Use** | Everywhere | Research/Military | ✅ RSA |

---

## Why BB84 Matters Despite Trade-offs

### The Critical Question:
**"Would you rather have:**
- **Fast, efficient encryption** where you never know if someone is listening? (RSA)
- **Slower key exchange** where you're guaranteed to detect any eavesdropping?" (BB84)

### Answer Depends on Context:

**Use RSA when:**
- Speed and efficiency are critical
- Quantum computers not available yet
- Cost is a major factor
- Standard internet communications
- Short-term security needs

**Use BB84 when:**
- Maximum security required (military, government)
- Long-term security essential (decades)
- Quantum computer threat is real
- Detection is more important than efficiency
- High-value data (nuclear codes, state secrets)

---

## Real-World Implications

### Scenario 1: Bank Transaction (RSA)
```
You → [Encrypt: $1000 transfer] → Bank
✅ Fast, works instantly
❌ If intercepted, you'll never know
⚠️ Quantum computers could break it in future
```

### Scenario 2: Military Communication (BB84)
```
Commander → [Qubits: Attack coordinates] → Field Unit
✅ If intercepted, IMMEDIATE ALERT
✅ Quantum-safe, works forever
⚠️ Slower, only ~40% of qubits become key
```

---

## Visualization in Your Simulation

### In RSA Simulation:
After completion, show metrics in three boxes:

```
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│   Error Rate        │ │  Eve Detection Rate │ │   Key Efficiency    │
│       0%            │ │        0%           │ │       100%          │
│   ✅ No errors      │ │  ⚠️ Cannot detect   │ │  ✅ All data used   │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
      (Green)                  (Red)                   (Blue)
```

### In BB84 Simulation:
Already displayed in existing implementation with QBER analysis

---

## Teaching Points for Presentation

### 1. Error Rate
> "RSA has perfect transmission - but that doesn't mean it's more secure. BB84's errors are actually a security feature that detects eavesdroppers!"

### 2. Detection Rate
> "This is THE key difference: RSA cannot detect Eve at all. BB84 automatically detects eavesdropping through quantum physics. Would you rather have fast encryption where you never know if someone is listening, or slower encryption that alerts you to any intrusion?"

### 3. Eavesdrop Detection Mechanism
> "RSA relies on math being hard - but computers get faster. BB84 relies on laws of physics - these never change. Quantum mechanics guarantees that measuring a quantum state disturbs it, making eavesdropping detectable."

### 4. Key Efficiency
> "BB84 is less efficient because it discards non-matching bases. But this 'waste' is the price of security. For critical communications, knowing your channel is secure is worth the inefficiency."

---

## Conclusion

**The Trade-off:**
- **RSA:** Fast, efficient, practical - but vulnerable to quantum computers and undetectable eavesdropping
- **BB84:** Slower, less efficient, expensive - but quantum-safe with guaranteed eavesdropper detection

**The Future:**
- Hybrid approach: Use BB84 to establish shared key, then use that key with fast symmetric encryption (AES)
- Best of both worlds: Quantum-safe key exchange + efficient data transmission

**Your Contribution:**
This simulation helps people understand why quantum cryptography matters, despite being "worse" on some metrics. The ability to **detect eavesdropping** is revolutionary and changes the security game completely.

---

## Metrics Formulas (Reference)

### Error Rate (QBER in BB84):
```
QBER = (Number of errors in sample) / (Total bits compared) × 100%

Threshold: 11%
- Below 11%: Secure channel
- Above 11%: Eavesdropper detected
```

### Detection Rate:
```
Detection Rate = (Times Eve detected) / (Times Eve was present) × 100%

RSA: 0 / N = 0%
BB84: N / N ≈ 100% (when Eve intercepts significantly)
```

### Key Efficiency:
```
Efficiency = (Final usable key bits) / (Initial transmitted bits) × 100%

RSA: Key length / Key length = 100%
BB84: ~(N/4) / N = 25-50% (depends on basis matching and testing)
```

---

Good luck with your presentation! These metrics clearly demonstrate the revolutionary nature of quantum cryptography. 🔐✨
