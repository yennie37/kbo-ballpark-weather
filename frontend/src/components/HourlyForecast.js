import React, { useEffect, useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './HourlyForecast.css';
import { API_BASE } from '../utils/apiBase';

const stadiumFullNames = {
  "대전": "대전한화생명볼파크",
  "대구": "대구삼성라이온즈파크",
  "광주": "광주기아챔피언스필드",
  "인천": "인천SSG랜더스필드",
  "잠실": "서울종합운동장 야구장",
  "수원": "수원KT위즈파크",
  "고척": "고척스카이돔",
  "부산": "부산사직구장",
  "창원": "창원NC파크"
};

const stadiumAddresses = {
  "대전한화생명볼파크": "대전 중구 부사동 65 (부사동)",
  "대구삼성라이온즈파크": "대구 수성구 야구전설로 1 (연호동)",
  "광주기아챔피언스필드": "광주 북구 서림로 10 (임동)",
  "인천SSG랜더스필드": "인천 미추홀구 매소홀로 618 (문학동)",
  "수원KT위즈파크": "경기 수원시 장안구 경수대로 893 (조원동)",
  "서울종합운동장 야구장": "서울 송파구 올림픽로 25 (잠실동)",
  "고척스카이돔": "서울 구로구 경인로 430 (고척동)",
  "부산사직구장": "부산 동래구 사직로 45 (사직동)",
  "창원NC파크": "경남 창원시 마산회원구 삼호로 63 (양덕동)"
};

// 날씨 상태별 아이콘 매핑
const getWeatherIcon = (weatherText) => {
  const weather = weatherText.toLowerCase();

  if (weather.includes('맑') || weather.includes('clear')) {
    return '☀️';
  } else if (weather.includes('비') || weather.includes('rain')) {
    return '🌧️';
  } else if (weather.includes('소나기') || weather.includes('shower')) {
    return '🌦️';
  } else if (weather.includes('천둥') || weather.includes('thunder')) {
    return '⛈️';
  } else if (weather.includes('눈') || weather.includes('snow')) {
    return '❄️';
  } else if (weather.includes('안개') || weather.includes('mist') || weather.includes('fog')) {
    return '🌫️';
  } else if (weather.includes('흐') || weather.includes('cloud')) {
    return '☁️';
  } else if (weather.includes('구름') && (weather.includes('조금') || weather.includes('few'))) {
    return '🌤️';
  } else if (weather.includes('구름') && (weather.includes('많') || weather.includes('scatter'))) {
    return '⛅';
  } else {
    // 기본값
    return '🌤️';
  }
};

// 캐시 관리 유틸리티
const CacheManager = {
  // 캐시 키 생성
  getCacheKey: (stadiumName) => `weather_cache_${stadiumName}`,

  // 캐시된 데이터 가져오기
  getCache: (stadiumName) => {
    try {
      if (typeof localStorage === 'undefined') return null;

      const cacheKey = CacheManager.getCacheKey(stadiumName);
      const cached = localStorage.getItem(cacheKey);

      if (!cached) return null;

      const parsedCache = JSON.parse(cached);
      const now = Date.now();
      const cacheAge = now - parsedCache.timestamp;
      const CACHE_DURATION = 30 * 60 * 1000; // 30분

      // 캐시가 만료되었는지 확인
      if (cacheAge > CACHE_DURATION) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      console.log(`📦 캐시에서 데이터 로드: ${stadiumName} (캐시 나이: ${Math.round(cacheAge / 60000)}분)`);
      return parsedCache.data;

    } catch (error) {
      console.error('캐시 읽기 오류:', error);
      return null;
    }
  },

  // 데이터를 캐시에 저장
  setCache: (stadiumName, data) => {
    try {
      if (typeof localStorage === 'undefined') return;

      const cacheKey = CacheManager.getCacheKey(stadiumName);
      const cacheData = {
        data: data,
        timestamp: Date.now()
      };

      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log(`💾 캐시에 데이터 저장: ${stadiumName}`);

    } catch (error) {
      console.error('캐시 저장 오류:', error);
    }
  },

  // 특정 구장의 캐시 삭제
  clearCache: (stadiumName) => {
    try {
      if (typeof localStorage === 'undefined') return;

      const cacheKey = CacheManager.getCacheKey(stadiumName);
      localStorage.removeItem(cacheKey);
      console.log(`🗑️ 캐시 삭제: ${stadiumName}`);

    } catch (error) {
      console.error('캐시 삭제 오류:', error);
    }
  },

  // 모든 날씨 캐시 삭제
  clearAllCache: () => {
    try {
      if (typeof localStorage === 'undefined') return;

      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('weather_cache_')) {
          localStorage.removeItem(key);
        }
      });
      console.log('🗑️ 모든 날씨 캐시 삭제 완료');

    } catch (error) {
      console.error('전체 캐시 삭제 오류:', error);
    }
  }
};

