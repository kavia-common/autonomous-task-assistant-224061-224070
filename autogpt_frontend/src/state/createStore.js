import React, { createContext, useContext, useMemo, useReducer, useRef } from "react";

/**
 * PUBLIC_INTERFACE
 * createStore - Minimal lightweight store factory inspired by Zustand.
 * Uses React Context + useReducer internally, no external deps.
 * Provides getState, setState, subscribe, and a Provider component.
 *
 * Note:
 * - Consumers should use the exported store.useStore hook which is bound to the store's context
 *   and does not rely on any external Provider beyond the one created inside createStore. This
 *   design allows components (e.g., Toaster) to safely access store state/actions even if they
 *   are rendered outside of any additional app-level providers.
 */
export function createStore(initialState = {}, actionsFactory = () => ({})) {
  const listeners = new Set();
  const stateRef = { current: { ...initialState } };

  const getState = () => stateRef.current;

  const setState = (partial, replace = false) => {
    const prev = stateRef.current;
    const next =
      typeof partial === "function" ? partial(prev) : partial || {};
    stateRef.current = replace ? next : { ...prev, ...next };
    for (const l of listeners) {
      try {
        l(stateRef.current, prev);
      } catch {
        // ignore subscriber errors
      }
    }
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  // Context + Provider implementation
  const StoreContext = createContext({
    getState,
    setState,
    subscribe,
    actions: {},
  });

  function reducer(_, action) {
    // we apply updates via setState; reducer just triggers rerender with token
    if (action && action.type === "__SET__") {
      return { token: {} };
    }
    return { token: {} };
  }

  const Provider = ({ children }) => {
    const [, dispatch] = useReducer(reducer, { token: {} });
    const dispatchRef = useRef(dispatch);

    // Wrap setState to trigger rerenders
    const setAndNotify = (partial, replace = false) => {
      setState(partial, replace);
      dispatchRef.current({ type: "__SET__" });
    };

    const actions = useMemo(
      () => actionsFactory({ getState, setState: setAndNotify, subscribe }),
      []
    );

    const value = useMemo(
      () => ({ getState, setState: setAndNotify, subscribe, actions }),
      [actions]
    );

    return (
      <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
    );
  };

  // PUBLIC_INTERFACE
  function useStore(selector = (s) => s, equalityFn = Object.is) {
    const ctx = useContext(StoreContext);
    const { getState, subscribe } = ctx;
    const selectedRef = useRef(selector(getState()));
    const [, rerender] = useReducer((c) => c + 1, 0);

    React.useEffect(() => {
      return subscribe((next) => {
        const selectedNext = selector(next);
        if (!equalityFn(selectedNext, selectedRef.current)) {
          selectedRef.current = selectedNext;
          rerender();
        }
      });
    }, [subscribe, selector, equalityFn]);

    return selector(getState());
  }

  return { Provider, useStore, getState, setState, subscribe, actionsFactory };
}
