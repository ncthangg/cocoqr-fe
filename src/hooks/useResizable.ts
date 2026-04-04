import { useCallback, useRef, useState } from "react";

/**
 * Hook for resizable split-pane behavior.
 * Returns a ref, current left %, and a mouseDown handler for the divider.
 */
export function useResizable(initialPercent = 40, min = 30, max = 70) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [leftPercent, setLeftPercent] = useState(initialPercent);

    const startResizing = useCallback(
        (mouseDownEvent: React.MouseEvent) => {
            if (!containerRef.current) return;
            mouseDownEvent.preventDefault();
            const containerWidth = containerRef.current.offsetWidth;
            const startX = mouseDownEvent.clientX;
            const startPercent = leftPercent;

            const onMouseMove = (e: MouseEvent) => {
                const delta = e.clientX - startX;
                const deltaPct = (delta / containerWidth) * 100;
                const newPct = Math.max(min, Math.min(max, startPercent + deltaPct));
                setLeftPercent(newPct);
            };

            const onMouseUp = () => {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
                document.body.style.cursor = "default";
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
            document.body.style.cursor = "col-resize";
        },
        [leftPercent, min, max]
    );

    return { containerRef, leftPercent, startResizing };
}
