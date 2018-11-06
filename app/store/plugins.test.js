import { persistencePlugin } from "./plugins";

let store;
beforeEach(() => {
  store = {
    state: {},
    replaceState: jest.fn(),
    subscribe: jest.fn()
  };
});

describe("persistencePlugin()", () => {
  test("returns a function that subscribes to a store and replaces the state", () => {
    const installPlugin = persistencePlugin();
    expect(installPlugin).toEqual(expect.any(Function));
    installPlugin(store);
    expect(store.replaceState).toHaveBeenCalledWith({});
    expect(store.subscribe).toHaveBeenCalledWith(expect.any(Function));
  });
});
