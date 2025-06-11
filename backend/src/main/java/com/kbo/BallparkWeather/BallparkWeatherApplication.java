package com.kbo.BallparkWeather;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BallparkWeatherApplication {

	public static void main(String[] args) {
		SpringApplication.run(BallparkWeatherApplication.class, args);
		System.out.println("Start the BallparkWeatherApplication.");
	}

}
