import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/shared/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const listRef = React.useRef<React.ElementRef<
    typeof TabsPrimitive.List
  > | null>(null);
  const indicatorRef = React.useRef<HTMLDivElement | null>(null);
  const mergedRef = useMergedRef(ref, listRef);

  const updateIndicator = React.useCallback(() => {
    const listEl = listRef.current;
    if (!listEl || !indicatorRef.current) return;
    const activeEl = listEl.querySelector<HTMLElement>(
      '[role="tab"][data-state="active"]',
    );
    if (!activeEl || activeEl.offsetWidth < 4) {
      indicatorRef.current.style.opacity = "0";
      indicatorRef.current.style.width = "0px";
      indicatorRef.current.style.left = "0px";
      return;
    }
    const adjustedLeft = activeEl.offsetLeft - listEl.scrollLeft;
    const accent = activeEl.getAttribute("data-accent");

    indicatorRef.current.style.opacity = "1";
    indicatorRef.current.style.transition =
      "transform 180ms ease-out, width 180ms ease-out, left 180ms ease-out, opacity 120ms ease-out";
    indicatorRef.current.style.transform = listEl.scrollLeft
      ? `translateX(0px)`
      : "";
    indicatorRef.current.style.width = `${activeEl.offsetWidth}px`;
    indicatorRef.current.style.left = `${adjustedLeft}px`;

    if (accent) {
      const grad = `linear-gradient(135deg, ${accent} 0%, ${accent}cc 55%, ${accent}99 100%)`;
      indicatorRef.current.style.background = grad;
      indicatorRef.current.style.boxShadow = `0 4px 16px -4px ${accent}66`;
      indicatorRef.current.style.setProperty("--i-accent", accent);
      indicatorRef.current.style.border = "";
    } else {
      const grad =
        "linear-gradient(135deg, #ffffff 0%, #fafafa 55%, #f5f5f5 100%)";
      indicatorRef.current.style.background = grad;
      indicatorRef.current.style.boxShadow =
        "0 1px 2px rgba(15,23,42,.05), 0 8px 22px -8px rgba(15,23,42,.18)";
      indicatorRef.current.style.border = "none";
      indicatorRef.current.style.setProperty("--i-accent", "#ffffff");
    }
  }, []);

  React.useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  React.useLayoutEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;

    const ro = new ResizeObserver(updateIndicator);
    ro.observe(listEl);
    Array.from(listEl.querySelectorAll<HTMLElement>('[role="tab"]')).forEach(
      (el) => ro.observe(el),
    );

    const mo = new MutationObserver(updateIndicator);
    mo.observe(listEl, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state"],
      childList: true,
    });

    listEl.addEventListener("scroll", updateIndicator, { passive: true });
    window.addEventListener("resize", updateIndicator);

    return () => {
      ro.disconnect();
      mo.disconnect();
      listEl.removeEventListener("scroll", updateIndicator);
      window.removeEventListener("resize", updateIndicator);
    };
  }, [updateIndicator]);

  return (
    <TabsPrimitive.List
      ref={mergedRef}
      className={cn(
        "relative inline-flex h-9 items-center justify-start rounded-lg bg-[color:var(--muted)] p-1 text-[color:var(--muted-fg)] overflow-hidden",
        className,
      )}
      {...props}
    >
      {children}
      <div
        ref={indicatorRef}
        role="presentation"
        aria-hidden="true"
        data-tabs-indicator
        className="pointer-events-none absolute top-1 bottom-1 left-0 rounded-full bg-white shadow-sm will-change-[left,width] z-0"
        style={{ width: 0, opacity: 0 }}
      />
    </TabsPrimitive.List>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-start whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-transparent data-[state=active]:text-[color:var(--foreground)] data-[state=active]:shadow-none relative z-[1]",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-left-2 data-[state=active]:duration-200",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

function useMergedRef<T>(
  a: React.Ref<T> | React.MutableRefObject<T> | null | undefined,
  b: React.Ref<T> | React.MutableRefObject<T> | null | undefined,
): React.RefCallback<T> {
  return React.useCallback(
    (value: T | null) => {
      [a, b].forEach((ref) => {
        if (!ref) return;
        if (typeof ref === "function") {
          ref(value);
        } else {
          const mutableRef = ref as React.MutableRefObject<T | null>;
          mutableRef.current = value;
        }
      });
    },
    [a, b],
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
