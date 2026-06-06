import { useEffect, useRef } from "react";

type Options = {
  active: boolean;
  onEnter: (code: string) => void;
};

const useBarcodeScanner = ({ onEnter, active }: Options) => {
  const barcodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const barcodeBufferRef = useRef("");
  const onEnterRef = useRef(onEnter);
  useEffect(() => {
    onEnterRef.current = onEnter;
  }, [onEnter]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.key >= "0" && e.key <= "9") {
        barcodeBufferRef.current += e.key;

        if (barcodeTimeoutRef.current) {
          clearTimeout(barcodeTimeoutRef.current);
        }

        barcodeTimeoutRef.current = setTimeout(() => {
          barcodeBufferRef.current = "";
        }, 800);
      } else if (e.key === "Enter" && barcodeBufferRef.current.length !== 0) {
        onEnterRef.current?.(barcodeBufferRef.current);
        barcodeBufferRef.current = "";
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onEnterRef, active]);
};

export { useBarcodeScanner };
