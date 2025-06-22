import React, { useEffect, useRef, useState, useCallback } from 'react';
import HomeButton from '../../components/homebutton';
import './makeymakey.css';

const baseFrequencies = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392.00,
  A4: 440.00
};

const keyMap = {
  a: 'C4',
  ArrowLeft: 'C4',
  s: 'D4',
  ArrowUp: 'D4',
  d: 'E4',
  ArrowRight: 'E4',
  g: 'G4',
  ArrowDown: 'G4',
  h: 'A4',
  ' ': 'A4'
};

function MakeyLevel1({ onBackToMenu }) {
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
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      osc.stop(now + 0.1);
      delete oscillatorsRef.current[note];
      delete gainNodesRef.current[note];
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
  const note = keyMap[e.key];
  if (note && !activeKeys[note]) {
    e.preventDefault(); // 🛑 prevent spacebar from activating buttons
    setActiveKeys((prev) => ({ ...prev, [note]: true }));
    playNote(note);
  }
}, [activeKeys, playNote]);

  const handleKeyUp = useCallback((e) => {
  const note = keyMap[e.key];
  if (note) {
    e.preventDefault(); // 🛑 prevent spacebar from activating buttons
    stopNote(note);
    setActiveKeys((prev) => {
      const updated = { ...prev };
      delete updated[note];
      return updated;
    });
  }
}, [stopNote]);


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
    Object.keys(oscillatorsRef.current).forEach(stopNote);
    setActiveKeys({});
  };

  const changeOctave = (direction) => {
    stopAllNotes();
    if (direction === 'up' && currentOctave < 5) setCurrentOctave((o) => o + 1);
    if (direction === 'down' && currentOctave > 3) setCurrentOctave((o) => o - 1);
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

      <div className="makey-container">
        <div className="dpad">
          <div className={`arrow up ${activeKeys['D4'] ? 'active' : ''}`}
               onMouseDown={() => handleMouseDown('D4')}
               onMouseUp={() => handleMouseUp('D4')}
               onTouchStart={() => handleMouseDown('D4')}
               onTouchEnd={() => handleMouseUp('D4')}>
            ↑
          </div>
          <div className={`arrow left ${activeKeys['C4'] ? 'active' : ''}`}
               onMouseDown={() => handleMouseDown('C4')}
               onMouseUp={() => handleMouseUp('C4')}
               onTouchStart={() => handleMouseDown('C4')}
               onTouchEnd={() => handleMouseUp('C4')}>
            ←
          </div>
          <div className={`arrow right ${activeKeys['E4'] ? 'active' : ''}`}
               onMouseDown={() => handleMouseDown('E4')}
               onMouseUp={() => handleMouseUp('E4')}
               onTouchStart={() => handleMouseDown('E4')}
               onTouchEnd={() => handleMouseUp('E4')}>
            →
          </div>
          <div className={`arrow down ${activeKeys['G4'] ? 'active' : ''}`}
               onMouseDown={() => handleMouseDown('G4')}
               onMouseUp={() => handleMouseUp('G4')}
               onTouchStart={() => handleMouseDown('G4')}
               onTouchEnd={() => handleMouseUp('G4')}>
            ↓
          </div>
        </div>
        <div className={`space-button ${activeKeys['A4'] ? 'active' : ''}`}
             onMouseDown={() => handleMouseDown('A4')}
             onMouseUp={() => handleMouseUp('A4')}
             onTouchStart={() => handleMouseDown('A4')}
             onTouchEnd={() => handleMouseUp('A4')}>
          ⎵
        </div>
      </div>
    </>
  );
}

export default MakeyLevel1;
