export enum Size {
    TALL = "TALL",
    GRANDE = "GRANDE",
    VENTI = "VENTI"
}

export abstract class Beverage {
    protected description: string = "Default Beverage";
    protected size: Size = Size.TALL;
    
    setSize(size: Size) {
        this.size = size;
    }
    
    getSize(): Size {
        return this.size;
    }

    getDescription(): string {
        return this.description;
    }

    abstract cost(): number;
}

export class Espresso extends Beverage {
    constructor() {
        super();
        this.description = "Espresso";
    }

    addSizeCost(size: Size): number {
        const sizeCost = {
            [Size.TALL]: 0,
            [Size.GRANDE]: 0.33,
            [Size.VENTI]: 0.44,
        };
        return sizeCost[size];
    }

    cost(): number {
        return 1.99;
    }
}

abstract class CondimentDecorator extends Beverage {
    protected beverage: Beverage; // 어떤 음료로 감쌀 수 있는 Beverage 슈퍼클래스를 사용함
    constructor(beverage: Beverage) {
        super();
        this.beverage = beverage;
    }
    abstract getDescription(): string;
}

export class Mocha extends CondimentDecorator {
    constructor(beverage: Beverage) {
        super(beverage);
    }
    // Beverage를 constructor에서 받고 있기 때문에 gerDescription(), cost() 는 반드시 구현해야 함
    getDescription(): string {
        return this.beverage.getDescription() + "Mocha";
    }
    cost(): number {
        return this.beverage.cost() + 0.2;
    }
}

export class Whip extends CondimentDecorator {
    constructor(beverage: Beverage) {
        super(beverage);
    }
    getDescription(): string {
        return this.beverage.getDescription() + "Whip";
    }
    cost(): number {
        return this.beverage.cost() + 0.1;
    }
}
