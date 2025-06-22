// Makeymakey.js (parent controller)
import React, { useState } from 'react';
import './makeymakey.css';
import HomeButton from '../../components/homebutton';
import MakeyLevel1 from './MakeyLevel1';
import MakeyLevel2 from './MakeyLevel2';
import MakeyLevel3 from './MakeyLevel3';
import MakeyLevel4 from './MakeyLevel4';

function Makeymakey({ onBackToMenu }) {
  const [level, setLevel] = useState(1);

  const renderLevel = () => {
    switch (level) {
      case 1:
        return <MakeyLevel1 onBackToMenu={onBackToMenu} />;
      case 2:
        return <MakeyLevel2 onBackToMenu={onBackToMenu} />;
      case 3:
        return <MakeyLevel3 onBackToMenu={onBackToMenu} />;
      case 4:
        return <MakeyLevel4 onBackToMenu={onBackToMenu} />;
      default:
        return <MakeyLevel1 onBackToMenu={onBackToMenu} />;
    }
  };

  return (
    <>
      <HomeButton onHome={onBackToMenu} />
      <div className="level-selector">
        {[1, 2, 3, 4].map((lvl) => (
          <button
            key={lvl}
            className={`level-button ${level === lvl ? 'active' : ''}`}
            onClick={() => setLevel(lvl)}
          >
            {lvl}
          </button>
        ))}
      </div>
      {renderLevel()}
    </>
  );
}

export default Makeymakey;
