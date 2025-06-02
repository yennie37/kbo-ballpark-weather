import React, { useEffect, useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './HourlyForecast.css';

const stadiumFullNames = {
  "대전": "대전한화생명볼파크",
  "대구": "대구삼성라이온즈파크",  
  "광주": "광주기아챔피언스필드",  
  "인천": "인천SSG랜더스필드",
  "잠실": "서울종합운동장 야구장",
  "고척": "고척스카이돔",
  "부산": "부산사직구장",
  "창원": "창원NC파크"
};

const HourlyForecast = ({ stadiumShortName }) => {
  const stadiumName = stadiumFullNames[stadiumShortName];
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const nodeRef = useRef(null);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      setSelectedDate((prev) => {
        const currentIndex = dateKeys.findIndex((d) => d === prev);
        return currentIndex < dateKeys.length - 1 ? dateKeys[currentIndex + 1] : prev;
      });
    },
    onSwipedRight: () => {
      setSelectedDate((prev) => {
        const currentIndex = dateKeys.findIndex((d) => d === prev);
        return currentIndex > 0 ? dateKeys[currentIndex - 1] : prev;
      });
    },
    trackMouse: true
  });

  useEffect(() => {
    if (!stadiumName) return;
    setLoading(true);

    const API_BASE = process.env.REACT_APP_API_BASE;
    //console.log("REACT_APP_API_BASE : " + process.env.REACT_APP_API_BASE);

    fetch(`${API_BASE}/api/weather/forecast?stadium=${encodeURIComponent(stadiumName)}`)
      .then((res) => res.json())
      .then((data) => {
        setForecast(data);
        setLoading(false);
        const today = new Date().toISOString().substring(0, 10);
        setSelectedDate(today);
      })
      .catch((err) => {
        console.error('❌ 시간별 날씨 로딩 실패:', err);
        setForecast([]);
        setLoading(false);
      });
  }, [stadiumName]);

  if (!stadiumName) return <p>⚠️ 잘못된 구장 이름입니다.</p>;

  const grouped = Array.isArray(forecast)
    ? forecast.reduce((acc, item) => {
        const date = item.time.substring(0, 10);
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
      }, {})
    : {};

  const dateKeys = Object.keys(grouped);
  const currentData = selectedDate && grouped[selectedDate];

  if (loading) return <p>☁️ 날씨 정보를 불러오는 중입니다...</p>;
  if (!forecast.length) return <p>⚠️ 기상 데이터가 없습니다.</p>;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    });
  };

  return (
    <div>
      <h2>🏟️ {stadiumName}</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '8px',
        marginBottom: '16px'
      }}>
        {dateKeys.map((date) => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            style={{
              padding: '4px 6px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: selectedDate === date ? '#007bff' : '#e0e0e0',
              color: selectedDate === date ? '#fff' : '#000',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            {formatDate(date)}
          </button>
        ))}
      </div>

      <TransitionGroup {...swipeHandlers}>
        <CSSTransition key={selectedDate} classNames="fade" timeout={300} nodeRef={nodeRef}>
          <div ref={nodeRef} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentData?.map((item, idx) => {
              const hour = item.time.substring(11, 16);
              const rain = item.rain?.toFixed(1) ?? '0.0';
              const pop = ((item.pop ?? 0) * 100).toFixed(0);

              const isRainy = parseFloat(rain) >= 2.0;
              const isHeavyRain = parseFloat(rain) >= 5.0;
              const isHighPop = parseInt(pop) >= 60;
              const isLowPop = parseInt(pop) < 20;

              return (
                <div
                  key={idx}
                  style={{
                    fontSize: '14px',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    backgroundColor: '#fff',
                    color: isLowPop ? '#888' : 'inherit',
                  }}
                  title={`예보 시간: ${item.time}`}
                >
                  <div><strong>🕘 {hour}</strong></div>
                  <div>🌡️ {item.temp.toFixed(1)}℃</div>
                  <div>🌦️ {item.weather}</div>
                  <div
                    style={{ color: isHighPop ? 'red' : isLowPop ? '#999' : 'inherit' }}
                  >
                    🌧️ 강수확률: {pop}%
                  </div>
                  <div style={{ color: isLowPop ? '#999' : 'inherit' }}>
                    💧 강수량: {rain}mm {isRainy && <span>⚠️</span>}
                  </div>
                  {isHeavyRain && (
                    <div style={{ color: 'red', fontWeight: 'bold' }}>
                      취소/우천 중단 우려 ⚠️
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
};

export default HourlyForecast;
