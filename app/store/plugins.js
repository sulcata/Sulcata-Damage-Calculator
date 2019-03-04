import { at, castArray, merge, set, zip } from "lodash";

export function persistencePlugin({
  saveOn = {},
  onLoad = () => {},
  prefix = "",
  storage = window.localStorage
} = {}) {
  function prefixKey(key) {
    if (prefix !== "") {
      return `(${prefix}).${key}`;
    }
    return key;
  }

  return store => {
    const water = {};
    for (const paths of Object.values(saveOn)) {
      for (const path of castArray(paths)) {
        const storedValue = storage.getItem(prefixKey(path));
        if (storedValue) {
          const parsedValue = JSON.parse(storedValue);
          set(water, path, parsedValue);
        }
      }
    }
    store.replaceState(merge({}, store.state, water));

    onLoad(store);

    store.subscribe(({ type }, state) => {
      if (saveOn.hasOwnProperty(type)) {
        const paths = castArray(saveOn[type]);
        for (const [path, value] of zip(paths, at(state, paths))) {
          const stringifiedValue = JSON.stringify(value);
          try {
            storage.setItem(prefixKey(path), stringifiedValue);
          } catch {
            // this can sometimes throw based on the spec
          }
        }
      }
    });
  };
}
