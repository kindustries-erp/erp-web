import { useSyncExternalStore, useEffect, useId } from "react";

export const V2_DESKTOP_STACK_OFFSET_PX = 20;
export const V2_MOBILE_STACK_OFFSET_PX = 16;
export const V2_BASE_DRAWER_Z_INDEX = 50;
export const V2_Z_INDEX_STEP = 10;

export interface V2DrawerStackState {
  depth: number;
  isTopmost: boolean;
  isUnderlying: boolean;
  totalOpen: number;
  desktopShiftPx: number;
  mobileTopOffsetPx: number;
  zIndex: number;
}

export interface UseV2DrawerStackOptions {
  stackOffsetPx?: number;
  mobileOffsetPx?: number;
  disableStackOffset?: boolean;
}

type StackListener = () => void;
const listeners = new Set<StackListener>();
let activeStack: string[] = [];

export function registerDrawer(id: string): void {
  if (!activeStack.includes(id)) {
    activeStack = [...activeStack, id];
    notify();
  }
}

export function unregisterDrawer(id: string): void {
  if (activeStack.includes(id)) {
    activeStack = activeStack.filter((item) => item !== id);
    notify();
  }
}

export function getActiveStackSnapshot(): string[] {
  return activeStack;
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeDrawerStack(listener: StackListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Reset all active drawers in stack - primarily for test tear-downs
 */
export function resetDrawerStack(): void {
  activeStack = [];
  notify();
}

/**
 * Hook to coordinate stacking behavior, depth, z-index and active layer priority
 * across multiple open V2StandardDrawer instances.
 */
export function useV2DrawerStack(
  customId?: string,
  isOpen: boolean = false,
  options?: UseV2DrawerStackOptions,
): V2DrawerStackState & { drawerId: string } {
  const generatedId = useId();
  const drawerId = customId || generatedId;

  useEffect(() => {
    if (isOpen) {
      registerDrawer(drawerId);
      return () => {
        unregisterDrawer(drawerId);
      };
    }
    return undefined;
  }, [drawerId, isOpen]);

  const stack = useSyncExternalStore(
    subscribeDrawerStack,
    getActiveStackSnapshot,
    getActiveStackSnapshot,
  );

  const index = stack.indexOf(drawerId);
  const depth = index >= 0 ? index : 0;
  const isTopmost = stack.length > 0 && stack[stack.length - 1] === drawerId;
  const isUnderlying = isOpen && !isTopmost && stack.length > 1;
  const totalOpen = stack.length;

  const desktopStep = options?.stackOffsetPx ?? V2_DESKTOP_STACK_OFFSET_PX;
  const mobileStep = options?.mobileOffsetPx ?? V2_MOBILE_STACK_OFFSET_PX;
  const disableOffset = options?.disableStackOffset ?? false;

  const desktopShiftPx = disableOffset ? 0 : depth * desktopStep;
  const mobileTopOffsetPx = disableOffset ? 0 : depth * mobileStep;
  const zIndex = V2_BASE_DRAWER_Z_INDEX + depth * V2_Z_INDEX_STEP;

  return {
    drawerId,
    depth,
    isTopmost,
    isUnderlying,
    totalOpen,
    desktopShiftPx,
    mobileTopOffsetPx,
    zIndex,
  };
}
