'use client';

import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Play, Lock, Unlock, Key, AlertCircle, Info, Gauge } from 'lucide-react';
import Link from 'next/link';

type AnimationStage = 'idle' | 'encrypting' | 'transmitting' | 'eve-intercepting' | 'decrypting' | 'complete';

interface AnimatedMessage {
  text: string;
  encrypted: boolean;
  position: number; // 0 to 100
  stage: AnimationStage;
}

interface ComparisonMetrics {
  errorRate: number;
  eveDetectionRate: number;
  keyEfficiency: number;
}

export default function RSASimulator() {
  const [message, setMessage] = useState<string>('HELLO');
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [eveEnabled, setEveEnabled] = useState<boolean>(true);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  
  // Animation state
  const [currentStage, setCurrentStage] = useState<AnimationStage>('idle');
  const [messageState, setMessageState] = useState<AnimatedMessage>({
    text: 'HELLO',
    encrypted: false,
    position: 0,
    stage: 'idle'
  });
  const [showPublicKey, setShowPublicKey] = useState<boolean>(false);
  const [showPrivateKey, setShowPrivateKey] = useState<boolean>(false);
  const [eveIntercepted, setEveIntercepted] = useState<boolean>(false);
  const [animationProgress, setAnimationProgress] = useState<number>(0);

  // Comparison metrics
  const rsaMetrics: ComparisonMetrics = {
    errorRate: 0, // No errors in classical encryption
    eveDetectionRate: 0, // Cannot detect eavesdroppers
    keyEfficiency: 100 // All data is usable
  };

  const startSimulation = () => {
    // Reset all states
    setIsAnimating(true);
    setCurrentStage('encrypting');
    setMessageState({
      text: message,
      encrypted: false,
      position: 0,
      stage: 'encrypting'
    });
    setShowPublicKey(false);
    setShowPrivateKey(false);
    setEveIntercepted(false);
    setAnimationProgress(0);
  };

  // Main animation loop
  useEffect(() => {
    if (!isAnimating) return;

    const speed = 30 / simulationSpeed; // milliseconds per frame
    const interval = setInterval(() => {
      setAnimationProgress(prev => {
        const newProgress = prev + 1;
        
        // Scene 1: Encryption (0-20%)
        if (newProgress <= 20) {
          if (newProgress === 5) setShowPublicKey(true);
          if (newProgress === 15) {
            setMessageState(prev => ({ ...prev, encrypted: true }));
          }
          setCurrentStage('encrypting');
        }
        // Scene 2: Transmission (20-50%)
        else if (newProgress <= 50) {
          if (newProgress === 21) setCurrentStage('transmitting');
          const transmitProgress = ((newProgress - 20) / 30) * 100;
          setMessageState(prev => ({ ...prev, position: transmitProgress, stage: 'transmitting' }));
        }
        // Scene 3: Eve Intercepts (50-70%)
        else if (newProgress <= 70 && eveEnabled) {
          if (newProgress === 51) {
            setCurrentStage('eve-intercepting');
            setEveIntercepted(true);
          }
          // Eve just observes, message continues
          const transmitProgress = 50 + ((newProgress - 50) / 20) * 50;
          setMessageState(prev => ({ ...prev, position: transmitProgress, stage: 'eve-intercepting' }));
        }
        // Scene 3 (no Eve): Continue transmission (50-70%)
        else if (newProgress <= 70 && !eveEnabled) {
          const transmitProgress = 50 + ((newProgress - 50) / 20) * 50;
          setMessageState(prev => ({ ...prev, position: transmitProgress, stage: 'transmitting' }));
        }
        // Scene 4: Bob Decrypts (70-100%)
        else if (newProgress <= 100) {
          if (newProgress === 71) {
            setCurrentStage('decrypting');
            setMessageState(prev => ({ ...prev, position: 100, stage: 'decrypting' }));
            setShowPrivateKey(true);
          }
          if (newProgress === 85) {
            setMessageState(prev => ({ ...prev, encrypted: false }));
          }
          if (newProgress === 100) {
            setCurrentStage('complete');
            setIsAnimating(false);
          }
        }
        
        return newProgress;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isAnimating, simulationSpeed, eveEnabled]);

  const getEncryptedText = (text: string) => {
    // Visual representation of encrypted text
    return text.split('').map(() => '█').join('');
  };

  const getStageLabel = () => {
    switch (currentStage) {
      case 'encrypting':
        return '📦 Scene 1: Alice encrypts the message using Bob\'s public key';
      case 'transmitting':
        return '🔗 Scene 2: Encrypted message travels through classical channel';
      case 'eve-intercepting':
        return '👁️ Scene 3: Eve intercepts and copies the encrypted message - NOT DETECTED';
      case 'decrypting':
        return '🔓 Scene 4: Bob decrypts the message using his private key';
      case 'complete':
        return '✅ Complete: Message delivered securely, but Eve\'s presence is UNKNOWN';
      default:
        return 'Click "Run RSA Simulation" to start';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Lock className="text-orange-600" size={36} />
                RSA Classical Encryption Simulation
              </h1>
              <p className="text-gray-600 mt-2">
                Visualize classical encryption - mathematical security without eavesdropper detection
              </p>
            </div>
            <Link 
              href="/"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              ← Back to BB84
            </Link>
          </div>
        </header>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-gray-700" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">
              Simulation Controls
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message to Send
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value.toUpperCase().slice(0, 20))}
                disabled={isAnimating}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter message (max 20 chars)"
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">Plain text message from Alice to Bob</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Eavesdropper (Eve)
              </label>
              <button
                onClick={() => setEveEnabled(!eveEnabled)}
                disabled={isAnimating}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  eveEnabled
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                {eveEnabled ? '🔴 Eve: ON (Intercepts message)' : '⚪ Eve: OFF'}
              </button>
              <p className="text-xs text-gray-500 mt-1">Eve can intercept but cannot be detected</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Gauge size={16} />
                Animation Speed: {simulationSpeed}x
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                disabled={isAnimating}
                className="w-full disabled:opacity-50"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.5x (Slow)</span>
                <span>1.5x</span>
                <span>3x (Fast)</span>
              </div>
            </div>
          </div>

          <button
            onClick={startSimulation}
            disabled={isAnimating}
            className="w-full mt-6 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Play size={20} />
            {isAnimating ? 'Simulation Running...' : 'Run RSA Simulation'}
          </button>
        </div>

        {/* Stage Indicator */}
        {currentStage !== 'idle' && (
          <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg shadow-lg p-4 mb-6 border-2 border-orange-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl animate-pulse">
                {Math.floor((animationProgress / 100) * 4) + 1}
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {getStageLabel()}
              </p>
            </div>
            <div className="mt-3 w-full bg-white rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                style={{ width: `${animationProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Animation Visualization */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            RSA Encryption Process Visualization
          </h2>

          <div className="relative h-100 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 overflow-hidden">
            {/* Alice */}
            <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
              <div className="text-center">
                <div className={`w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2 transition-all ${
                  currentStage === 'encrypting' ? 'ring-4 ring-blue-300 scale-110' : ''
                }`}>
                  A
                </div>
                <div className="text-sm font-semibold text-gray-700">Alice</div>
              </div>
            </div>

            {/* Eve (if enabled) */}
            {eveEnabled && (
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="text-center">
                  <div className={`w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2 transition-all ${
                    currentStage === 'eve-intercepting' ? 'ring-4 ring-red-300 scale-110' : ''
                  }`}>
                    E
                  </div>
                  <div className="text-sm font-semibold text-gray-700">Eve</div>
                  {eveIntercepted && (
                    <div className="mt-2 px-2 py-1 bg-red-100 border border-red-300 rounded text-xs text-red-700">
                      Copied message
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bob */}
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
              <div className="text-center">
                <div className={`w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2 transition-all ${
                  currentStage === 'decrypting' || currentStage === 'complete' ? 'ring-4 ring-purple-300 scale-110' : ''
                }`}>
                  B
                </div>
                <div className="text-sm font-semibold text-gray-700">Bob</div>
              </div>
            </div>

            {/* Connection Channel */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <marker id="arrowhead-rsa" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
                </marker>
              </defs>
              {eveEnabled ? (
                <>
                  <line x1="100" y1="50%" x2="48%" y2="50%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead-rsa)" />
                  <line x1="52%" y1="50%" x2="calc(100% - 100px)" y2="50%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead-rsa)" />
                </>
              ) : (
                <line x1="100" y1="50%" x2="calc(100% - 100px)" y2="50%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead-rsa)" />
              )}
            </svg>

            {/* Public Key Icon (appears at Alice) */}
            {showPublicKey && currentStage === 'encrypting' && (
              <div 
                className="absolute left-24 top-1/3 transform -translate-y-1/2 animate-bounce"
                style={{ zIndex: 10 }}
              >
                <div className="bg-green-500 text-white p-3 rounded-lg shadow-lg">
                  <Key size={24} />
                  <div className="text-xs mt-1 font-semibold">Public Key</div>
                </div>
              </div>
            )}

            {/* Private Key Icon (appears at Bob) */}
            {showPrivateKey && (currentStage === 'decrypting' || currentStage === 'complete') && (
              <div 
                className="absolute right-24 top-1/3 transform -translate-y-1/2 animate-bounce"
                style={{ zIndex: 10 }}
              >
                <div className="bg-purple-500 text-white p-3 rounded-lg shadow-lg">
                  <Key size={24} />
                  <div className="text-xs mt-1 font-semibold">Private Key</div>
                </div>
              </div>
            )}

            {/* Message in Transit */}
            {(currentStage === 'transmitting' || currentStage === 'eve-intercepting' || currentStage === 'decrypting') && (
              <div
                className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-300"
                style={{
                  left: `${100 + (messageState.position / 100) * (eveEnabled ? 800 : 900)}px`,
                  zIndex: 20
                }}
              >
                <div className={`relative transition-all duration-500 ${
                  currentStage === 'eve-intercepting' ? 'scale-110' : 'scale-100'
                }`}>
                  <div className={`bg-white border-4 rounded-lg p-4 shadow-2xl min-w-[120px] ${
                    currentStage === 'decrypting' ? 'border-purple-500' : 'border-orange-500'
                  }`}>
                    <div className="flex items-center justify-center mb-2">
                      {messageState.encrypted ? (
                        <Lock className="text-orange-600" size={24} />
                      ) : (
                        <Unlock className="text-green-600" size={24} />
                      )}
                    </div>
                    <div className="text-center font-mono text-lg font-bold text-gray-800">
                      {messageState.encrypted ? getEncryptedText(messageState.text) : messageState.text}
                    </div>
                    <div className="text-center text-xs text-gray-500 mt-1">
                      {messageState.encrypted ? 'Encrypted' : 'Plaintext'}
                    </div>
                  </div>
                  {currentStage === 'eve-intercepting' && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap animate-pulse">
                      Eve copying...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Message at Alice (before encryption) */}
            {currentStage === 'encrypting' && animationProgress < 15 && (
              <div className="absolute left-24 top-1/2 transform -translate-y-1/2" style={{ zIndex: 20 }}>
                <div className="bg-white border-4 border-blue-500 rounded-lg p-4 shadow-2xl">
                  <div className="text-center text-xs text-gray-500 mb-1">Original Message</div>
                  <div className="text-center font-mono text-xl font-bold text-gray-800">
                    {message}
                  </div>
                </div>
              </div>
            )}

            {/* Message at Bob (after decryption) */}
            {currentStage === 'complete' && (
              <div className="absolute right-24 top-1/2 transform -translate-y-1/2" style={{ zIndex: 20 }}>
                <div className="bg-white border-4 border-green-500 rounded-lg p-4 shadow-2xl animate-pulse">
                  <div className="flex items-center justify-center mb-2">
                    <Unlock className="text-green-600" size={28} />
                  </div>
                  <div className="text-center text-xs text-gray-500 mb-2">Decrypted Message</div>
                  <div className="text-center font-mono text-xl font-bold text-gray-800 mb-2">
                    {message}
                  </div>
                  <div className="text-center">
                    <span className="inline-flex items-center gap-1 text-xs text-white bg-green-600 px-3 py-1 rounded-full font-semibold">
                      <span className="text-lg">✓</span> Successfully received!
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scene Description */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">Current Scene Explanation:</h3>
            <p className="text-sm text-gray-700">
              {currentStage === 'encrypting' && (
                <>
                  Alice has Bob's <strong className="text-green-600">public key</strong>. She uses it to <strong>encrypt</strong> her message before sending. 
                  The message transforms into unreadable ciphertext (represented by blocks █).
                </>
              )}
              {currentStage === 'transmitting' && (
                <>
                  The <strong className="text-orange-600">encrypted message</strong> travels through the classical communication channel. 
                  The channel is <strong>stable</strong> - no quantum effects, no noise, no disturbance.
                </>
              )}
              {currentStage === 'eve-intercepting' && (
                <>
                  <strong className="text-red-600">Eve intercepts and copies</strong> the encrypted message in transit. 
                  However, she sees only <strong>scrambled data</strong> she cannot decrypt. 
                  <strong className="text-red-600"> CRITICAL: Eve's interception is NOT DETECTED.</strong> Alice and Bob have no way to know Eve was listening.
                </>
              )}
              {currentStage === 'decrypting' && (
                <>
                  Bob receives the encrypted message and uses his <strong className="text-purple-600">private key</strong> (kept secret) to <strong>decrypt</strong> it. 
                  Only Bob can decrypt messages encrypted with his public key.
                </>
              )}
              {currentStage === 'complete' && (
                <>
                  <strong className="text-green-600">Success!</strong> Bob received the original message "{message}". 
                  {eveEnabled && (
                    <strong className="text-red-600"> However, Alice and Bob do NOT know that Eve intercepted their communication. </strong>
                  )}
                  Classical RSA provides confidentiality through mathematical complexity, but <strong>cannot detect eavesdroppers</strong>.
                </>
              )}
              {currentStage === 'idle' && (
                <>Click the "Run RSA Simulation" button to see how classical encryption works. Watch how Eve can intercept without being detected!</>
              )}
            </p>
          </div>
        </div>

        {/* Comparison Metrics */}
        {currentStage === 'complete' && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              RSA Classical Encryption Metrics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                <div className="text-3xl font-bold text-green-600">
                  {rsaMetrics.errorRate}%
                </div>
                <div className="text-sm text-gray-700 font-medium">Error Rate</div>
                <div className="text-xs text-gray-500 mt-1">
                  No transmission errors in classical channel
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
                <div className="text-3xl font-bold text-red-600">
                  {rsaMetrics.eveDetectionRate}%
                </div>
                <div className="text-sm text-gray-700 font-medium">Eve Detection Rate</div>
                <div className="text-xs text-gray-500 mt-1">
                  ⚠️ Cannot detect eavesdroppers
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                <div className="text-3xl font-bold text-blue-600">
                  {rsaMetrics.keyEfficiency}%
                </div>
                <div className="text-sm text-gray-700 font-medium">Key Efficiency</div>
                <div className="text-xs text-gray-500 mt-1">
                  All transmitted data is usable
                </div>
              </div>
            </div>

            {eveEnabled && (
              <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-1">
                      Critical Security Limitation
                    </h3>
                    <p className="text-sm text-red-700">
                      Eve intercepted your communication, but <strong>you have no way to know</strong>. 
                      Classical RSA encryption does NOT provide eavesdropper detection. 
                      Security relies solely on mathematical difficulty of breaking the encryption.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Comparison with BB84 */}
        {currentStage === 'complete' && (
          <div className="bg-gradient-to-r from-orange-50 to-indigo-50 rounded-lg shadow-lg p-6 mb-6 border-2 border-gray-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🔍 RSA vs BB84 Quantum Key Distribution
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 border">Feature</th>
                    <th className="px-4 py-3 text-left font-semibold text-orange-700 border">RSA (Classical)</th>
                    <th className="px-4 py-3 text-left font-semibold text-indigo-700 border">BB84 (Quantum)</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 border font-medium">Error Rate</td>
                    <td className="px-4 py-3 border">
                      <span className="text-green-600 font-bold">0%</span> - No transmission errors
                    </td>
                    <td className="px-4 py-3 border">
                      <span className="text-yellow-600 font-bold">Variable</span> - Errors indicate eavesdropping
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 border font-medium">Eve Detection</td>
                    <td className="px-4 py-3 border">
                      <span className="text-red-600 font-bold">0%</span> - ⚠️ Cannot detect eavesdroppers
                    </td>
                    <td className="px-4 py-3 border">
                      <span className="text-green-600 font-bold">~100%</span> - ✓ Detects eavesdropping via QBER
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 border font-medium">Key Efficiency</td>
                    <td className="px-4 py-3 border">
                      <span className="text-green-600 font-bold">100%</span> - All data is usable
                    </td>
                    <td className="px-4 py-3 border">
                      <span className="text-yellow-600 font-bold">~50%</span> - Data lost in basis mismatch
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 border font-medium">Security Basis</td>
                    <td className="px-4 py-3 border">
                      <strong>Mathematical complexity</strong> - Relies on hard problems (factoring)
                    </td>
                    <td className="px-4 py-3 border">
                      <strong>Laws of physics</strong> - Quantum mechanics guarantees security
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 border font-medium">Quantum Computer Threat</td>
                    <td className="px-4 py-3 border">
                      <span className="text-red-600 font-bold">⚠️ Vulnerable</span> - Shor's algorithm can break RSA
                    </td>
                    <td className="px-4 py-3 border">
                      <span className="text-green-600 font-bold">✓ Secure</span> - Quantum-safe by design
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 border font-medium">Implementation</td>
                    <td className="px-4 py-3 border">
                      Easy - Standard computers, existing infrastructure
                    </td>
                    <td className="px-4 py-3 border">
                      Complex - Requires quantum hardware, specialized setup
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-300">
              <h3 className="font-semibold text-gray-800 mb-2">Key Takeaway:</h3>
              <p className="text-sm text-gray-700">
                <strong>RSA (Classical):</strong> Encrypts data efficiently but <strong className="text-red-600">cannot detect if someone is listening</strong>. 
                Security depends on math being hard to break.
                <br /><br />
                <strong>BB84 (Quantum):</strong> Uses quantum mechanics to <strong className="text-green-600">automatically detect eavesdroppers</strong>. 
                Even if transmission is less efficient, you know your communication is secure or compromised.
                <br /><br />
                <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-semibold underline">
                  → Try the BB84 simulation to see how quantum cryptography detects Eve
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Educational Information */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-orange-200">
          <div className="flex items-start gap-3">
            <Info className="text-orange-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                How RSA Classical Encryption Works
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="pl-4 border-l-4 border-blue-300">
                  <strong>Step 1 - Key Generation:</strong> Bob generates a pair of keys: a <strong>public key</strong> (shared with everyone) 
                  and a <strong>private key</strong> (kept secret). These are mathematically linked.
                </div>
                <div className="pl-4 border-l-4 border-green-300">
                  <strong>Step 2 - Encryption:</strong> Alice uses Bob's <strong>public key</strong> to encrypt her message. 
                  The encryption transforms readable text into unreadable ciphertext.
                </div>
                <div className="pl-4 border-l-4 border-gray-300">
                  <strong>Step 3 - Transmission:</strong> The encrypted message travels through a classical communication channel 
                  (internet, phone line, etc.). The channel is stable with no quantum effects.
                </div>
                <div className="pl-4 border-l-4 border-red-300">
                  <strong>Step 4 - Interception (if Eve is present):</strong> Eve can intercept and copy the encrypted message. 
                  She sees only scrambled data she cannot read. <strong className="text-red-600">Crucially: This interception leaves NO trace.</strong>
                </div>
                <div className="pl-4 border-l-4 border-purple-300">
                  <strong>Step 5 - Decryption:</strong> Bob receives the encrypted message and uses his <strong>private key</strong> to decrypt it, 
                  revealing the original message. Only Bob can decrypt it.
                </div>
              </div>

              <div className="mt-4 p-4 bg-orange-50 rounded border border-orange-200">
                <p className="text-sm text-gray-700">
                  <strong className="text-orange-700">🔐 Security Principle:</strong> RSA security is based on the mathematical difficulty 
                  of factoring large numbers. Without the private key, Eve would need years or centuries to break the encryption. 
                  However, <strong className="text-red-600">RSA cannot tell you if someone intercepted your message</strong> - you can only 
                  trust that the math is hard enough. With quantum computers (Shor's algorithm), this assumption breaks down.
                </p>
              </div>

              <div className="mt-4 p-4 bg-red-50 rounded border-2 border-red-300">
                <p className="text-sm font-semibold text-red-800">
                  ⚠️ CRITICAL DIFFERENCE FROM BB84: Classical encryption does NOT detect eavesdroppers. 
                  This is why quantum key distribution (BB84) is revolutionary - it provides guaranteed detection of any interception attempt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
