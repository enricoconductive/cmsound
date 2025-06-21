import React, { useEffect, useRef, useState } from 'react';
import './piano.css';

function Piano() {
  const [activeKeys, setActiveKeys] = useState({});
  const [currentOctave, setCurrentOctave] = useState(4);
  const audioContextRef = useRef(null);
  const oscillatorsRef = useRef({});

  const baseFrequencies = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.00,
    A4: 440.00
  };

  const getMultiplier = (octave) => Math.pow(2, octave - 4);

  const keyMap = {
    a: 'C4',
    s: 'D4',
    d: 'E4',
    f: 'F4',
    g: 'G4',
    h: 'A4'
  };

  const playNote = (note) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const frequency = baseFrequencies[note] * getMultiplier(currentOctave);
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    oscillator.start();
    oscillatorsRef.current[note] = oscillator;
  };

  const stopNote = (note) => {
    const osc = oscillatorsRef.current[note];
    if (osc) {
      osc.stop();
      delete oscillatorsRef.current[note];
    }
  };

  const handleKeyDown = (e) => {
    const note = keyMap[e.key];
    if (note && !activeKeys[note]) {
      setActiveKeys((prev) => ({ ...prev, [note]: true }));
      playNote(note);
    }
  };

  const handleKeyUp = (e) => {
    const note = keyMap[e.key];
    if (note) {
      stopNote(note);
      setActiveKeys((prev) => {
        const updated = { ...prev };
        delete updated[note];
        return updated;
      });
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeKeys, currentOctave]);

  const handleMouseDown = (note) => {
    setActiveKeys((prev) => ({ ...prev, [note]: true }));
    playNote(note);
  };

  const handleMouseUp = (note) => {
    stopNote(note);
    setActiveKeys((prev) => {
      const updated = { ...prev };
      delete updated[note];
      return updated;
    });
  };

  const changeOctave = (direction) => {
    setActiveKeys({});
    if (direction === 'up' && currentOctave < 5) {
      setCurrentOctave((o) => o + 1);
    }
    if (direction === 'down' && currentOctave > 3) {
      setCurrentOctave((o) => o - 1);
    }
  };

  const getOctaveLabel = () => {
    return currentOctave === 3 ? 'Lo' : currentOctave === 4 ? 'Mid' : 'Hi';
  };

  return (
    <>
      <div className="octave-controls">
        <button className="octave-button" onClick={() => changeOctave('down')}>−</button>
        <div id="octave-display">{getOctaveLabel()}</div>
        <button className="octave-button" onClick={() => changeOctave('up')}>+</button>
      </div>

      <div className="piano-container">
        {Object.keys(baseFrequencies).map((note) => (
          <div
            key={note}
            className={`white-key ${activeKeys[note] ? 'active' : ''}`}
            onMouseDown={() => handleMouseDown(note)}
            onMouseUp={() => handleMouseUp(note)}
            onTouchStart={() => handleMouseDown(note)}
            onTouchEnd={() => handleMouseUp(note)}
          >
            {note[0]}
          </div>
        ))}
      </div>
    </>
  );
}

export default Piano;