const HourlyForecast = ({ stadiumShortName }) => {
  const stadiumName = stadiumFullNames[stadiumShortName];
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  //const [cacheStatus, setCacheStatus] = useState(''); // 캐시 상태 표시용
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

  // 캐시를 고려한 데이터 로딩
  const loadForecastData = async (stadiumName, forceRefresh = false) => {
    setLoading(true);
    //setCacheStatus('');

    // 강제 새로고침이 아닌 경우 캐시 먼저 확인
    if (!forceRefresh) {
      const cachedData = CacheManager.getCache(stadiumName);
      if (cachedData) {
        setForecast(cachedData);
        //setCacheStatus('📦 캐시된 데이터');
        setLoading(false);

        // 날짜 설정
        const today = new Date().toISOString().substring(0, 10);
        const availableDates = Array.from(
          new Set(cachedData.map(item => item.time.substring(0, 10)))
        ).filter(date => new Date(date) >= new Date(today));

        const hasToday = availableDates.includes(today);
        setSelectedDate(hasToday ? today : availableDates[0]);

        return;
      }
    }

    // 캐시에 없거나 강제 새로고침인 경우 API 호출
    try {
      //setCacheStatus('🌐 서버에서 로딩 중...');

      const response = await fetch(`${API_BASE}/api/weather/forecast?stadium=${encodeURIComponent(stadiumName)}`);
      const data = await response.json();
      console.log("API_BASE : " + `${API_BASE}`);

      setForecast(data);

      // 새로운 데이터를 캐시에 저장
      CacheManager.setCache(stadiumName, data);
      //setCacheStatus('🌐 새 데이터 로드됨');

      // 날짜 설정
      const today = new Date().toISOString().substring(0, 10);
      const availableDates = Array.from(
        new Set(data.map(item => item.time.substring(0, 10)))
      ).filter(date => new Date(date) >= new Date(today));

      const hasToday = availableDates.includes(today);
      setSelectedDate(hasToday ? today : availableDates[0]);

    } catch (error) {
      console.error('❌ 시간별 날씨 로딩 실패:', error);
      setForecast([]);
      //setCacheStatus('❌ 로딩 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!stadiumName) return;
    loadForecastData(stadiumName);
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

  const dateKeys = Object.keys(grouped)
    .filter(date => new Date(date) >= new Date(new Date().toISOString().substring(0, 10)))
    .slice(0, 5);
  const currentData = selectedDate && grouped[selectedDate];
  const filteredData = currentData?.filter((item) => {
    const hour = parseInt(item.time.substring(11, 13), 10);
    return hour >= 8 && hour <= 23;
  });

  if (loading) return <p>☁️ 날씨 정보를 불러오는 중입니다...</p>;
  if (!forecast.length) return <p>⚠️ 예보 데이터가 없습니다.</p>;

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h2 style={{ margin: 0 }}>🏟️ {stadiumName}</h2>
      </div>

      <p style={{ fontSize: '14px', color: 'gray', marginTop: '-8px', marginBottom: '16px' }}>
        📍 {stadiumAddresses[stadiumName]}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
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
           {filteredData && filteredData.length > 0 ? (
             filteredData.map((item, idx) => {
               const hour = item.time.substring(11, 16);
               const rain = item.rain?.toFixed(1) ?? '0.0';
               const pop = ((item.pop ?? 0) * 100).toFixed(0);
               const weatherIcon = getWeatherIcon(item.weather);

               const rainAmount = parseFloat(rain);
               const isRainy = rainAmount >= 3.0;  // 경기 영향 가능: 3.0mm 이상
               const isHeavyRain = rainAmount >= 5.0;  // 경기 취소 우려: 5mm 이상
               const isHighPop = parseInt(pop) >= 60;
               const isLowPop = parseInt(pop) < 20;

               // 강수 위험도별 배경색 결정
               const getBackgroundColor = () => {
                 if (isHeavyRain) return '#ffebee'; // 연한 빨간색 - 경기 취소 우려
                 if (isRainy) return '#fff8e1';     // 연한 노란색 - 경기 영향 가능
                 return '#fff';                      // 기본 흰색
               };

               const getBorderColor = () => {
                 if (isHeavyRain) return '#f44336'; // 빨간색 테두리
                 if (isRainy) return '#ff9800';     // 주황색 테두리
                 return '#ccc';                      // 기본 회색
               };

               return (
                 <div
                   key={idx}
                   style={{
                     fontSize: '14px',
                     padding: '10px',
                     border: `2px solid ${getBorderColor()}`,
                     borderRadius: '6px',
                     backgroundColor: getBackgroundColor(),
                     color: isLowPop ? '#888' : 'inherit',
                     lineHeight: '1.6',
                     marginBottom: '8px',
                     boxShadow: isHeavyRain ? '0 2px 8px rgba(244, 67, 54, 0.2)' :
                               isRainy ? '0 2px 8px rgba(255, 152, 0, 0.2)' : 'none'
                   }}
                   title={`예보 시간: ${item.time}${isHeavyRain ? ' - 경기 취소 우려!' : isRainy ? ' - 경기 영향 가능' : ''}`}
                 >
                   <div><strong>🕘 {hour}</strong></div>
                   <div style={{ marginTop: '4px' }}>🌡️ {item.temp.toFixed(1)}℃</div>
                   <div style={{
                     marginTop: '4px',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '6px',
                     fontSize: '16px'
                   }}>
                     <span style={{ fontSize: '18px' }}>{weatherIcon}</span>
                     <span>{item.weather}</span>
                   </div>
                   <div style={{ marginTop: '4px', color: isHighPop ? 'red' : isLowPop ? '#999' : 'inherit' }}>
                     🌧️ 강수확률: {pop}%
                   </div>
                   <div style={{ marginTop: '4px', color: isLowPop ? '#999' : 'inherit' }}>
                     💧 강수량: {rain}mm
                     {isHeavyRain && <span style={{ color: 'red', fontWeight: 'bold' }}> 🚨 위험</span>}
                     {isRainy && !isHeavyRain && <span style={{ color: '#ff9800', fontWeight: 'bold' }}> ⚠️ 주의</span>}
                   </div>
                   {isHeavyRain && (
                     <div style={{
                       marginTop: '6px',
                       color: '#d32f2f',
                       fontWeight: 'bold',
                       backgroundColor: '#ffcdd2',
                       padding: '4px 6px',
                       borderRadius: '4px',
                       textAlign: 'center'
                     }}>
                       🚨 경기 취소/우천 중단 우려 🚨
                     </div>
                   )}
                   {isRainy && !isHeavyRain && (
                     <div style={{
                       marginTop: '6px',
                       color: '#f57c00',
                       fontWeight: 'bold',
                       backgroundColor: '#ffe0b2',
                       padding: '4px 6px',
                       borderRadius: '4px',
                       textAlign: 'center'
                     }}>
                       ⚠️ 경기 영향 가능성
                     </div>
                   )}
                 </div>
               );
             })
           ) : (
             <div style={{ padding: '16px', fontSize: '15px', color: '#666', textAlign: 'center' }}>
               📭 선택하신 날짜의 예보 데이터가 없습니다.
             </div>
           )}
         </div>
       </CSSTransition>
     </TransitionGroup>
    </div>
  );
};

export default HourlyForecast;