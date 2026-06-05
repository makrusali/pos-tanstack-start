import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { loginFn } from "#/lib/server/auth";
import { getStoreSettings } from "#/lib/server/store-settings";

import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";

import { GalleryVerticalEndIcon, Loader2Icon } from "lucide-react";
import { applyFormErrors } from "#/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/login")({
  component: RouteComponent,
  loader: async () => {
    const setting = await getStoreSettings();

    return { setting };
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { setting } = Route.useLoaderData();

  const login = useMutation({
    mutationFn: loginFn,
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },

    onSubmit: async ({ value }) => {
      try {
        const res = await login.mutateAsync({
          data: value,
        });

        if (res.success) {
          toast.success(res.message);
          navigate({
            to: "/dashboard",
            replace: true,
          });
        }
      } catch (err: any) {
        applyFormErrors(form, err);
      }
    },
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEndIcon className="size-4" />
          </div>

          {setting.store_name}
        </a>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Selamat datang</CardTitle>

              <CardDescription>
                Masuk menggunakan email dan password anda.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  form.handleSubmit();
                }}
              >
                <FieldGroup>
                  {form.state.errorMap.onSubmit && (
                    <div className="text-sm text-red-500">
                      {form.state.errorMap.onSubmit}
                    </div>
                  )}

                  <form.Field
                    name="email"
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>

                        <Input
                          id={field.name}
                          type="email"
                          placeholder="m@example.com"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />

                        {field.state.meta.errors.map((err) => (
                          <p key={err} className="text-sm text-red-500">
                            {err}
                          </p>
                        ))}
                      </Field>
                    )}
                  />

                  <form.Field
                    name="password"
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>

                        <Input
                          id={field.name}
                          type="password"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />

                        {field.state.meta.errors.map((err) => (
                          <p key={err} className="text-sm text-red-500">
                            {err}
                          </p>
                        ))}
                      </Field>
                    )}
                  />

                  <Field>
                    <Button type="submit" disabled={login.isPending}>
                      {login.isPending && (
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {login.isPending ? "Loading..." : "Login"}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
