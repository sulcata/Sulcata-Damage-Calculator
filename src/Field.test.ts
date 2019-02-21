import Field from "./Field";
import { Weather } from "./utilities";

const placeholderField = new Field();
let clearField = placeholderField;
let rainField = placeholderField;
let sunField = placeholderField;
let sandField = placeholderField;
let hailField = placeholderField;
let heavyRainField = placeholderField;
let harshSunField = placeholderField;
let strongWindsField = placeholderField;
beforeEach(() => {
  clearField = new Field();
  rainField = new Field({ weather: Weather.RAIN });
  sunField = new Field({ weather: Weather.SUN });
  sandField = new Field({ weather: Weather.SAND });
  hailField = new Field({ weather: Weather.HAIL });
  heavyRainField = new Field({ weather: Weather.HEAVY_RAIN });
  harshSunField = new Field({ weather: Weather.HARSH_SUN });
  strongWindsField = new Field({ weather: Weather.STRONG_WINDS });
});

test("#airLock", () => {
  expect(rainField.effectiveWeather()).toBe(Weather.RAIN);

  rainField.airLock = true;
  heavyRainField.airLock = true;
  strongWindsField.airLock = true;
  expect(rainField.effectiveWeather()).toBe(Weather.CLEAR);
  expect(heavyRainField.effectiveWeather()).toBe(Weather.CLEAR);
  expect(strongWindsField.effectiveWeather()).toBe(Weather.CLEAR);
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
