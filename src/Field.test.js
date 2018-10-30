import Field from "sulcalc/Field";
import { Weathers } from "sulcalc/utilities";

let clearField;
let rainField, sunField, sandField, hailField;
let heavyRainField, harshSunField, strongWindsField;
beforeEach(() => {
  clearField = new Field();
  rainField = new Field({ weather: Weathers.RAIN });
  sunField = new Field({ weather: Weathers.SUN });
  sandField = new Field({ weather: Weathers.SAND });
  hailField = new Field({ weather: Weathers.HAIL });
  heavyRainField = new Field({ weather: Weathers.HEAVY_RAIN });
  harshSunField = new Field({ weather: Weathers.HARSH_SUN });
  strongWindsField = new Field({ weather: Weathers.STRONG_WINDS });
});

test("#airLock", () => {
  expect(rainField.effectiveWeather()).toBe(Weathers.RAIN);

  rainField.airLock = true;
  heavyRainField.airLock = true;
  strongWindsField.airLock = true;
  expect(rainField.effectiveWeather()).toBe(Weathers.CLEAR);
  expect(heavyRainField.effectiveWeather()).toBe(Weathers.CLEAR);
  expect(strongWindsField.effectiveWeather()).toBe(Weathers.CLEAR);
});

test("#isClearWeather()", () => {
  expect(clearField.isClearWeather()).toBe(true);
  expect(rainField.isClearWeather()).toBe(false);
});

test("#rain()", () => {
  expect(rainField.rain()).toBe(true);
  expect(heavyRainField.rain()).toBe(true);
  expect(sunField.rain()).toBe(false);
});

test("#sun()", () => {
  expect(sunField.sun()).toBe(true);
  expect(harshSunField.sun()).toBe(true);
  expect(rainField.sun()).toBe(false);
});

test("#sand()", () => {
  expect(sandField.sand()).toBe(true);
  expect(hailField.sand()).toBe(false);
});

test("#hail()", () => {
  expect(hailField.hail()).toBe(true);
  expect(sandField.hail()).toBe(false);
});

test("#heavyRain()", () => {
  expect(heavyRainField.heavyRain()).toBe(true);
  expect(rainField.heavyRain()).toBe(false);
});

test("#harshSun()", () => {
  expect(harshSunField.harshSun()).toBe(true);
  expect(sunField.harshSun()).toBe(false);
});

test("#strongWinds()", () => {
  expect(strongWindsField.strongWinds()).toBe(true);
  expect(clearField.strongWinds()).toBe(false);
});
