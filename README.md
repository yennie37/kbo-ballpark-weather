# ballpark-weather
KBO Ballpark Weather Application

# KBO Ballpark Weather ⚾🌤️

KBO 리그 야구 팬들을 위한 야구장 날씨 앱입니다.  
전국 주요 구장을 선택하면, 해당 구장의 시간대별 날씨 예보를 확인할 수 있습니다.  
React 기반의 웹앱이며, Capacitor를 이용해 Android 앱으로도 제작되었습니다.

---

## 📱 배포 주소 (Web)

👉 [https://kbo-ballpark-weather.vercel.app](https://kbo-ballpark-weather.vercel.app)

---

## 🛠 기술 스택

- React (Create React App)
- JavaScript
- Capacitor (Android 앱 래핑)
- Vercel (프론트엔드 배포)
- GitHub + Railway (CI/CD 및 백엔드 관리)
- OpenWeather 5-day/3-hour Forecast API (날씨 데이터)

---

## 🌐 사용한 날씨 API

- OpenWeather API (Forecast 5 Days / 3 Hour step)
- API 예시:

https://api.openweathermap.org/data/2.5/forecast?lat=%.4f&lon=%.4f&units=metric&appid={API_KEY}&lang=kr

- 구장별 위도, 경도를 활용해 시간대별 예보를 받아옴
- 섭씨 단위(metric) + 한국어(lang=kr) 설정

---

## 🧩 주요 기능

- ⚾ 구장 선택: 대전, 잠실, 고척, 부산, 대구, 창원, 광주, 인천
- 🕗 시간대별 날씨 예보 (08시 ~ 24시)
- 🌦️ 날씨 아이콘, 온도, 상태 텍스트 표시
- 🧭 기본 구장: 대전 한화생명 이글스 파크
- 📲 Capacitor로 감싼 Android 앱도 제공

---

## 🗺️ 설치 및 실행

### 로컬 실행

```bash
cd frontend
npm install
npm start
```

### 빌드
```bash
npm run build
```

### 📦 Android 앱 빌드 (Capacitor)
```bash
npx cap add android
npx cap copy
npx cap open android
```

## 📌 TODO (계획 중인 기능)
 즐겨찾는 구장 저장 기능 or 현재 있는 위치 우선 출력 기능
 야구 일정/예매 정보와 연동
 iOS 빌드 (macOS 환경 필요)

## 👩‍💻 개발자
이예은 (Yeeun Lee)
- 야구, UX를 좋아하는 개발자 ⚾☀️
