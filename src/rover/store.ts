// Rover 2.0 — persistence abstraction.
//
// The Store owns all Rover state and persists it through a swappable
// PersistenceProvider. The default provider is localStorage-backed so the
// vertical slice is fully functional in local development with no backend.
// A real backend can be connected by implementing PersistenceProvider and
// passing it to createStore() — no call sites change.

import type { RoverState } from "./types";
import { seedState } from "./seed";

const STORAGE_KEY = "rover.state.v2";

/** Swappable persistence backend. Implement this to connect a real database. */
export interface PersistenceProvider {
  load(): RoverState | null;
  save(state: RoverState): void;
}

/** Default provider: browser localStorage. No-ops safely on the server. */
export class LocalStorageProvider implements PersistenceProvider {
  load(): RoverState | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as RoverState) : null;
    } catch {
      return null;
    }
  }
  save(state: RoverState): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota / serialization errors are non-fatal for the demo */
    }
  }
}

type Listener = () => void;

export class RoverStore {
  private state: RoverState;
  private listeners = new Set<Listener>();
  private provider: PersistenceProvider;

  constructor(provider: PersistenceProvider) {
    this.provider = provider;
    this.state = provider.load() ?? seedState();
  }

  getState(): RoverState {
    return this.state;
  }

  /** Immutably replace state via an updater, persist, and notify. */
  setState(updater: (prev: RoverState) => RoverState): RoverState {
    this.state = updater(this.state);
    this.provider.save(this.state);
    this.listeners.forEach((l) => l());
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Wipe and reseed — used by the "Reset workspace" dev control. */
  reset(): void {
    this.setState(() => seedState());
  }
}

/* ---- singleton wiring (client) ---- */

let singleton: RoverStore | null = null;

export function getStore(): RoverStore {
  if (!singleton) {
    singleton = new RoverStore(new LocalStorageProvider());
  }
  return singleton;
}
