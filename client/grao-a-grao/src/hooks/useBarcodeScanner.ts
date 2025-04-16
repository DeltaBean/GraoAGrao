// hooks/useBarcodeScanner.ts
import { useEffect, useRef } from "react";

interface BarcodeOptions {
  /** don’t fire unless buffer has at least this many characters */
  minLength?: number;
  /** max ms between first char and Enter to count as a scan */
  maxDuration?: number;
}

/**
 * Calls onScan(code) only when:
 *  - buffer.length >= minLength
 *  - (time of Enter) - (time of first char) <= maxDuration
 */
export function useBarcodeScanner(
  onScan: (code: string) => void,
  { minLength = 6, maxDuration = 500 }: BarcodeOptions = {}
) {
  const buffer = useRef("");
  const firstTime = useRef(0);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const now = Date.now();

      if (e.key === "Enter") {
        const code = buffer.current;
        const duration = now - firstTime.current;

        if (code.length >= minLength && duration <= maxDuration) {
          onScan(code);
        }

        // reset for next sequence
        buffer.current = "";
        firstTime.current = 0;
      } else if (e.key.length === 1) {
        // printable char
        if (buffer.current.length === 0) {
          // mark the start time on first char
          firstTime.current = now;
        }
        buffer.current += e.key;
      } else {
        // ignore non-printables (arrows, etc)
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onScan, minLength, maxDuration]);
}
