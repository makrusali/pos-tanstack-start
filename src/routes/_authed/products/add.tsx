import { Button } from "#/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import {
  createProductFn,
  getCreateProductFormInitFn,
} from "#/lib/server/products";
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
import {
  applyFormErrors,
  fileToBase64,
  inputFormatRP,
  inputParseRP,
} from "#/lib/utils";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Switch } from "#/components/ui/switch";
import { ImageUpload } from "#/components/image-upload";
import { Checkbox } from "#/components/ui/checkbox";
import { MultiSelect } from "#/components/multi-select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "#/components/ui/input-group";
import type { CreateSkuForm } from "./-components/types";

export const Route = createFileRoute("/_authed/products/add")({
  component: AddProductComponent,
  loader: async () => {
    const res = await getCreateProductFormInitFn();
    return res.data!;
  },
});

function AddProductComponent() {
  const navigate = useNavigate();
  const { categories, units, stockLocations, placeholderSkuCodes } =
    Route.useLoaderData();

  const createProduct = useMutation({
    mutationFn: createProductFn,
  });

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      type: "item" as "item" | "service",
      is_variant: false,
      category_ids: [] as string[],
      skus: [
        {
          buy_price: 0,
          code: placeholderSkuCodes[0],
          images: [],
          name: "",
          price: 0,
          status: "active",
          stock_locations: [],
          unit_id: "",
          id: "",
        },
      ] as CreateSkuForm[],
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading("Menyimpan produk...");

      try {
        const skusWithImages = await Promise.all(
          value.skus.map(async (sku) => {
            const base64Images = sku.images.map((image) => ({
              base64: image.path!,
              filename: image.file!.name,
            }));

            return {
              code: sku.code,
              name: sku.name,
              price: sku.price,
              buy_price: sku.buy_price,
              status: sku.status,
              unit_id: sku.unit_id,
              images: base64Images,
              stock_locations: sku.stock_locations,
            };
          }),
        );

        const res = await createProduct.mutateAsync({
          data: {
            ...value,
            skus: skusWithImages,
          },
        });

        if (res.success) {
          toast.success("Produk berhasil ditambahkan", { id: toastId });
          navigate({ to: "/products" });
        } else {
          toast.error(res.message || "Gagal menambah produk", { id: toastId });
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
          onClick={() => navigate({ to: "/products" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tambah Produk</h2>
          <p className="text-muted-foreground">
            Isi form di bawah untuk menambahkan produk baru
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

        {/* Product Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Produk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.Field
              name="name"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    Nama Produk <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    type="text"
                    placeholder="Masukkan nama produk"
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
                    placeholder="Masukkan deskripsi produk"
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
              name="type"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    Tipe Produk <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as "item" | "service")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe produk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="item">Item (Barang Fisik)</SelectItem>
                      <SelectItem value="service">Service (Layanan)</SelectItem>
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
              name="category_ids"
              children={(field) => (
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <MultiSelect
                    options={categories.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                    placeholder="Pilih kategori produk"
                    variant={"default"}
                    onValueChange={field.handleChange}
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
              name="is_variant"
              children={(field) => (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Produk Varian</Label>
                      <p className="text-sm text-muted-foreground">
                        Aktifkan jika produk memiliki varian (ukuran, warna,
                        dll)
                      </p>
                    </div>
                    <Switch
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />
                  </div>
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

        {/* SKUs Section */}
        <form.Field name="skus" mode="array">
          {(skuField) => (
            <div className="space-y-4">
              {skuField.state.value.map((_, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">
                      {form.state.values["is_variant"]
                        ? `Varian ${index + 1}`
                        : "Detail Produk"}
                    </CardTitle>
                    <form.Subscribe
                      selector={(s) => ({
                        is_variant: s.values.is_variant,
                        skus: s.values.skus,
                      })}
                    >
                      {({ skus, is_variant }) =>
                        is_variant &&
                        skus.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => skuField.removeValue(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )
                      }
                    </form.Subscribe>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form.Field
                      name={`skus[${index}].code`}
                      children={(field) => (
                        <div className="space-y-2">
                          <Label>
                            Kode SKU <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            placeholder="12 karakter (contoh: SKU0012024001)"
                            value={field.state.value}
                            onChange={(e) =>
                              field.handleChange(e.target.value.toUpperCase())
                            }
                            maxLength={12}
                          />
                          <p className="text-xs text-muted-foreground">
                            Kode SKU harus 12 karakter, hanya huruf kapital dan
                            angka
                          </p>

                          {field.state.meta.errors.map((err) => (
                            <p key={err} className="text-sm text-destructive">
                              {err}
                            </p>
                          ))}
                        </div>
                      )}
                    />

                    <form.Subscribe selector={(s) => s.values.is_variant}>
                      {(is_variant) =>
                        is_variant && (
                          <form.Field
                            name={`skus[${index}].name`}
                            children={(field) => (
                              <div className="space-y-2">
                                <Label>
                                  Nama Varian{" "}
                                  <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  placeholder="Contoh: Merah, XL, 250gr"
                                  value={field.state.value}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                />

                                {field.state.meta.errors.map((err) => (
                                  <p
                                    key={err}
                                    className="text-sm text-destructive"
                                  >
                                    {err}
                                  </p>
                                ))}
                              </div>
                            )}
                          />
                        )
                      }
                    </form.Subscribe>

                    <form.Field name={`skus[${index}].unit_id`}>
                      {(field) => (
                        <div className="space-y-2">
                          <Label>
                            Unit <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={field.state.value}
                            onValueChange={(value) => field.handleChange(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map((unit: any) => (
                                <SelectItem key={unit.id} value={unit.id}>
                                  {unit.name} (
                                  {unit.type === "integer"
                                    ? "Bilangan Bulat"
                                    : "Desimal"}
                                  )
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {field.state.meta.errors.map((err) => (
                            <p key={err} className="text-sm text-destructive">
                              {err}
                            </p>
                          ))}
                        </div>
                      )}
                    </form.Field>

                    <div className="grid grid-cols-2 gap-4">
                      <form.Field name={`skus[${index}].buy_price`}>
                        {(field) => (
                          <div className="space-y-2">
                            <Label>Harga Beli (Opsional)</Label>
                            <InputGroup>
                              <InputGroupAddon>Rp.</InputGroupAddon>

                              <InputGroupInput
                                type="text"
                                placeholder=""
                                value={inputFormatRP(field.state.value)}
                                onChange={(e) =>
                                  field.handleChange(
                                    inputParseRP(e.target.value),
                                  )
                                }
                              />
                            </InputGroup>
                          </div>
                        )}
                      </form.Field>

                      <form.Field name={`skus[${index}].price`}>
                        {(field) => (
                          <div className="space-y-2">
                            <Label>
                              Harga Jual{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <InputGroup>
                              <InputGroupAddon>Rp.</InputGroupAddon>
                              <InputGroupInput
                                type="text"
                                placeholder=""
                                value={inputFormatRP(field.state.value)}
                                onChange={(e) =>
                                  field.handleChange(
                                    inputParseRP(e.target.value),
                                  )
                                }
                              />
                            </InputGroup>
                          </div>
                        )}
                      </form.Field>
                    </div>

                    <form.Field
                      name={`skus[${index}].stock_locations`}
                      mode="array"
                    >
                      {(stockLocationField) => (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>Lokasi Stok Awal</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                stockLocationField.pushValue({
                                  stock_location_id: "",
                                  quantity: 0,
                                  is_primary: false,
                                })
                              }
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Tambah Lokasi
                            </Button>
                          </div>

                          {stockLocationField.state.value.map(
                            (_, stockLocationIndex) => (
                              <div
                                key={String(stockLocationIndex)}
                                className="border rounded-lg p-4 space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <Label>
                                    Lokasi {String(stockLocationIndex + 1)}
                                  </Label>
                                  {stockLocationField.state.value.length >
                                    0 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        stockLocationField.removeValue(
                                          stockLocationIndex,
                                        )
                                      }
                                    >
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  )}
                                </div>

                                <form.Field
                                  name={`skus[${index}].stock_locations[${stockLocationIndex}].stock_location_id`}
                                >
                                  {(field) => (
                                    <div className="space-y-2">
                                      <Select
                                        value={field.state.value}
                                        onValueChange={(value) =>
                                          field.handleChange(value)
                                        }
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Pilih lokasi stok" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {stockLocations.map((loc: any) => (
                                            <SelectItem
                                              key={loc.id}
                                              value={loc.id}
                                            >
                                              {loc.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      {field.state.meta.errors.map((err) => (
                                        <p
                                          key={err}
                                          className="text-sm text-destructive"
                                        >
                                          {err}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </form.Field>

                                <form.Field
                                  name={`skus[${index}].stock_locations[${stockLocationIndex}].quantity`}
                                >
                                  {(field) => (
                                    <div className="space-y-2">
                                      <Label>Jumlah Stok Awal</Label>
                                      <InputGroup>
                                        <InputGroupAddon align={"block-start"}>
                                          <form.Subscribe
                                            selector={(state) =>
                                              state.values.skus[index].unit_id
                                            }
                                          >
                                            {(unit_id) =>
                                              unit_id
                                                ? units.find(
                                                    (i) => i.id == unit_id,
                                                  )?.name
                                                : "Pilih Tipe Unit"
                                            }
                                          </form.Subscribe>
                                        </InputGroupAddon>
                                        <InputGroupInput
                                          type="number"
                                          placeholder="0"
                                          value={field.state.value}
                                          onChange={(e) =>
                                            field.handleChange(
                                              Number(e.target.value),
                                            )
                                          }
                                        />
                                      </InputGroup>
                                      {field.state.meta.errors.map((err) => (
                                        <p
                                          key={err}
                                          className="text-sm text-destructive"
                                        >
                                          {err}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </form.Field>

                                <form.Field
                                  name={`skus[${index}].stock_locations[${stockLocationIndex}].is_primary`}
                                >
                                  {(field) => (
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`skus[${index}].stock_locations[${stockLocationIndex}].is_primary`}
                                        checked={field.state.value}
                                        onCheckedChange={(checked) => {
                                          stockLocationField.setValue((old) => {
                                            return old.map((item, index) =>
                                              index == stockLocationIndex
                                                ? {
                                                    ...item,
                                                    is_primary: checked == true,
                                                  }
                                                : {
                                                    ...item,
                                                    is_primary:
                                                      checked == true
                                                        ? false
                                                        : item.is_primary,
                                                  },
                                            );
                                          });
                                        }}
                                      />
                                      <Label
                                        className="text-sm font-normal"
                                        htmlFor={`skus[${index}].stock_locations[${stockLocationIndex}].is_primary`}
                                      >
                                        Lokasi Stok Utama
                                      </Label>
                                      {field.state.meta.errors.map((err) => (
                                        <p
                                          key={err}
                                          className="text-sm text-destructive"
                                        >
                                          {err}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </form.Field>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </form.Field>

                    <form.Field name={`skus[${index}].status`}>
                      {(field) => (
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={field.state.value}
                            onValueChange={(value) =>
                              field.handleChange(value as "active" | "inactive")
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Aktif</SelectItem>
                              <SelectItem value="inactive">Nonaktif</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </form.Field>

                    <form.Field name={`skus[${index}].images`}>
                      {(field) => (
                        <ImageUpload
                          images={field.state.value}
                          onImagesChange={(images) =>
                            field.handleChange(images)
                          }
                          maxImages={5}
                          onUpload={async (file) => {
                            return { path: await fileToBase64(file) };
                          }}
                          onDelete={async (_) => {}}
                        />
                      )}
                    </form.Field>
                  </CardContent>
                </Card>
              ))}

              <div className="text-right">
                <form.Subscribe selector={(s) => s.values.is_variant}>
                  {(is_variant) =>
                    is_variant && (
                      <Button
                        type="button"
                        onClick={() =>
                          skuField.pushValue({
                            code: placeholderSkuCodes[
                              skuField.state.value.length
                            ],
                            name: "",
                            price: 0,
                            buy_price: 0,
                            status: "active",
                            unit_id: "",
                            images: [],
                            stock_locations: [],
                          })
                        }
                      >
                        Tambah Variant
                      </Button>
                    )
                  }
                </form.Subscribe>
              </div>
            </div>
          )}
        </form.Field>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={createProduct.isPending}>
            {createProduct.isPending ? "Menyimpan..." : "Simpan Produk"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/products" })}
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
