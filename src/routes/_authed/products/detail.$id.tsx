import { Button } from "#/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getProductFn } from "#/lib/server/products";
import {
  ArrowLeft,
  Package,
  Tag,
  MapPin,
  Image as ImageIcon,
  Calendar,
  DollarSign,
  Box,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Badge } from "#/components/ui/badge";
import { formatDate, formatCurrency } from "#/lib/utils";

export const Route = createFileRoute("/_authed/products/detail/$id")({
  component: ProductDetailComponent,
  loader: async ({ params, context: { queryClient } }) => {
    return queryClient.ensureQueryData({
      queryKey: ["product", params.id],
      queryFn: () =>
        getProductFn({
          data: {
            id: params.id,
          },
        }),
    });
  },
});

function ProductDetailComponent() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const initialData = Route.useLoaderData();

  const { data: productData, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () =>
      getProductFn({
        data: {
          id,
        },
      }),
    initialData,
  });

  const product = productData?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Memuat data produk...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-destructive">Produk tidak ditemukan</p>
        <Button onClick={() => navigate({ to: "/products" })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar Produk
        </Button>
      </div>
    );
  }

  // Calculate total stock from all SKUs
  const totalStock = product.productSkus.reduce((sum: number, sku: any) => {
    const skuStock = sku.stock_quantity || 0;
    return sum + skuStock;
  }, 0);

  const minPrice = Math.min(
    ...product.productSkus.map((sku: any) => sku.price),
  );
  const maxPrice = Math.max(
    ...product.productSkus.map((sku: any) => sku.price),
  );
  const hasVariants = product.productSkus.length > 1;

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 sticky top-0 bg-background z-10 py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/products" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Detail Produk</h2>
          <p className="text-muted-foreground">
            Informasi lengkap tentang produk
          </p>
        </div>
      </div>

      {/* Product Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
          <CardDescription>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge
                variant={product.type === "item" ? "default" : "secondary"}
              >
                {product.type === "item"
                  ? "Item (Barang Fisik)"
                  : "Service (Layanan)"}
              </Badge>
              <Badge variant={product.is_variant ? "default" : "secondary"}>
                {product.is_variant ? "Produk Varian" : "Produk Tunggal"}
              </Badge>
              {product.productCategories?.map((pc: any) => (
                <Badge key={pc.category.id} variant="outline">
                  {pc.category.name}
                </Badge>
              ))}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {product.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Deskripsi
              </p>
              <p className="text-sm whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Dibuat:</span>
              <span>{formatDate(product.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Diperbarui:</span>
              <span>{formatDate(product.updated_at)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            {/* Price Section - Only show if has variants */}
            {hasVariants ? (
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <DollarSign className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">Rentang Harga</p>
                <p className="text-base font-semibold">
                  {formatCurrency(minPrice, "IDR", "id-ID")}
                  {minPrice !== maxPrice &&
                    ` - ${formatCurrency(maxPrice, "IDR", "id-ID")}`}
                </p>
              </div>
            ) : (
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <DollarSign className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">Harga</p>
                <p className="text-base font-semibold">
                  {formatCurrency(
                    product.productSkus[0]?.price || 0,
                    "IDR",
                    "id-ID",
                  )}
                </p>
              </div>
            )}

            {/* Total Stock - Calculated from all SKUs */}
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Box className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Total Stok</p>
              <p className="text-base font-semibold">
                {totalStock.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SKU List - All expanded by default */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold tracking-tight">
          Daftar Varian / SKU
        </h3>

        {product.productSkus.map((sku: any) => {
          const skuStock = sku.stock_quantity || 0;

          return (
            <Card key={sku.id} className="overflow-hidden">
              {/* SKU Header */}
              <div className="p-4 border-b bg-muted/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-lg">
                        {sku.name || sku.code}
                      </h4>
                      <Badge
                        variant={
                          sku.status === "active" ? "default" : "secondary"
                        }
                      >
                        {sku.status === "active" ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">
                          Kode SKU
                        </p>
                        <p className="font-mono text-sm">{sku.code}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Unit</p>
                        <p>{sku.unit?.name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">
                          Harga Beli
                        </p>
                        <p>{formatCurrency(sku.buy_price, "IDR", "id-ID")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">
                          Harga Jual
                        </p>
                        <p className="font-medium">
                          {formatCurrency(sku.price, "IDR", "id-ID")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Stok</p>
                        <p>{skuStock.toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content - Always visible */}
              <div className="p-4 space-y-4">
                {/* Images Section */}
                {sku.images && sku.images.length > 0 && (
                  <div>
                    <h5 className="font-medium flex items-center gap-2 mb-3">
                      <ImageIcon className="h-4 w-4" />
                      Gambar Produk
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {sku.images.map((image: any) => (
                        <div key={image.id} className="space-y-1">
                          <img
                            src={image.path}
                            alt={sku.name || sku.code}
                            className="w-full h-32 object-cover rounded-lg border bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Locations Section */}
                {sku.stockProductSkus && sku.stockProductSkus.length > 0 && (
                  <div>
                    <h5 className="font-medium flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4" />
                      Lokasi Stok
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sku.stockProductSkus.map((stock: any) => (
                        <div
                          key={stock.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                        >
                          <div>
                            <p className="font-medium">
                              {stock.stockLocation?.name || "-"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Jumlah: {stock.quantity.toLocaleString("id-ID")}
                            </p>
                          </div>
                          {stock.is_primary && (
                            <Badge variant="default" className="text-xs">
                              Utama
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Images or Stock Message */}
                {(!sku.images || sku.images.length === 0) &&
                  (!sku.stockProductSkus ||
                    sku.stockProductSkus.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      Tidak ada gambar atau lokasi stok untuk varian ini
                    </div>
                  )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
