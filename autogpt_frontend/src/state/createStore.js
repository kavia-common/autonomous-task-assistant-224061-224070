import React, { createContext, useContext, useMemo, useReducer, useRef } from "react";

/**
 * PUBLIC_INTERFACE
 * createStore - Minimal lightweight store factory inspired by Zustand.
 * Uses React Context + useReducer internally, no external deps.
 * Provides a stable, consistent API shape:
 * { Provider, useStore, getState, setState, subscribe, actionsFactory, storeRef }
 *
 * Robustness guarantees:
 * - Always returns the full API shape; never exports undefined values.
 * - actionsFactory receives a stable storeRef so it can safely no-op if uninitialized.
 * - Exposes a singleton-friendly storeRef { current } that always exists.
 */
export function createStore(initialState = {}, actionsFactory = () => ({})) {
  // Stable references that are always defined
  const listeners = new Set();
  const storeRef = { current: null }; // will hold the public store API once Provider mounts
  const stateRef = { current: { ...initialState } };

  const getState = () => stateRef.current;

  const baseSetState = (partial, replace = false) => {
    const prev = stateRef.current;
    const next = typeof partial === "function" ? partial(prev) : partial || {};
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
    setState: baseSetState,
    subscribe,
    actions: {},
  });

  function reducer(_, action) {
    if (action && action.type === "__SET__") {
      return { token: {} };
    }
    return { token: {} };
  }

  const Provider = ({ children }) => {
    const [, dispatch] = useReducer(reducer, { token: {} });
    const dispatchRef = useRef(dispatch);

    const setAndNotify = (partial, replace = false) => {
      baseSetState(partial, replace);
      dispatchRef.current({ type: "__SET__" });
    };

    // Safely build actions using a storeRef to avoid destructuring undefined
    const actions = useMemo(() => {
      try {
        const ctx = {
          // Expose accessors that are always defined
          getState,
          setState: setAndNotify,
          subscribe,
          // Also pass a storeRef for factories that prefer checking ref.current
          storeRef,
        };
        const a = actionsFactory(ctx);
        if (a && typeof a === "object") return a;
        console.warn("[createStore] actionsFactory did not return an object; using no-op actions.");
        return {};
      } catch (e) {
        console.warn("[createStore] actionsFactory threw; using no-op actions.");
        return {};
      }
    }, []);

    const value = useMemo(
      () => ({ getState, setState: setAndNotify, subscribe, actions }),
      [actions]
    );

    // Populate the public singleton ref
    storeRef.current = value;

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
  };

  // PUBLIC_INTERFACE
  /**
   * useStore - Hook to select from the store state with subscription.
   * Always available and never throws due to missing context; backed by internal context.
   */
  function useStore(selector = (s) => s, equalityFn = Object.is) {
    const ctx = useContext(StoreContext) || { getState, subscribe };
    const { getState: gs, subscribe: sub } = ctx;
    const selectedRef = useRef(selector(gs()));
    const [, rerender] = useReducer((c) => c + 1, 0);

    React.useEffect(() => {
      return sub((next) => {
        const selectedNext = selector(next);
        if (!equalityFn(selectedNext, selectedRef.current)) {
          selectedRef.current = selectedNext;
          rerender();
        }
      });
    }, [sub, selector, equalityFn]);

    return selector(gs());
  }

  // Return complete API with storeRef for singleton usage
  return { Provider, useStore, getState, setState: baseSetState, subscribe, actionsFactory, storeRef };
}
