import {
  LayoutDashboard,
  FileText,
  Settings as SettingsIcon,
  Package,
  Tag,
  Scale,
  CreditCard,
  Monitor,
  Receipt,
  TrendingUp,
  ArrowUpDown,
  ShoppingCart,
  DollarSign,
  MapPin,
  Users,
  ShieldCheck,
} from "lucide-react";

import type { SidebarData } from "../types";

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: "Utama",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Laporan",
          url: "/reports",
          icon: FileText,
        },
        {
          title: "Pengaturan",
          url: "/settings",
          icon: SettingsIcon,
        },
      ],
    },
    {
      title: "Produk",
      items: [
        {
          title: "Kategori",
          url: "/categories",
          icon: Tag,
        },
        {
          title: "Satuan",
          url: "/units",
          icon: Scale,
        },
        {
          title: "Produk",
          url: "/products",
          icon: Package,
        },
      ],
    },
    {
      title: "Pembayaran",
      items: [
        {
          title: "Metode Pembayaran",
          url: "/payment-methods",
          icon: CreditCard,
        },
        {
          title: "Terminal POS",
          url: "/pos-terminal",
          icon: Monitor,
        },
        {
          title: "Transaksi",
          url: "/transactions",
          icon: Receipt,
        },
      ],
    },
    {
      title: "Stok",
      items: [
        {
          title: "Perpindahan Stok",
          url: "/stock-movements",
          icon: TrendingUp,
        },
        {
          title: "Penyesuaian Stok",
          url: "/stock-adjustment",
          icon: ArrowUpDown,
        },
        {
          title: "Pembelian Stok",
          url: "/purchase-stocks",
          icon: ShoppingCart,
        },
        {
          title: "Lokasi Stok",
          url: "/stock-locations",
          icon: MapPin,
        },
      ],
    },
    {
      title: "Keuangan",
      items: [
        {
          title: "Pengeluaran",
          url: "/expenses",
          icon: DollarSign,
        },
      ],
    },
    {
      title: "Pengguna & Akses",
      items: [
        {
          title: "Pengguna",
          url: "/users",
          icon: Users,
        },
        {
          title: "Peran & Izin",
          url: "/role-permissions",
          icon: ShieldCheck,
        },
      ],
    },
  ],
};
