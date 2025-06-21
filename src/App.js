import React, { useState } from 'react';
import './index.css';
import Piano from './instruments/piano/piano';
import Makeymakey from './instruments/makeymakey/makeymakey';

function App() {
  const [instrument, setInstrument] = useState(null);

  if (!instrument) {
    return (
      <div className="menu">
        <button onClick={() => setInstrument('piano')} className="menu-button">🎹 Piano</button>
        <button onClick={() => setInstrument('makey')} className="menu-button">🕹️ MakeyMakey</button>
      </div>
    );
  }

  return instrument === 'piano'
  ? <Piano onBackToMenu={() => setInstrument(null)} />
  : <Makeymakey onBackToMenu={() => setInstrument(null)} />;
}

export default App;
