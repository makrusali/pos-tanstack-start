import { Button } from "#/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { createCustomerFn } from "#/lib/server/customers";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { applyFormErrors } from "#/lib/utils";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authed/suppliers/add")({
  component: AddCustomerComponent,
});

function AddCustomerComponent() {
  const navigate = useNavigate();

  const createCustomer = useMutation({
    mutationFn: createCustomerFn,
  });

  const form = useForm({
    defaultValues: {
      name: "",
      address: "",
      email: "",
      phone: "",
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading("Menyimpan customer...");

      try {
        const res = await createCustomer.mutateAsync({
          data: value,
        });

        if (res.success) {
          toast.success(res.message, { id: toastId });
          navigate({ to: "/customers" });
        } else {
          toast.error(res.message || "Gagal menambah customer", {
            id: toastId,
          });
        }
      } catch (err: any) {
        toast.dismiss(toastId);
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
          onClick={() => navigate({ to: "/customers" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tambah Customer</h2>
          <p className="text-muted-foreground">
            Isi form di bawah untuk menambahkan customer baru
          </p>
        </div>
      </div>

      <div className="max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {form.state.errorMap.onSubmit && (
            <div className="text-sm text-destructive">
              {form.state.errorMap.onSubmit}
            </div>
          )}

          <form.Field
            name="name"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Nama Customer <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  type="text"
                  placeholder="Masukkan nama customer"
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
            name="email"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email (Opsional)</Label>
                <Input
                  id={field.name}
                  type="email"
                  placeholder="Masukkan email customer"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
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
            name="phone"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Nomor Telepon (Opsional)</Label>
                <Input
                  id={field.name}
                  type="tel"
                  placeholder="Masukkan nomor telepon customer"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Harus diawali dengan kode negara, contoh: 628123456789
                </p>
                {field.state.meta.errors.map((err) => (
                  <p key={err} className="text-sm text-destructive">
                    {err}
                  </p>
                ))}
              </div>
            )}
          />

          <form.Field
            name="address"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Alamat (Opsional)</Label>
                <Textarea
                  id={field.name}
                  placeholder="Masukkan alamat customer"
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

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={createCustomer.isPending}>
              {createCustomer.isPending ? "Menyimpan..." : "Simpan Customer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/customers" })}
            >
              Batal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
