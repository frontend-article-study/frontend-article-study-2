/**
 * Subject 에서는 Observer를 등록, 제거, 알림을 위한 메서드를 제공한다.
 * getter/setter 메서드를 통해 Subject의 상태를 관리한다.
 */

import { Observer, Subject } from "./Utils";
import { WeatherDataStore } from "./store";

export class WeatherData implements Subject {
    private observers: Observer[] = [];
    private temperature: number = 0;
    private humidity: number = 0;
    private pressure: number = 0;

    constructor() {
        this.observers = [];
    }

    registerObserver(o: Observer): void {
        this.observers.push(o);
    }
  
    removeObserver(o: Observer): void {
        const index = this.observers.indexOf(o);
        if (index >= 0) {
            this.observers.slice(index, 1);
        }
    }

    notifyObservers(): void {
        for (const observer of this.observers) {
            observer.update(this.temperature, this.humidity, this.pressure);
        }
    }

    measurementsChanged(): void {
        this.notifyObservers();
    }

    setMeasurements(
        temperature: number,
        humidity: number,
        pressure: number
    ): void {
        this.temperature = temperature;
        this.humidity = humidity;
        this.pressure = pressure;
        WeatherDataStore.addTemperature(temperature);
        WeatherDataStore.addHumidity(humidity);
        WeatherDataStore.addPressure(pressure);
        this.measurementsChanged();
    }

    getTemperature(): number {
        return this.temperature;
    }

    getHumidity(): number {
        return this.humidity;
    }

    getPressure(): number {
        return this.pressure;
    }
}
