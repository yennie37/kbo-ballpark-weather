// 서버 시작 시 전체 구장 날씨를 미리 가져와 캐싱하고 30분마다 갱신하는 버전
package com.kbo.BallparkWeather.Controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import jakarta.annotation.PostConstruct;

import java.time.Instant;
import java.util.*;

@CrossOrigin(origins = "https://kbo-ballpark-weather.vercel.app")
@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private final String API_KEY = "d665204a4ebad80a3bc4b2ba0d1aac5b";

    // 구장 이름 → 좌표
    private static final Map<String, double[]> STADIUMS = Map.of(
            "대전한화생명볼파크", new double[]{36.317085, 127.429131},
            "대구삼성라이온즈파크", new double[]{35.841993, 128.681336},
            "서울종합운동장 야구장", new double[]{37.514086, 127.074722},
            "고척스카이돔", new double[]{37.498108, 126.867548},
            "수원KT위즈파크", new double[]{37.2996, 127.0095},
            "부산사직구장", new double[]{35.194398, 129.061261},
            "창원NC파크", new double[]{35.222488, 128.583033},
            "광주기아챔피언스필드", new double[]{35.1683, 126.8888},
            "인천SSG랜더스필드", new double[]{37.435057, 126.693137}
    );

    // 캐시 저장소: 구장명 → 날씨 데이터
    private final Map<String, CachedForecast> cache = new HashMap<>();

    private static class CachedForecast {
        List<Map<String, Object>> data;
        Instant timestamp;

        CachedForecast(List<Map<String, Object>> data) {
            this.data = data;
            this.timestamp = Instant.now();
        }

        boolean isExpired() {
            return Instant.now().isAfter(this.timestamp.plusSeconds(60 * 30));
        }
    }

    @PostConstruct
    public void init() {
        updateAllForecasts();
    }

    @Scheduled(fixedRate = 1000 * 60 * 30) // 30분마다 자동 갱신
    public void updateAllForecasts() {
        System.out.println("🔄 전체 구장 날씨 갱신 중...");
        STADIUMS.forEach((name, coord) -> {
            List<Map<String, Object>> data = fetchForecast(coord[0], coord[1]);
            if (data != null) {
                cache.put(name, new CachedForecast(data));
                System.out.println("✅ " + name + " 캐시 완료 (" + Instant.now() + ")");
            } else {
                System.out.println("⚠️ " + name + " 데이터 가져오기 실패");
            }
        });
    }

    private List<Map<String, Object>> fetchForecast(double lat, double lon) {
        String apiUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat +
                "&lon=" + lon + "&units=metric&appid=" + API_KEY + "&lang=kr";

        RestTemplate restTemplate = new RestTemplate();
        String result = restTemplate.getForObject(apiUrl, String.class);

        List<Map<String, Object>> forecastList = new ArrayList<>();

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(result);
            JsonNode list = root.get("list");

            for (JsonNode item : list) {
                Map<String, Object> entry = new HashMap<>();
                entry.put("time", item.get("dt_txt").asText());
                entry.put("temp", item.get("main").get("temp").asDouble());
                entry.put("weather", item.get("weather").get(0).get("description").asText());

                if (item.has("rain") && item.get("rain").has("3h")) {
                    entry.put("rain", item.get("rain").get("3h").asDouble());
                }
                if (item.has("pop")) {
                    entry.put("pop", item.get("pop").asDouble());
                }

                forecastList.add(entry);
            }

            return forecastList;

        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    // 클라이언트에서 구장 이름으로 요청
    @GetMapping("/forecast")
    public ResponseEntity<List<Map<String, Object>>> getForecast(@RequestParam String stadium) {
        if (!cache.containsKey(stadium)) {
            System.out.println("❌ 요청한 구장에 대한 데이터 없음: " + stadium);
            return ResponseEntity.status(404).body(Collections.emptyList());
        }
        // 테스트 로그
        // System.out.println("📦 캐시된 데이터 반환: " + stadium);
        return ResponseEntity.ok(cache.get(stadium).data);
    }

    @GetMapping("/stadiums")
    public ResponseEntity<Set<String>> getAvailableStadiums() {
        return ResponseEntity.ok(STADIUMS.keySet());
    }
}
