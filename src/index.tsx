import type {
  ComponentProps,
  ComponentType,
  DependencyList,
  EffectCallback
} from "react";
import React from "react";

export const Prefix = "__kill-useCallback__";
export const IdSymbol = `${Prefix}IdSymbol`;
export const DepsSymbol = `${Prefix}DepsSymbol`;

export let fnId = 1;
export const cache = new Map<string, boolean>();
// cache has to be cleared after render and effect comparing

export function areEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (
    !(
      typeof a === "function" &&
      a[DepsSymbol] &&
      typeof b === "function" &&
      b[DepsSymbol]
    )
  ) {
    return a === b;
  }
  const idA: number = a[IdSymbol],
    idB: number = b[IdSymbol];
  const pair = `${idA}-${idB}`;
  if (cache.has(pair)) return cache.get(pair) ?? false;
  const result = (() => {
    if (a.toString() !== b.toString()) return false;
    const depsA: any[] = a[DepsSymbol];
    const depsB: any[] = b[DepsSymbol];
    for (const [i, itemA] of depsA.entries()) {
      if (!areEqual(itemA, depsB[i])) return false;
    }
    return true;
  })();
  cache.set(pair, result);
  return result;
}

export function propsAreEqual<T extends ComponentType<any>>(
  prev: Readonly<ComponentProps<T>>,
  next: Readonly<ComponentProps<T>>
): boolean {
  for (const k in prev) {
    if (!prev.hasOwnProperty(k)) continue;
    if (!areEqual(prev[k], next[k])) return false;
  }
  for (const k in next) {
    if (!next.hasOwnProperty(k)) continue;
    if (!areEqual(next[k], prev[k])) return false;
  }
  return true;
}

export function depFn<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T {
  (callback as any)[IdSymbol] = fnId++;
  (callback as any)[DepsSymbol] = deps;
  return callback;
}

export function useDeps<T extends DependencyList | undefined>(deps: T): T {
  const prevRef = React.useRef<DependencyList>();
  const newDeps = deps?.map((dep, index) => {
    const prev = prevRef.current?.[index];
    return areEqual(dep, prev) ? prev : dep;
  }) as T;
  React.useLayoutEffect(() => {
    prevRef.current = newDeps;
  }, [newDeps]);
  return newDeps;
}

export function useEffect(effect: EffectCallback, deps?: DependencyList): void {
  return React.useEffect(effect, useDeps(deps));
}

export function useLayoutEffect(
  effect: EffectCallback,
  deps?: DependencyList
): void {
  return React.useLayoutEffect(effect, useDeps(deps));
}
