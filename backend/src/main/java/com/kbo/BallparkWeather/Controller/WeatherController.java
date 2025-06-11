// 서버 시작 시 전체 구장 날씨를 미리 가져와 캐싱하고 30분마다 갱신하는 버전
package com.kbo.BallparkWeather.Controller;

import com.kbo.BallparkWeather.service.WeatherService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private final WeatherService weatherService;

    @Autowired
    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    // /api/weather/forecast?stadium=대전한화생명볼파크
    @GetMapping("/forecast")
    public List<Map<String, Object>> getForecast(@RequestParam String stadium) {
        return weatherService.getForecastForStadium(stadium);
    }
}
