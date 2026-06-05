import { AppSidebar } from '#/components/sidebar/app-sidebar'
import { Header } from '#/components/sidebar/header'
import { Main } from '#/components/sidebar/main'
import { ProfileDropdown } from '#/components/sidebar/profile-dropdown'
import { Search } from '#/components/sidebar/search'
import { ThemeSwitch } from '#/components/sidebar/theme-switch'
import { SidebarInset, SidebarProvider } from '#/components/ui/sidebar'
import { SearchProvider } from '#/context/search-context'
import { ThemeProvider } from '#/context/theme-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/_authed')({
  component: RouteComponent,
})

function RouteComponent() {
  const [open, setOpen] = useState(() => {
    return localStorage.getItem("sidebar-open") === "true"
  })

  useEffect(() => {
    localStorage.setItem("sidebar-open", String(open))
  }, [open])

  return (
    <ThemeProvider>
      <SearchProvider>
        <SidebarProvider open={open} onOpenChange={setOpen}>
          <AppSidebar />
          <SidebarInset>
            <Header fixed>
              <div className='flex-1' />
              <Search />
              <ThemeSwitch />
              <ProfileDropdown />
            </Header>
            <Main>
              <Outlet />
            </Main>
          </SidebarInset>
        </SidebarProvider>
      </SearchProvider>
    </ThemeProvider>
  );
}
