import { DisplayElement, Observer } from "./Utils";
import { WeatherDataStore } from "./store";
import { WeatherData } from "./SubjectUtils";

export abstract class Display implements Observer, DisplayElement {
    protected temperature: number = 0;
    protected humidity: number = 0;
    protected pressure: number = 0;
    protected weatherData: WeatherData;

    constructor(weatherData: WeatherData) {
        this.weatherData = weatherData;
        this.weatherData.registerObserver(this);
    }

    update() {
        this.temperature = this.weatherData.getTemperature();
        this.humidity = this.weatherData.getHumidity();
        this.pressure = this.weatherData.getPressure();
        this.display();
    }
    abstract display(): void;
}

export class CurrentConditionsDisplay extends Display {
    constructor(weatherData: WeatherData) {
      super(weatherData);
    }
    display() {
      console.log(
        `Current conditions: ${this.temperature}F degrees and ${this.humidity}% humidity`
      );
    }
 }

export class StatisticsDisplay extends Display {
    constructor(weatherData: WeatherData) {
      super(weatherData);
    }
  
    private getTemperatureData() {
      const temperatureList = WeatherDataStore.temperatureList;
      const average =
        temperatureList.reduce((a, b) => a + b) / temperatureList.length;
      const max = Math.max(...temperatureList);
      const min = Math.min(...temperatureList);
      return { average, max, min };
    }
  
    display() {
      const { average, max, min } = this.getTemperatureData();
      console.log(`Avg/Max/Min temperature = ${average}/${max}/${min}`);
    }
  }

export class ForecastDisplay extends Display {
    private currentPressure = 29.92;
    private lastPressure: number = 0;
    private forecast: string = "";

    constructor(weatherData: WeatherData) {
        super(weatherData);
    }

    setForecast() {
        if (this.currentPressure > this.lastPressure) {
            this.forecast = "Warmer weather !";
        } else if (this.currentPressure === this.lastPressure) {
            this.forecast = "Same weather !";
        } else if (this.currentPressure < this.lastPressure) { 
            this.forecast = "Cooler weather !";
        }
    }

    update() {
        this.humidity = this.weatherData.getHumidity();
        this.currentPressure = this.weatherData.getPressure();
        this.setForecast();
        this.display();
        this.lastPressure = this.currentPressure;
    }

    display() {
        console.log(
            `Forecast: ${this.forecast} ${this.currentPressure}F degrees and ${this.humidity}% humidity\n`
        );      
    }
}
