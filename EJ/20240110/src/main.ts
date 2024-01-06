import { Beverage, Espresso, Mocha, Whip } from "./BeverageRefactoring";

const espresso: Beverage = new Espresso();
console.log(espresso.getDescription() + "$" + espresso.cost());

const espressoWithMocha: Mocha = new Mocha(espresso);
const espressoWithMochaDouble: Mocha = new Mocha(espressoWithMocha);
const espressoWithMochaDoubleAndWhip: Whip = new Whip(espressoWithMochaDouble);
console.log(espressoWithMochaDoubleAndWhip.getDescription + "$" + espressoWithMochaDoubleAndWhip.cost());
