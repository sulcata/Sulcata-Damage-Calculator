import { mapValues } from "lodash";

type ThunkObject<T> = {
  [key in keyof T]: () => T[keyof T];
};

export const asThunkObject = <T extends object>(object: T): ThunkObject<T> =>
  mapValues(object, value => () => value);
