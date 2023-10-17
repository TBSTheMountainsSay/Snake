import React from 'react';
import './css/reset.scss';
import './css/global.scss';
import './App.css';
import Map from './features/Map/Map';
import { MAP_HEIGHT, MAP_WIDTH } from './consts/consts';

function App() {
  return (
    <div className="App">
      <Map width={MAP_WIDTH} height={MAP_HEIGHT} />
    </div>
  );
}

export default App;
