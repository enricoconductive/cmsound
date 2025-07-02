// MakeyLevel2.js – plays chords on arrow keys with crocodile clip visuals and pastel colours
import React, { useEffect, useRef, useState, useCallback } from 'react';
import HomeButton from '../../components/homebutton';
import './makeymakey.css';

const baseFrequencies = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  B4: 493.88,
  D5: 587.33
};

const chordMap = {
  ArrowLeft: ['C4', 'E4', 'G4'],
  a: ['C4', 'E4', 'G4'],
  ArrowUp: ['D4', 'F4', 'A4'],
  s: ['D4', 'F4', 'A4'],
  ArrowRight: ['E4', 'G4', 'B4'],
  d: ['E4', 'G4', 'B4'],
  ArrowDown: ['G4', 'B4', 'D5'],
  g: ['G4', 'B4', 'D5']
};

const visualKeyMap = {
  ArrowLeft: 'ArrowLeft',
  a: 'ArrowLeft',
  ArrowUp: 'ArrowUp',
  s: 'ArrowUp',
  ArrowRight: 'ArrowRight',
  d: 'ArrowRight',
  ArrowDown: 'ArrowDown',
  g: 'ArrowDown'
};

function MakeyLevel2({ onBackToMenu }) {
  const [activeKey, setActiveKey] = useState(null);
  const [currentOctave, setCurrentOctave] = useState(4);
  const audioContextRef = useRef(null);
  const oscillatorsRef = useRef({});
  const gainNodesRef = useRef({});

  const getMultiplier = (octave) => Math.pow(2, octave - 4);

  const stopAllNotes = useCallback(() => {
    Object.keys(oscillatorsRef.current).forEach(note => {
      const osc = oscillatorsRef.current[note];
      const gainNode = gainNodesRef.current[note];
      if (osc && gainNode) {
        const now = audioContextRef.current.currentTime;
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
        osc.stop(now + 0.1);
      }
    });
    oscillatorsRef.current = {};
    gainNodesRef.current = {};
  }, []);

  const playChord = useCallback((notes) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const audioCtx = audioContextRef.current;
    stopAllNotes();

    notes.forEach(note => {
      const frequency = baseFrequencies[note] * getMultiplier(currentOctave);
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillatorsRef.current[note] = oscillator;
      gainNodesRef.current[note] = gainNode;
    });
  }, [currentOctave, stopAllNotes]);

  const handleKeyDown = useCallback((e) => {
    const chord = chordMap[e.key];
    const visualKey = visualKeyMap[e.key];
    if (chord && visualKey && activeKey !== visualKey) {
      e.preventDefault();
      setActiveKey(visualKey);
      playChord(chord);
    }
  }, [activeKey, playChord]);

  const handleKeyUp = useCallback((e) => {
    const chord = chordMap[e.key];
    const visualKey = visualKeyMap[e.key];
    if (chord && visualKey) {
      e.preventDefault();
      stopAllNotes();
      setActiveKey(null);
    }
  }, [stopAllNotes]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const handleMouseDown = (key) => {
    setActiveKey(key);
    playChord(chordMap[key]);
  };

  const handleMouseUp = () => {
    stopAllNotes();
    setActiveKey(null);
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

      <div className="clip-row">
        <div className={`clip left-clip ${activeKey === 'ArrowLeft' ? 'active' : ''}`} onMouseDown={() => handleMouseDown('ArrowLeft')} onMouseUp={handleMouseUp} onTouchStart={() => handleMouseDown('ArrowLeft')} onTouchEnd={handleMouseUp}>
          <span className="arrow-label">←</span>
          {activeKey === 'ArrowLeft' && <div className="note-cards"><div className="note-card"></div><div className="note-card"></div><div className="note-card"></div></div>}
        </div>
        <div className={`clip up-clip ${activeKey === 'ArrowUp' ? 'active' : ''}`} onMouseDown={() => handleMouseDown('ArrowUp')} onMouseUp={handleMouseUp} onTouchStart={() => handleMouseDown('ArrowUp')} onTouchEnd={handleMouseUp}>
          <span className="arrow-label">↑</span>
          {activeKey === 'ArrowUp' && <div className="note-cards"><div className="note-card"></div><div className="note-card"></div><div className="note-card"></div></div>}
        </div>
        <div className={`clip right-clip ${activeKey === 'ArrowRight' ? 'active' : ''}`} onMouseDown={() => handleMouseDown('ArrowRight')} onMouseUp={handleMouseUp} onTouchStart={() => handleMouseDown('ArrowRight')} onTouchEnd={handleMouseUp}>
          <span className="arrow-label">→</span>
          {activeKey === 'ArrowRight' && <div className="note-cards"><div className="note-card"></div><div className="note-card"></div><div className="note-card"></div></div>}
        </div>
        <div className={`clip down-clip ${activeKey === 'ArrowDown' ? 'active' : ''}`} onMouseDown={() => handleMouseDown('ArrowDown')} onMouseUp={handleMouseUp} onTouchStart={() => handleMouseDown('ArrowDown')} onTouchEnd={handleMouseUp}>
          <span className="arrow-label">↓</span>
          {activeKey === 'ArrowDown' && <div className="note-cards"><div className="note-card"></div><div className="note-card"></div><div className="note-card"></div></div>}
        </div>
      </div>
    </>
  );
}

export default MakeyLevel2;
