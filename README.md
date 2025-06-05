KBO Ballpark Weather Application
# KBO 야구장 날씨 예보 웹앱

한국 KBO 리그 야구장을 대상으로 **시간대별 날씨 예보**를 제공하는 웹 애플리케이션입니다.  
**돔구장 여부에 따라 경기 영향 문구 출력**,  
**날씨 상태에 따른 아이콘**,  
**클라이언트 캐싱**,  
**모바일 스와이프 지원** 등 다양한 기능을 포함하고 있어요.

👉 [배포된 사이트 보기](https://kbo-ballpark-weather.vercel.app)

---

## 주요 기술 스택

- **Frontend**: React, CSS Grid, react-swipeable, react-transition-group
- **Backend**: Spring Boot (Java)
- **API**: [OpenWeatherMap Forecast API](https://openweathermap.org/forecast5) (3시간 단위 예보)
- **호스팅**: Vercel (프론트), Railway (백엔드)
- **캐싱**: localStorage 기반 클라이언트 캐싱

---

## 기능 소개

### 주요 기능
- 각 구장의 **시간대별 기온 / 날씨 / 강수확률 / 강수량** 예보
- **돔구장 여부**에 따라 우천 취소 여부 알림 분기 처리
- **날씨 상태별 이모지 및 배경 강조**
- **모바일 스와이프**로 날짜 변경
- **클라이언트 캐싱 (30분 유효)** 으로 API 호출 최소화
- **최대 5일치 예보** 표시
- **날짜별 예보가 없을 경우 메시지 출력**
- **주소 표시 및 정식 구장명 제공**

### ⚾ 지원 구장 목록

| 간단명칭   | 정식명칭                     | 비고     |
|------------|-------------------------------|----------|
| 대전       | 대전한화생명볼파크           |          |
| 대구       | 대구삼성라이온즈파크         |          |
| 광주       | 광주기아챔피언스필드         |          |
| 인천       | 인천SSG랜더스필드            |          |
| 수원       | 수원KT위즈파크               |          |
| 잠실       | 서울종합운동장 야구장        |          |
| 고척       | 고척스카이돔                 | 돔구장   |
| 부산       | 부산사직구장                 |          |
| 창원       | 창원NC파크                   |          |

---

## 🧩 프로젝트 구조

📦 ballpark-weather/

├── frontend/

│ ├── src/

│ │ ├── App.js

│ │ ├── HourlyForecast.js

│ │ ├── Weather.js

│ │ └── utils/apiBase.js

│ ├── public/index.html

│ └── package.json

│

├── backend/

│ ├── src/main/java/.../WeatherController.java

│ └── build.gradle or pom.xml

---

## 실행 방법

### 1. 프론트엔드 (React)
```bash
cd frontend
npm install
npm run start
```

### 2. 백엔드 (Spring Boot)
```bash
cd backend
./gradlew bootRun
```

---

### API 예시
GET /api/weather/forecast?stadium=대전한화생명볼파크

---

개발자 이예은 Yeeun Lee
GitHub: @yennie37
프로젝트 목적: KBO 팬들을 위한 실시간 날씨 확인 앱
