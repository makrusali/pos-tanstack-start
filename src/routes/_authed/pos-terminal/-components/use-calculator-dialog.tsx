import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { CalculatorIcon } from "lucide-react";
import { CustomButton } from "./button";
import {
  useCallback,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

const useCalculator = () => {
  const [open, setOpen] = useState(false);

  const InternalDialog = useCallback(() => {
    const [calcDisplay, setCalcDisplay] = useState("0");
    const [calcExpression, setCalcExpression] = useState("");
    const [calcNewNumber, setCalcNewNumber] = useState(true);

    const calcNum = (num: string) => {
      if (calcNewNumber) {
        setCalcDisplay(num);
        setCalcNewNumber(false);
      } else {
        setCalcDisplay(calcDisplay === "0" ? num : calcDisplay + num);
      }
    };

    const calcOp = (op: string) => {
      setCalcExpression(calcDisplay + " " + op + " ");
      setCalcNewNumber(true);
    };

    const calcEquals = () => {
      try {
        const result = eval(calcExpression + calcDisplay);
        setCalcDisplay(String(Number(result.toFixed(2))));
        setCalcExpression("");
        setCalcNewNumber(true);
      } catch {
        setCalcDisplay("Error");
      }
    };

    const calcClear = () => {
      setCalcDisplay("0");
      setCalcExpression("");
      setCalcNewNumber(true);
    };

    const calcBackspace = () => {
      if (calcDisplay.length > 1) {
        setCalcDisplay(calcDisplay.slice(0, -1));
      } else {
        setCalcDisplay("0");
      }
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-3xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <CalculatorIcon className="w-5 h-5 text-emerald-500" />
              Kalkulator
            </DialogTitle>
          </DialogHeader>

          <div className="bg-slate-50 rounded-2xl p-5 mb-5 text-right">
            <div className="text-sm text-slate-400 mb-1 min-h-5">
              {calcExpression}
            </div>
            <div className="text-4xl font-bold text-slate-800">
              {calcDisplay}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <CustomButton
              variant="danger"
              className="h-14 rounded-2xl"
              onClick={calcClear}
            >
              C
            </CustomButton>
            <CustomButton
              variant="secondary"
              className="h-14 rounded-2xl"
              onClick={() => calcOp("/")}
            >
              ÷
            </CustomButton>
            <CustomButton
              variant="secondary"
              className="h-14 rounded-2xl"
              onClick={() => calcOp("*")}
            >
              ×
            </CustomButton>
            <CustomButton
              variant="secondary"
              className="h-14 rounded-2xl"
              onClick={calcBackspace}
            >
              Clear
            </CustomButton>

            {[7, 8, 9].map((n) => (
              <CustomButton
                key={n}
                variant="ghost"
                className="h-14 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 hover:bg-slate-50"
                onClick={() => calcNum(String(n))}
              >
                {n}
              </CustomButton>
            ))}
            <CustomButton
              variant="secondary"
              className="h-14 rounded-2xl"
              onClick={() => calcOp("-")}
            >
              -
            </CustomButton>

            {[4, 5, 6].map((n) => (
              <CustomButton
                key={n}
                variant="ghost"
                className="h-14 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 hover:bg-slate-50"
                onClick={() => calcNum(String(n))}
              >
                {n}
              </CustomButton>
            ))}
            <CustomButton
              variant="secondary"
              className="h-14 rounded-2xl"
              onClick={() => calcOp("+")}
            >
              +
            </CustomButton>

            {[1, 2, 3].map((n) => (
              <CustomButton
                key={n}
                variant="ghost"
                className="h-14 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 hover:bg-slate-50"
                onClick={() => calcNum(String(n))}
              >
                {n}
              </CustomButton>
            ))}
            <CustomButton
              variant="primary"
              className="h-14 rounded-2xl row-span-2"
              onClick={calcEquals}
            >
              =
            </CustomButton>

            <CustomButton
              variant="ghost"
              className="h-14 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 hover:bg-slate-50 col-span-2"
              onClick={() => calcNum("0")}
            >
              0
            </CustomButton>
            <CustomButton
              variant="ghost"
              className="h-14 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 hover:bg-slate-50"
              onClick={() => calcNum(".")}
            >
              .
            </CustomButton>
          </div>
        </DialogContent>
      </Dialog>
    );
  }, [open]);

  type TriggerProps = {
    children: (params: {
      open: boolean;
      setOpen: Dispatch<SetStateAction<boolean>>;
    }) => ReactNode;
  };

  const Trigger = (props: TriggerProps) => {
    return props.children({ open, setOpen });
  };

  return {
    Dialog: InternalDialog,
    Trigger: Trigger,
  };
};

export { useCalculator };
