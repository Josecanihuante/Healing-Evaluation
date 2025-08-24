"use client";

import React from 'react';
import { SidebarInset, useSidebar } from '@/components/ui/sidebar';
import MainSidebar from './main-sidebar';

export default function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, isMobile } = useSidebar();

  React.useEffect(() => {
    // any logic that depends on isCollapsed or isMobile
  }, [isCollapsed, isMobile]);

  return (
    <>
      <MainSidebar />
      <SidebarInset>{children}</SidebarInset>
    </>
  );
}