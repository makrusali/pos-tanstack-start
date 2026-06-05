import { Button } from "#/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { createPaymentMethodFn } from "#/lib/server/payment-methods";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { applyFormErrors, fileToBase64 } from "#/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { ImageUpload } from "#/components/image-upload";

export const Route = createFileRoute("/_authed/payment-methods/add")({
  component: AddPaymentMethodComponent,
});

function AddPaymentMethodComponent() {
  const navigate = useNavigate();

  const createPaymentMethod = useMutation({
    mutationFn: createPaymentMethodFn,
  });

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      status: "active" as "active" | "inactive",
      image: null as { base64: string; filename: string } | null,
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading("Menyimpan metode pembayaran...");

      try {
        const res = await createPaymentMethod.mutateAsync({
          data: {
            name: value.name,
            description: value.description || "",
            status: value.status,
            image: value.image!,
          },
        });

        if (res.success) {
          toast.success("Metode pembayaran berhasil ditambahkan", {
            id: toastId,
          });
          navigate({ to: "/payment-methods" });
        } else {
          toast.error(res.message || "Gagal menambah metode pembayaran", {
            id: toastId,
          });
        }
      } catch (err: any) {
        toast.dismiss(toastId);
        console.log(err);
        applyFormErrors(form, err);
      }
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/payment-methods" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Tambah Metode Pembayaran
          </h2>
          <p className="text-muted-foreground">
            Isi form di bawah untuk menambahkan metode pembayaran baru
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        {form.state.errorMap.onSubmit && (
          <div className="text-sm text-destructive">
            {form.state.errorMap.onSubmit}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Informasi Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.Field
              name="name"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    Nama Metode Pembayaran{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    type="text"
                    placeholder="Masukkan nama metode pembayaran"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    autoFocus
                  />
                  {field.state.meta.errors.map((err) => (
                    <p key={err} className="text-sm text-destructive">
                      {err}
                    </p>
                  ))}
                </div>
              )}
            />

            <form.Field
              name="description"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Deskripsi (Opsional)</Label>
                  <Textarea
                    id={field.name}
                    placeholder="Masukkan deskripsi metode pembayaran"
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    rows={3}
                  />
                  {field.state.meta.errors.map((err) => (
                    <p key={err} className="text-sm text-destructive">
                      {err}
                    </p>
                  ))}
                </div>
              )}
            />

            <form.Field
              name="status"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as "active" | "inactive")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.map((err) => (
                    <p key={err} className="text-sm text-destructive">
                      {err}
                    </p>
                  ))}
                </div>
              )}
            />

            <form.Field
              name="image"
              children={(field) => (
                <div className="space-y-2">
                  <Label>Gambar / Logo (Opsional)</Label>
                  <ImageUpload
                    images={
                      field.state.value
                        ? [
                            {
                              preview: field.state.value.base64,
                            },
                          ]
                        : []
                    }
                    onImagesChange={async (images) => {
                      if (images.length === 0) {
                        field.handleChange(null);
                      } else if (images[0].file) {
                        field.handleChange({
                          base64: await fileToBase64(images[0].file),
                          filename: images[0].file.name,
                        });
                      }
                    }}
                    maxImages={1}
                    onDelete={async (_) => {}}
                  />
                  {field.state.meta.errors.map((err) => (
                    <p key={err} className="text-sm text-destructive">
                      {err}
                    </p>
                  ))}
                </div>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={createPaymentMethod.isPending}>
            {createPaymentMethod.isPending
              ? "Menyimpan..."
              : "Simpan Metode Pembayaran"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/payment-methods" })}
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
