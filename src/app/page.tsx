'use client';

import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Play, Info, Loader2, Settings, ChevronLeft, ChevronRight, Zap, Gauge } from 'lucide-react';

interface BB84Response {
  alice_bits: number[];
  alice_bases: string[];
  encoded_qubits: string[];
  eve_actions: {
    bases: (string | null)[];
    measurements: (number | null)[];
    intercepted: boolean[];
    interception_count: number;
  } | null;
  bob_bases: string[];
  bob_results: number[];
  matching_indices: number[];
  sifted_key_alice: number[];
  sifted_key_bob: number[];
  qber: number;
  errors: number;
  sample_size: number;
  eve_detected: boolean;
  status: string;
  eve_interception_count: number;
}

interface AnimatedBit {
  index: number;
  bit: number;
  basis: string;
  position: number;
  stage: 'alice' | 'transit' | 'bob' | 'complete' | 'eve_intercept' | 'eve_return';
  qubit: string;
  intercepted: boolean;
  eveBit?: number;
  eveBasis?: string;
}

export default function BB84Simulator() {
  const [numBits, setNumBits] = useState<number>(100);
  const [eveEnabled, setEveEnabled] = useState<boolean>(false);
  const [eveInterceptionRate, setEveInterceptionRate] = useState<number>(0.5);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [results, setResults] = useState<BB84Response | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Animation state
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animatedBits, setAnimatedBits] = useState<AnimatedBit[]>([]);
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState<number>(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(25);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const simulateBB84 = async () => {
    setLoading(true);
    setError(null);
    setIsAnimating(false);
    setAnimatedBits([]);
    setCurrentAnimationIndex(0);
    setCurrentPage(1);

    try {
      const response = await fetch(`${API_URL}/bb84/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          num_bits: numBits,
          eve_enabled: eveEnabled,
          eve_interception_rate: eveInterceptionRate,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: BB84Response = await response.json();
      setResults(data);
      
      // Start animation
      startAnimation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to API');
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const startAnimation = (data: BB84Response) => {
    setIsAnimating(true);
    setCurrentAnimationIndex(0);
    
    // Prepare animated bits (show first 10 for visualization)
    const bitsToAnimate = Math.min(10, data.alice_bits.length);
    const initialBits: AnimatedBit[] = [];
    
    for (let i = 0; i < bitsToAnimate; i++) {
      initialBits.push({
        index: i,
        bit: data.alice_bits[i],
        basis: data.alice_bases[i],
        position: 0,
        stage: 'alice',
        qubit: data.encoded_qubits[i],
        intercepted: eveEnabled && data.eve_actions?.intercepted[i] || false,
        eveBit: eveEnabled && data.eve_actions?.measurements[i] !== null ? data.eve_actions?.measurements[i] as number : undefined,
        eveBasis: eveEnabled && data.eve_actions?.bases[i] !== null ? data.eve_actions?.bases[i] as string : undefined,
      });
    }
    
    setAnimatedBits(initialBits);
  };

  // Animation effect
  useEffect(() => {
    if (!isAnimating || !results) return;

    const speed = 50 / simulationSpeed; // milliseconds per frame
    const interval = setInterval(() => {
      setAnimatedBits((prevBits) => {
        return prevBits.map((bit, idx) => {
          if (idx !== currentAnimationIndex) return bit;

          let newPosition = bit.position + 2;
          let newStage = bit.stage;

          // Stage progression
          if (bit.stage === 'alice' && newPosition >= 100) {
            if (bit.intercepted) {
              newStage = 'eve_intercept';
            } else {
              newStage = 'transit';
            }
            newPosition = 0;
          } else if (bit.stage === 'eve_intercept' && newPosition >= 100) {
            newStage = 'eve_return';
            newPosition = 0;
          } else if (bit.stage === 'eve_return' && newPosition >= 100) {
            newStage = 'transit';
            newPosition = 0;
          } else if (bit.stage === 'transit' && newPosition >= 100) {
            newStage = 'bob';
            newPosition = 0; // Reset to 0 to allow animation at Bob's side
          } else if (bit.stage === 'bob' && newPosition >= 100) {
            newStage = 'complete';
          }

          return { ...bit, position: newPosition, stage: newStage };
        });
      });

      // Move to next bit when current completes
      const currentBit = animatedBits[currentAnimationIndex];
      if (currentBit && currentBit.stage === 'complete') {
        if (currentAnimationIndex < animatedBits.length - 1) {
          setCurrentAnimationIndex(prev => prev + 1);
        } else {
          setIsAnimating(false);
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isAnimating, currentAnimationIndex, animatedBits, simulationSpeed, eveEnabled, results]);

  // Pagination logic
  const totalPages = results ? Math.ceil(results.alice_bits.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, results?.alice_bits.length || 0);
  const currentItems = results?.alice_bits.slice(startIndex, endIndex) || [];

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Shield className="text-indigo-600" size={36} />
                BB84 Quantum Key Distribution
              </h1>
              <p className="text-gray-600 mt-2">
                Simulate quantum cryptography with animated visualization
              </p>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="text-gray-700" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">
              Simulation Parameters
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Bits
              </label>
              <input
                type="number"
                value={numBits}
                onChange={(e) => setNumBits(Math.max(10, Math.min(500, parseInt(e.target.value) || 100)))}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                min="10"
                max="500"
                title="Number of Bits"
                aria-label="Number of Bits"
              />
              <p className="text-xs text-gray-500 mt-1">Range: 10-500 bits</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Eavesdropper (Eve)
              </label>
              <button
                onClick={() => setEveEnabled(!eveEnabled)}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                  eveEnabled
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {eveEnabled ? '🔴 Eve: ON' : '🟢 Eve: OFF'}
              </button>
            </div>

            {eveEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Eve's Interception Rate: {(eveInterceptionRate * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={eveInterceptionRate * 100}
                  onChange={(e) => setEveInterceptionRate(parseInt(e.target.value) / 100)}
                  className="w-full"
                  title="Eve's Interception Rate"
                  aria-label="Eve's Interception Rate"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Gauge size={16} />
                Animation Speed: {simulationSpeed}x
              </label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                className="w-full"
                title="Animation Speed"
                aria-label="Animation Speed"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.5x (Slow)</span>
                <span>2.5x</span>
                <span>5x (Fast)</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">
                <strong>Error:</strong> {error}
              </p>
              <p className="text-red-600 text-xs mt-1">
                Make sure the FastAPI backend is running on {API_URL}
              </p>
            </div>
          )}

          <button
            onClick={simulateBB84}
            disabled={loading}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Running Simulation...
              </>
            ) : (
              <>
                <Play size={20} />
                Run BB84 Simulation
              </>
            )}
          </button>
        </div>

        {/* Animation Visualization */}
        {isAnimating && results && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-yellow-500" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">
                Live Quantum Transmission Animation
              </h2>
            </div>

            <div className="relative h-[400px] bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 overflow-hidden">
              {/* Alice */}
              <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                    A
                  </div>
                  <div className="text-sm font-semibold text-gray-700">Alice</div>
                </div>
              </div>

              {/* Eve (if enabled) */}
              {eveEnabled && (
                <div className="absolute left-1/2 bottom-4 transform -translate-x-1/2">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                      E
                    </div>
                    <div className="text-sm font-semibold text-gray-700">Eve</div>
                  </div>
                </div>
              )}

              {/* Bob */}
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                    B
                  </div>
                  <div className="text-sm font-semibold text-gray-700">Bob</div>
                </div>
              </div>

              {/* Animated Bits */}
              {animatedBits.map((bit, idx) => {
                const ALICE_X = 100;
                const CENTER_X = 600;
                const BOB_X = 1100;
                const EVE_Y_OFFSET = 140; // Pixels down from center line
                const isActive = idx === currentAnimationIndex;

                let xPos = 0;
                
                // Center the stack vertically based on total number of animated bits
                const stackHeight = animatedBits.length * 20;
                const stackStartY = -(stackHeight / 2) + 10;
                const stackY = stackStartY + idx * 20;
                
                let yOffset = stackY;

                // Determine content and color
                let displayBit = bit.bit;
                let displayBasis = bit.basis;
                let displayColor = "bg-indigo-500";

                // If it has passed through Eve (or is at Eve), show Eve's data if intercepted
                if (bit.intercepted && (bit.stage === 'eve_return' || bit.stage === 'transit' || bit.stage === 'bob' || bit.stage === 'complete')) {
                    displayBit = bit.eveBit ?? bit.bit;
                    displayBasis = bit.eveBasis ?? bit.basis;
                    displayColor = "bg-red-500";
                }

                // Calculate main qubit position and Y-offset for smooth animation
                if (bit.stage === 'alice') {
                  // Alice to Center (Move from stack to line)
                  xPos = ALICE_X + (bit.position / 100) * (CENTER_X - ALICE_X);
                  if (isActive) yOffset = 0;
                } else if (bit.stage === 'eve_intercept') {
                  // Center to Eve (Down)
                  xPos = CENTER_X;
                  yOffset = (bit.position / 100) * EVE_Y_OFFSET;
                } else if (bit.stage === 'eve_return') {
                  // Eve to Center (Up)
                  xPos = CENTER_X;
                  yOffset = EVE_Y_OFFSET * (1 - bit.position / 100);
                } else if (bit.stage === 'transit') {
                  // Center to Bob (Stay on line)
                  xPos = CENTER_X + (bit.position / 100) * (BOB_X - CENTER_X);
                  yOffset = 0;
                } else if (bit.stage === 'bob') {
                  // At Bob (Move from line to stack)
                  xPos = BOB_X;
                  yOffset = stackY * (bit.position / 100);
                } else if (bit.stage === 'complete') {
                  xPos = BOB_X;
                  yOffset = stackY;
                }

                return (
                  <div key={bit.index}>
                    {/* Main Qubit */}
                    <div
                      className={`absolute transition-all duration-100 ${isActive ? 'z-10' : 'z-0'}`}
                      style={{
                        left: `${xPos}px`,
                        top: `50%`,
                        transform: `translate(-50%, calc(-50% + ${yOffset}px))`,
                      }}
                    >
                      <div className={`relative ${isActive ? 'scale-110' : 'scale-90 opacity-50'}`}>
                        <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-lg ${displayColor} transition-colors duration-300`}>
                          <div className="text-lg">{displayBit}</div>
                          <div className="text-xs">{displayBasis}</div>
                        </div>
                        {isActive && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {bit.qubit}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
                  </marker>
                </defs>
                
                {/* Main Channel */}
                <line x1="100" y1="50%" x2="1100" y2="50%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
                
                {/* Eve Interception Path */}
                {eveEnabled && (
                  <line x1="600" y1="50%" x2="600" y2="85%" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,3" opacity="0.5" />
                )}
              </svg>
            </div>

            <div className="mt-4 text-center text-sm text-gray-600">
              Animating bit {currentAnimationIndex + 1} of {animatedBits.length} 
              {isAnimating && <span className="ml-2 text-indigo-600 font-semibold">● LIVE</span>}
            </div>
          </div>
        )}

        {/* Results */}
        {results && isAnimating == false && (
          <>
            {/* Status Banner */}
            <div
              className={`rounded-lg shadow-lg p-6 mb-6 border-2 ${
                results.eve_detected
                  ? 'bg-red-50 border-red-300'
                  : 'bg-green-50 border-green-300'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  {results.eve_detected ? (
                    <ShieldAlert className="text-red-600" size={40} />
                  ) : (
                    <Shield className="text-green-600" size={40} />
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {results.status}
                    </h3>
                    <p
                      className={`text-sm ${
                        results.eve_detected ? 'text-red-700' : 'text-green-700'
                      }`}
                    >
                      QBER: {results.qber.toFixed(2)}%{' '}
                      {results.eve_detected
                        ? '(Threshold exceeded: 11%)'
                        : '(Within secure threshold)'}
                    </p>
                    {eveEnabled && results.eve_actions && (
                      <p className="text-xs text-gray-600 mt-1">
                        Eve intercepted {results.eve_interception_count} of {numBits} qubits
                        ({((results.eve_interception_count / numBits) * 100).toFixed(1)}%)
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-gray-800">
                    {results.qber.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Error Rate</div>
                </div>
              </div>
            </div>

            {/* QBER Analysis */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                QBER Analysis
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-indigo-600">
                    {results.sample_size}
                  </div>
                  <div className="text-sm text-gray-600">Compared Bits</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {results.errors}
                  </div>
                  <div className="text-sm text-gray-600">Errors Detected</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {results.sifted_key_alice.length}
                  </div>
                  <div className="text-sm text-gray-600">Sifted Key Length</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-gray-800">
                    {results.matching_indices.length}
                  </div>
                  <div className="text-sm text-gray-600">Basis Matches</div>
                </div>
              </div>

              {/* QBER Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>QBER Progress</span>
                  <span>{results.qber.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      results.qber > 11 ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(results.qber, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span className="font-semibold">Threshold: 11%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Protocol Steps Table with Pagination */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Protocol Steps Visualization
                </h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Show:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1 border border-gray-300 text-black rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    title="Items per page"
                    aria-label="Items per page"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-600">per page</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-black border-collapse">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 border">
                        #
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-blue-700 border">
                        Alice Bit
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-blue-700 border">
                        Alice Basis
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-blue-700 border">
                        Encoded
                      </th>
                      {eveEnabled && results.eve_actions && (
                        <>
                          <th className="px-3 py-2 text-left font-semibold text-red-600 border">
                            Eve Intercept
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-red-600 border">
                            Eve Basis
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-red-600 border">
                            Eve Result
                          </th>
                        </>
                      )}
                      <th className="px-3 py-2 text-left font-semibold text-purple-700 border">
                        Bob Basis
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-purple-700 border">
                        Bob Result
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 border">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((_, idx) => {
                      const i = startIndex + idx;
                      const bit = results.alice_bits[i];
                      const basesMatch = results.alice_bases[i] === results.bob_bases[i];
                      const bitsMatch = bit === results.bob_results[i];
                      const eveIntercepted =
                        eveEnabled &&
                        results.eve_actions &&
                        results.eve_actions.intercepted[i];

                      return (
                        <tr
                          key={i}
                          className={`${
                            basesMatch ? 'bg-blue-50' : ''
                          } hover:bg-gray-50 transition-colors`}
                        >
                          <td className="px-3 py-2 text-gray-700 border font-medium">{i}</td>
                          <td className="px-3 py-2 font-mono font-semibold border text-lg">
                            {bit}
                          </td>
                          <td className="px-3 py-2 font-mono text-lg border">
                            {results.alice_bases[i]}
                          </td>
                          <td className="px-3 py-2 text-xs border">
                            {results.encoded_qubits[i]}
                          </td>
                          {eveEnabled && results.eve_actions && (
                            <>
                              <td className="px-3 py-2 border text-center">
                                {eveIntercepted ? (
                                  <span className="text-red-600 font-bold text-lg">✓</span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-3 py-2 font-mono text-lg border">
                                {results.eve_actions.bases[i] || '-'}
                              </td>
                              <td className="px-3 py-2 font-mono font-semibold border text-lg">
                                {results.eve_actions.measurements[i] !== null
                                  ? results.eve_actions.measurements[i]
                                  : '-'}
                              </td>
                            </>
                          )}
                          <td className="px-3 py-2 font-mono text-lg border">
                            {results.bob_bases[i]}
                          </td>
                          <td className="px-3 py-2 font-mono font-semibold border text-lg">
                            {results.bob_results[i]}
                          </td>
                          <td className="px-3 py-2 border text-center">
                            {basesMatch ? (
                              bitsMatch ? (
                                <span className="text-green-600 font-bold text-xl">
                                  ✓
                                </span>
                              ) : (
                                <span className="text-red-600 font-bold text-xl">
                                  ✗
                                </span>
                              )
                            ) : (
                              <span className="text-gray-400 text-lg">⊘</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-black">
                  Showing {startIndex + 1} to {endIndex} of {results.alice_bits.length} bits
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 text-black rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-1 border rounded-lg ${
                            currentPage === pageNum
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-gray-300 text-gray-800 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 text-black rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Keys Display */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Sifted Keys
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Alice's Key ({results.sifted_key_alice.length} bits)
                  </h3>
                  <div className="font-mono text-sm break-all text-gray-800">
                    {results.sifted_key_alice.join('')}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Bob's Key ({results.sifted_key_bob.length} bits)
                  </h3>
                  <div className="font-mono text-sm break-all text-gray-800">
                    {results.sifted_key_bob.join('')}
                  </div>
                </div>
                <div
                  className={`p-4 rounded-lg border-2 ${
                    results.eve_detected
                      ? 'bg-red-50 border-red-300'
                      : 'bg-green-50 border-green-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Key Agreement Status
                  </h3>
                  <p className="text-sm text-gray-700">
                    {results.eve_detected
                      ? '⚠️ Keys contain errors due to eavesdropping. Communication is INSECURE. Abort and restart with new quantum channel.'
                      : '✓ Keys match with minimal errors. Secure communication channel established.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Info Panel */}
            <div className="bg-indigo-50 rounded-lg shadow-lg p-6 border-2 border-indigo-200">
              <div className="flex items-start gap-3">
                <Info className="text-indigo-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    How BB84 Protocol Works
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>
                      <strong>Step 1:</strong> Alice generates random bits and encoding bases (+ or ×)
                    </li>
                    <li>
                      <strong>Step 2:</strong> Alice encodes bits into quantum states
                    </li>
                    <li>
                      <strong>Step 3:</strong> Quantum transmission (Eve may intercept randomly)
                    </li>
                    <li>
                      <strong>Step 4:</strong> Bob measures with random bases
                    </li>
                    <li>
                      <strong>Step 5:</strong> Basis reconciliation (keep matching bases only)
                    </li>
                    <li>
                      <strong>Step 6:</strong> QBER analysis detects eavesdropping
                    </li>
                  </ul>
                  <div className="mt-3 p-3 bg-white rounded border border-indigo-200">
                    <p className="text-xs text-gray-600">
                      <strong>Security Principle:</strong> Quantum mechanics ensures that Eve's
                      measurement disturbs the quantum states, introducing errors detectable
                      through QBER. Threshold: 11%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}