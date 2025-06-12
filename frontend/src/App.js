import React, { useState, useEffect } from 'react';
import HourlyForecast from './components/HourlyForecast';
import './App.css';

// 버튼 표시용 이름
const stadiumDisplayNames = ["대전", "대구", "수원", "인천", "잠실", "고척", "광주", "부산", "창원"];

// 각 구장의 좌표 정보 (위도, 경도)
const stadiumCoordinates = {
  "대전": { lat: 36.3171, lng: 127.4292, name: "대전한화생명볼파크" },
  "대구": { lat: 35.8411, lng: 128.6814, name: "대구삼성라이온즈파크" },
  "광주": { lat: 35.1683, lng: 126.8892, name: "광주기아챔피언스필드" },
  "인천": { lat: 37.4372, lng: 126.6931, name: "인천SSG랜더스필드" },
  "잠실": { lat: 37.5122, lng: 127.0722, name: "서울종합운동장 야구장" },
  "수원": { lat: 37.2997, lng: 127.0097, name: "수원KT위즈파크" },
  "고척": { lat: 37.4982, lng: 126.8669, name: "고척스카이돔" },
  "부산": { lat: 35.1942, lng: 129.0614, name: "부산사직구장" },
  "창원": { lat: 35.2225, lng: 128.5822, name: "창원NC파크" }
};

// 두 좌표 간의 거리 계산 (Haversine 공식)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // 거리 (km)
};

// 가장 가까운 구장 찾기
const findNearestStadium = (userLat, userLng) => {
  let nearestStadium = "대전"; // 기본값
  let minDistance = Infinity;

  stadiumDisplayNames.forEach(stadium => {
    const coord = stadiumCoordinates[stadium];
    const distance = calculateDistance(userLat, userLng, coord.lat, coord.lng);

    if (distance < minDistance) {
      minDistance = distance;
      nearestStadium = stadium;
    }
  });

  return { stadium: nearestStadium, distance: minDistance };
};

function App() {
  const [selectedStadium, setSelectedStadium] = useState("대전");
  const [locationStatus, setLocationStatus] = useState("위치 확인 중...");
  const [userLocation, setUserLocation] = useState(null);
  const [nearestStadiumInfo, setNearestStadiumInfo] = useState(null);

  // 위치 기반 가까운 구장 찾기
  useEffect(() => {
    const getUserLocation = () => {
      if (!navigator.geolocation) {
        setLocationStatus("위치 서비스를 지원하지 않습니다");
        return;
      }

      setLocationStatus("위치 확인 중...");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          // 가장 가까운 구장 찾기
          const nearest = findNearestStadium(latitude, longitude);
          setNearestStadiumInfo(nearest);
          setSelectedStadium(nearest.stadium);

          setLocationStatus(
            `📍 현재 위치에서 가장 가까운 구장: ${stadiumCoordinates[nearest.stadium].name} (${nearest.distance.toFixed(1)}km)`
          );
        },
        (error) => {
          console.error('위치 정보 가져오기 실패:', error);
          let errorMessage = "위치 정보를 가져올 수 없습니다";

          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "위치 정보를 사용할 수 없습니다.";
              break;
            case error.TIMEOUT:
              errorMessage = "위치 정보 요청 시간이 초과되었습니다.";
              break;
          }

          setLocationStatus(`❌ ${errorMessage}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5분간 캐시된 위치 정보 사용
        }
      );
    };

    getUserLocation();
  }, []);

  // 수동으로 가까운 구장 다시 찾기
  const handleFindNearestStadium = () => {
    console.log("다시찾기 클릭");
    if (!userLocation) {
      alert("현재 위치 정보가 없습니다. 페이지를 새로고침하여 위치 권한을 다시 확인해주세요.");
      return;
    }

    const nearest = findNearestStadium(userLocation.lat, userLocation.lng);
    setNearestStadiumInfo(nearest);
    setSelectedStadium(nearest.stadium);
    setLocationStatus(
      `📍 현재 위치에서 가장 가까운 구장: ${stadiumCoordinates[nearest.stadium].name} (${nearest.distance.toFixed(1)}km)`
    );
  };

  return (
    <div
        className="App"
        style={{ background: 'aliceblue' }}
        >
      <h1>⚾ 야구장별 날씨 예보</h1>

      {/* 위치 정보 상태 표시 */}
      <div style={{
        marginBottom: '16px',
        padding: '8px 12px',
        backgroundColor: userLocation ? '#e8f5e8' : '#fff3cd',
        border: `1px solid ${userLocation ? '#4caf50' : '#ffc107'}`,
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <div>{locationStatus}</div>
        {userLocation && (
          <button
            onClick={handleFindNearestStadium}
            style={{
              marginTop: '6px',
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            🎯 가까운 구장 다시 찾기
          </button>
        )}
      </div>

      <div
        className="button-group"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '16px'
        }}
      >
        {stadiumDisplayNames.map((name) => {
          const isNearest = nearestStadiumInfo && nearestStadiumInfo.stadium === name;

          return (
            <button
              key={name}
              onClick={() => setSelectedStadium(name)}
              className={selectedStadium === name ? 'selected' : ''}
              style={{
                position: 'relative',
                backgroundColor: selectedStadium === name ? '#007bff' :
                               isNearest ? '#e8f5e8' : '#f8f9fa',
                color: selectedStadium === name ? 'white' : 'black',
                border: isNearest ? '2px solid #4caf50' : '1px solid #ddd',
                borderRadius: '4px',
                padding: '8px 4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              title={isNearest ? `가장 가까운 구장 (${nearestStadiumInfo.distance.toFixed(1)}km)` : ''}
            >
              {isNearest && <span style={{ fontSize: '15px', display: 'inline' }}>📍 </span>} {name}

            </button>
          );
        })}
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
            <p>※ 위치 권한 허용 시 가장 가까운 구장이 자동 선택됩니다.</p>
        </div>
      </div>

      <HourlyForecast stadiumShortName={selectedStadium} />
    </div>
  );
}

export default App;