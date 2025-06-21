import HomeButton from '../../components/homebutton';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import './piano.css';

// Move constants outside the component
const baseFrequencies = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
};

const keyMap = {
  a: 'C4',
  s: 'D4',
  d: 'E4',
  f: 'F4',
  g: 'G4',
  h: 'A4',
};

function Piano( {onBackToMenu}) {
  const [activeKeys, setActiveKeys] = useState({});
  const [currentOctave, setCurrentOctave] = useState(4);
  const audioContextRef = useRef(null);
  const oscillatorsRef = useRef({});
  const gainNodesRef = useRef({});

  const getMultiplier = (octave) => Math.pow(2, octave - 4);

  const playNote = useCallback((note) => {
  if (!audioContextRef.current) {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }

  const audioCtx = audioContextRef.current;
  const frequency = baseFrequencies[note] * getMultiplier(currentOctave);

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;

  // Set a lower initial volume to avoid clipping
  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();

  oscillatorsRef.current[note] = oscillator;
  gainNodesRef.current[note] = gainNode;
}, [currentOctave]);


const stopNote = useCallback((note) => {
  const osc = oscillatorsRef.current[note];
  const gainNode = gainNodesRef.current[note];

  if (osc && gainNode) {
    const now = audioContextRef.current.currentTime;
    
    // Smooth fade out over 0.1s
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    // Stop oscillator after fade out
    osc.stop(now + 0.1);

    // Clean up
    delete oscillatorsRef.current[note];
    delete gainNodesRef.current[note];
  }
}, []);

  const handleKeyDown = useCallback(
    (e) => {
      const note = keyMap[e.key];
      if (note && !activeKeys[note]) {
        setActiveKeys((prev) => ({ ...prev, [note]: true }));
        playNote(note);
      }
    },
    [activeKeys, playNote]
  );

  const handleKeyUp = useCallback(
    (e) => {
      const note = keyMap[e.key];
      if (note) {
        stopNote(note);
        setActiveKeys((prev) => {
          const updated = { ...prev };
          delete updated[note];
          return updated;
        });
      }
    },
    [stopNote]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

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

  const stopAllNotes = () => {
  Object.keys(oscillatorsRef.current).forEach((note) => {
    stopNote(note);
  });
  setActiveKeys({});
};

  const changeOctave = (direction) => {
  stopAllNotes(); // Prevent stuck notes when switching octaves
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
    <HomeButton onHome={onBackToMenu} />
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
