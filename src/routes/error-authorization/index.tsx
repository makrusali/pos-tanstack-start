import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ShieldOff, ArrowLeft } from "lucide-react";
import { Button } from "#/components/ui/button";

export const Route = createFileRoute("/error-authorization/")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  const handleGoBack = () => {
    router.history.back();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-6">
      <div className="bg-destructive/10 p-4 rounded-full">
        <ShieldOff className="w-16 h-16 text-destructive" />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Akses Ditolak</h1>
        <p className="text-muted-foreground">
          Anda tidak memiliki izin untuk mengakses halaman ini
        </p>
        <p className="text-sm text-muted-foreground">
          Error 403 - Tidak Diizinkan
        </p>
      </div>

      <Button onClick={handleGoBack} variant="outline" className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </Button>
    </div>
  );
}
