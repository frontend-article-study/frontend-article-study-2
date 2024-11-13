/**
 * Observer 인터페이스는 각 옵저버 클래스가 구현해야 하는 메서드를 선언한다.
 */
export interface Observer {
    update: (temperature: number, humidity: number, pressure: number) => void;
}

/**
 * registerObserver, removeObserver 메서드는  Observer를 인수로 받아 각 옵저버를 등록, 제거한다.
 * notifyObservers 메서드는 Subject 상태가 변경되었을 때 옵저버에게 이를 전달한다.
 */
export interface Subject {
    /**
     * Observer를 인자로 받아 옵저버를 등록한다.
     * @param o Observer
     */
    registerObserver(o: Observer): void;
    /**
     * Observer를 인자로 받아 옵저버를 제거한다.
     * @param o Observer
     */
    removeObserver(o: Observer): void;
    /**
     * Subject의 상태가 변경되었을 때 옵저버에게 이를 전달한다.
     */
    notifyObservers(): void;
}

/**
 * DisplayElement 인터페이스는 디스플레이 요소를 표시하는 display 메서드를 선언한다.
 */
export interface DisplayElement {
    display(): void;
}
