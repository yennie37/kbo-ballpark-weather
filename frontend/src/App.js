import React, { useState } from 'react';
import HourlyForecast from './components/HourlyForecast';
import './App.css';

// 버튼 표시용 이름
const stadiumDisplayNames = ["대전", "대구", "수원", "인천", "잠실", "고척", "광주", "부산", "창원"];

function App() {
  const [selectedStadium, setSelectedStadium] = useState("대전");

  return (
    <div
        className="App"
        style={{ background: 'aliceblue' }}
        >
      <h1>⚾ 야구장별 날씨 예보</h1>
      <div
        className="button-group"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
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

      <div style={{ marginBottom: '16px' }}>
        <a
          href="https://www.weather.go.kr/w/image/vshrt/rain.do"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}
        >
          📡 강수 초단기 예측 바로가기
        </a>
        <div className="notice-sub"
          style={{color: 'gray', fontStyle: 'italic', fontSize:'small' }}
        >
            <p>※ 정확한 초단기 예측은 위의 링크에서 확인하세요!</p>
            <p>※ 현 화면의 날씨는 30분에 한 번씩 새로 조회됩니다.</p>
        </div>
      </div>

      <HourlyForecast stadiumShortName={selectedStadium} />
    </div>
  );
}

export default App;
