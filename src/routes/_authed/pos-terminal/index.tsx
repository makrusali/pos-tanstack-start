import { getCategoriesFn } from "#/lib/server/categories";
import { getPosProductsFn } from "#/lib/server/pos";
import { createFileRoute } from "@tanstack/react-router";
import { getCustomersFn } from "#/lib/server/customers";
import { PosProvider } from "./-components/use-pos";
import { getPaymentMethodsFn } from "#/lib/server/payment-methods";
import { PosPage } from "./-components/pos-page";
import { Suspense } from "react";

export const Route = createFileRoute("/_authed/pos-terminal/")({
  component: RouteComponent,
  loader: async () => {
    const [categories, products, customers, paymentMethods] = await Promise.all(
      [
        getCategoriesFn(),
        getPosProductsFn(),
        getCustomersFn(),
        getPaymentMethodsFn(),
      ],
    );

    return {
      categories: categories?.data || [],
      products: products?.data || [],
      customers: customers?.data || [],
      paymentMethods: paymentMethods?.data || [],
    };
  },
});

function RouteComponent() {
  return (
    <Suspense fallback={<div>Loading ...</div>}>
      <PosProvider>
        <PosPage />
      </PosProvider>
    </Suspense>
  );
}
