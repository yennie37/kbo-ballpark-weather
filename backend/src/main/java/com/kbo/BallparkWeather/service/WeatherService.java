package com.kbo.BallparkWeather.service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class WeatherService {

    // 구장별 캐시 저장소: 구장 이름 -> 날씨 정보 리스트
    private final Map<String, List<Map<String, Object>>> forecastCache = new HashMap<>();

    private final Map<String, double[]> coordinates = Map.of(
            "대전한화생명볼파크", new double[]{36.3171, 127.4285},
            "대구삼성라이온즈파크", new double[]{35.8412, 128.6811},
            "광주기아챔피언스필드", new double[]{35.1683, 126.8886},
            "인천SSG랜더스필드", new double[]{37.4350, 126.6985},
            "서울종합운동장 야구장", new double[]{37.5121, 127.0716},
            "수원KT위즈파크", new double[]{37.2997, 127.0095},
            "고척스카이돔", new double[]{37.4982, 126.8671},
            "부산사직구장", new double[]{35.1944, 129.0592},
            "창원NC파크", new double[]{35.2271, 128.6816}
    );

    // 30분마다 실행: 모든 구장의 날씨 데이터를 외부 API로부터 갱신
    @Scheduled(fixedRate = 30 * 60 * 1000)
    public void fetchAllStadiumForecasts() {
        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        System.out.println("🕒 [SCHEDULED] " + now + " - 날씨 갱신 시작");

        for (String stadium : coordinates.keySet()) {
            try {
                List<Map<String, Object>> data = callExternalApi(stadium);
                forecastCache.put(stadium, data);
                System.out.println("✅ " + stadium + " 날씨 갱신 완료");
            } catch (Exception e) {
                System.err.println("❌ " + stadium + " 갱신 실패: " + e.getMessage());
            }
        }
    }


    // 클라이언트에서 요청한 구장에 대한 날씨 반환
    public List<Map<String, Object>> getForecastForStadium(String stadiumName) {
        return forecastCache.getOrDefault(stadiumName, Collections.emptyList());
    }

    private final String API_KEY = "d665204a4ebad80a3bc4b2ba0d1aac5b";

    private List<Map<String, Object>> callExternalApi(String stadiumName) {
        // 1. 구장 → 위경도 매핑
        Map<String, double[]> coordinates = Map.of(
                "대전한화생명볼파크", new double[]{36.3171, 127.4285},
                "대구삼성라이온즈파크", new double[]{35.8412, 128.6811},
                "광주기아챔피언스필드", new double[]{35.1683, 126.8886},
                "인천SSG랜더스필드", new double[]{37.4350, 126.6985},
                "서울종합운동장 야구장", new double[]{37.5121, 127.0716},
                "수원KT위즈파크", new double[]{37.2997, 127.0095},
                "고척스카이돔", new double[]{37.4982, 126.8671},
                "부산사직구장", new double[]{35.1944, 129.0592},
                "창원NC파크", new double[]{35.2271, 128.6816}
        );

        double[] latlon = coordinates.getOrDefault(stadiumName, new double[]{36.3171, 127.4285});
        double lat = latlon[0];
        double lon = latlon[1];

        // 2. API 요청 URL 구성
        String apiUrl = String.format(
                "https://api.openweathermap.org/data/2.5/forecast?lat=%.4f&lon=%.4f&units=metric&appid=%s&lang=kr",
                lat, lon, API_KEY
        );

        try {
            RestTemplate restTemplate = new RestTemplate();
            String json = restTemplate.getForObject(apiUrl, String.class);

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(json);
            JsonNode list = root.path("list");

            List<Map<String, Object>> result = new ArrayList<>();

            for (JsonNode node : list) {
                String time = node.path("dt_txt").asText();  // e.g. 2025-06-12 12:00:00
                double temp = node.path("main").path("temp").asDouble();
                double pop = node.has("pop") ? node.path("pop").asDouble() : 0.0;
                double rain = node.path("rain").has("3h") ? node.path("rain").path("3h").asDouble() : 0.0;

                String weather = node.path("weather").get(0).path("description").asText();  // 한글 설명

                Map<String, Object> entry = new HashMap<>();
                entry.put("time", time.replace(" ", "T")); // ISO 8601 형식으로 변환
                entry.put("temp", temp);
                entry.put("pop", pop);
                entry.put("rain", rain);
                entry.put("weather", weather);

                result.add(entry);
            }

            return result;

        } catch (Exception e) {
            e.printStackTrace();
            return List.of(); // 실패 시 빈 리스트 반환
        }
    }

}
