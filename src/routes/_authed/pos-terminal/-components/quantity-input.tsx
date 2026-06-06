import { Input } from "#/components/ui/input";
import { cn } from "#/lib/utils";
import { useEffect, useRef, useState } from "react";

type Props = {
  type: "integer" | "decimal" | string;
  value: number;
  className: string;
  onChange: (value: number) => void;
};

const QuantityInput = ({ className, onChange, value, type }: Props) => {
  const [rawValue, setRawValue] = useState(value.toString().replace(".", ","));
  const processedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const parseRaw = (raw: string): number => {
    const parsed = Number(raw.replace(",", "."));
    return parsed;
  };

  useEffect(() => {
    if (type == "integer") {
      const parsed = Math.floor(value);
      setRawValue(() => parsed.toString());
    } else {
      setRawValue(() => value.toString().replace(".", ","));
    }
  }, [value]);

  useEffect(() => {
    if (processedRef.current) {
      processedRef.current = false;
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (!processedRef.current) {
        if (rawValue !== "") {
          if (type == "integer") {
            const parsed = Math.floor(
              Number(rawValue.replace(".", "").replace(",", "")),
            );
            setRawValue(() => parsed.toString());
            onChange(parsed);
          } else {
            const parsed = parseRaw(rawValue);
            setRawValue(() => parsed.toString().replace(".", ","));
            onChange(parsed);
          }
          processedRef.current = true;
        }
      }
    }, 1000);
  }, [rawValue]);

  return (
    <Input
      type="text"
      value={rawValue}
      onChange={(e) => {
        setRawValue(() => e.target.value);
      }}
      className={cn(className, {
        "ring-2! ring-amber-500!": parseRaw(rawValue) !== value,
      })}
    />
  );
};

export { QuantityInput };
