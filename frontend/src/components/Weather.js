import React, { useEffect, useState } from 'react';
import { API_BASE } from '../utils/apiBase';

const Weather = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('${API_BASE}/api/weather')  // 💡 Spring Boot API 주소
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error('날씨 데이터를 불러오는 중 오류 발생:', err));
  }, []);

  if (!data) return <p>🌥️ 날씨 정보를 불러오는 중입니다...</p>;
  if (data.error) return <p>⚠️ 오류: {data.error}</p>;

  return (
    <div>
      <h2>📍 대전한화생명볼파크 날씨</h2>
      <p>🌡️ 온도: {data.temp} °C</p>
      <p>🌧️ 날씨 상태: {data.weather}</p>
    </div>
  );
};

export default Weather;
