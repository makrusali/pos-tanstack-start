import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { AlertTriangleIcon } from "lucide-react";
import { CustomButton } from "./button";
import {
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type Options = {
  title: string;
  description: string;
  onConfirm: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
};

const useConfirmDialog = ({
  title,
  description,
  onConfirm,
  confirmButtonText,
  cancelButtonText,
}: Options) => {
  const [open, setOpen] = useState(false);

  const InternalDialog = () => {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-3xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangleIcon className="w-5 h-5" />
              {title}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <CustomButton
              onClick={() => setOpen(false)}
              variant="secondary"
              className="px-6 py-3"
            >
              {cancelButtonText || "Batal"}
            </CustomButton>
            <CustomButton
              variant="danger"
              className="px-6 py-3"
              onClick={() => {
                setOpen(false);
                onConfirm();
              }}
            >
              {confirmButtonText || "Ya"}
            </CustomButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  type TriggerProps = {
    children: (
      open: boolean,
      setOpen: Dispatch<SetStateAction<boolean>>,
    ) => ReactNode;
  };

  const Trigger = (props: TriggerProps) => {
    return <>{props.children(open, setOpen)}</>;
  };

  return {
    Dialog: InternalDialog,
    Trigger: Trigger,
  };
};

export { useConfirmDialog };
