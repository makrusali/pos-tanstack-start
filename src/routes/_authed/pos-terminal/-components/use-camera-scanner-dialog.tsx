import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { CameraIcon } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";

type Options = {
  onScanned?: (code: string) => void;
};

const useCameraBaroceScanner = (options: Options) => {
  const [open, setOpen] = useState(false);

  const InternalDialog = () => {
    const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
    const [availableCameras, setAvailableCameras] = useState<
      Array<{ id: string; label: string }>
    >([]);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
      if (open) {
        Html5Qrcode.getCameras()
          .then((devices) => {
            const cams = devices.map((d) => ({ id: d.id, label: d.label }));
            setAvailableCameras(cams);
            if (cams.length > 0 && !selectedCamera) {
              setSelectedCamera(cams[0].id);
            }
          })
          .catch(() => {
            toast.error("Tidak dapat mengakses kamera");
            setOpen(false);
          });
      }
    }, [open]);

    const startCameraScan = useCallback(() => {
      if (!selectedCamera || !open) return;

      const scanner = new Html5Qrcode("camera-reader");
      html5QrCodeRef.current = scanner;

      scanner
        .start(
          selectedCamera,
          { fps: 10, qrbox: { width: 250, height: 100 } },
          (decodedText) => {
            stopCameraScan();
            options.onScanned?.(decodedText);
            setOpen(false);
          },
          () => {},
        )
        .catch(() => {
          toast.error("Gagal memulai kamera");
        });
    }, [selectedCamera, open]);

    useEffect(() => {
      if (open && selectedCamera) {
        const timer = setTimeout(startCameraScan, 300);
        return () => {
          clearTimeout(timer);
          stopCameraScan();
        };
      }
    }, [open, selectedCamera, startCameraScan]);

    const stopCameraScan = () => {
      try {
        if (html5QrCodeRef.current) {
          html5QrCodeRef.current
            .stop()
            .then(() => {
              html5QrCodeRef.current?.clear();
              html5QrCodeRef.current = null;
            })
            .catch(() => {});
        }
      } catch (error) {}
    };

    const closeCameraScanner = () => {
      stopCameraScan();
      setOpen(false);
      setSelectedCamera(null);
    };

    return (
      <Dialog
        open={open}
        onOpenChange={(open) => {
          if (!open) {
            closeCameraScanner();
          }
        }}
      >
        <DialogContent className="max-w-lg rounded-3xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <CameraIcon className="w-5 h-5 text-emerald-500" />
              Scan Barcode dengan Kamera
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Pilih kamera dan arahkan barcode ke area scan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Select
              value={selectedCamera || ""}
              onValueChange={setSelectedCamera}
            >
              <SelectTrigger className="h-12 rounded-xl border-0 bg-slate-100 focus:ring-2 focus:ring-emerald-500">
                <SelectValue placeholder="Pilih kamera..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {availableCameras.map((cam) => (
                    <SelectItem key={cam.id} value={cam.id}>
                      {cam.label || `Kamera ${cam.id.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div
              className="relative bg-slate-100 rounded-2xl overflow-hidden"
              style={{ minHeight: 300 }}
            >
              <div id="camera-reader" className="w-full" />
              {!selectedCamera && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-slate-400">Pilih kamera untuk memulai</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  type TriggerProps = {
    children: (params: {
      open: boolean;
      setOpen: Dispatch<SetStateAction<boolean>>;
    }) => ReactNode;
  };

  const Trigger = useCallback(
    (props: TriggerProps) => {
      return props.children({ open, setOpen });
    },
    [open, setOpen],
  );

  return {
    Dialog: InternalDialog,
    Trigger: Trigger,
  };
};

export { useCameraBaroceScanner };
