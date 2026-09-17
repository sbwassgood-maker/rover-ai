"use client";
import { useSyncExternalStore } from "react";
import { getStore } from "./store";
import type { RoverState } from "./types";

/**
 * Subscribe a component to the Rover store. Re-renders whenever state changes.
 * Uses useSyncExternalStore for correct concurrent behavior.
 */
export function useRoverState(): RoverState {
  const store = getStore();
  return useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.getState(),
    () => store.getState()
  );
}

/** Convenience selector hook. */
export function useRoverSelector<T>(selector: (s: RoverState) => T): T {
  return selector(useRoverState());
}
