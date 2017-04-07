import Field from "../src/Field";
import {Weathers} from "../src/utilities";

describe("Field", () => {
    let clearField;
    let rainField;
    let sunField;
    let sandField;
    let hailField;
    let heavyRainField;
    let harshSunField;
    let strongWindsField;

    beforeEach(() => {
        clearField = new Field();
        rainField = new Field({weather: Weathers.RAIN});
        sunField = new Field({weather: Weathers.SUN});
        sandField = new Field({weather: Weathers.SAND});
        hailField = new Field({weather: Weathers.HAIL});
        heavyRainField = new Field({weather: Weathers.HEAVY_RAIN});
        harshSunField = new Field({weather: Weathers.HARSH_SUN});
        strongWindsField = new Field({weather: Weathers.STRONG_WINDS});
    });

    test("#airLock", () => {
        expect(rainField.effectiveWeather()).toEqual(Weathers.RAIN);

        rainField.airLock = true;
        heavyRainField.airLock = true;
        strongWindsField.airLock = true;
        expect(rainField.effectiveWeather()).toEqual(Weathers.CLEAR);
        expect(heavyRainField.effectiveWeather()).toEqual(Weathers.CLEAR);
        expect(strongWindsField.effectiveWeather()).toEqual(Weathers.CLEAR);
    });

    test("#isClearWeather()", () => {
        expect(clearField.isClearWeather()).toBeTruthy();
        expect(rainField.isClearWeather()).toBeFalsy();
    });

    test("#rain()", () => {
        expect(rainField.rain()).toBeTruthy();
        expect(heavyRainField.rain()).toBeTruthy();
        expect(sunField.rain()).toBeFalsy();
    });

    test("#sun()", () => {
        expect(sunField.sun()).toBeTruthy();
        expect(harshSunField.sun()).toBeTruthy();
        expect(rainField.sun()).toBeFalsy();
    });

    test("#sand()", () => {
        expect(sandField.sand()).toBeTruthy();
        expect(hailField.sand()).toBeFalsy();
    });

    test("#hail()", () => {
        expect(hailField.hail()).toBeTruthy();
        expect(sandField.hail()).toBeFalsy();
    });

    test("#heavyRain()", () => {
        expect(heavyRainField.heavyRain()).toBeTruthy();
        expect(rainField.heavyRain()).toBeFalsy();
    });

    test("#harshSun()", () => {
        expect(harshSunField.harshSun()).toBeTruthy();
        expect(sunField.harshSun()).toBeFalsy();
    });

    test("#strongWinds()", () => {
        expect(strongWindsField.strongWinds()).toBeTruthy();
        expect(clearField.strongWinds()).toBeFalsy();
    });
});
