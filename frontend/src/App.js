import React, { useState } from 'react';
import HourlyForecast from './components/HourlyForecast';
import './App.css';

// 버튼 표시용 이름
const stadiumDisplayNames = ["대전", "대구", "광주", "인천", "서울(잠실)", "서울(고척)", "부산", "창원"];

function App() {
  const [selectedStadium, setSelectedStadium] = useState("대전");

  return (
    <div className="App">
      <h1>⚾ 야구장별 날씨 예보</h1>

      <div
        className="button-group"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginBottom: '16px'
        }}
      >
        {stadiumDisplayNames.map((name) => (
          <button
            key={name}
            onClick={() => setSelectedStadium(name)}
            className={selectedStadium === name ? 'selected' : ''}
          >
            {name}
          </button>
        ))}
      </div>

      <HourlyForecast stadiumShortName={selectedStadium} />
    </div>
  );
}

export default App;
