"use client"

import * as React from "react"
import { ChevronsLeft, ChevronsRight } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// --- 1. CONTEXT ---

interface SidebarContextProps {
  isCollapsed: boolean
  isMobile: boolean
  toggleCollapse: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(
  undefined
)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

// --- 2. PROVIDER ---

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  const [isCollapsed, setIsCollapsed] = React.useState(isMobile)

  const toggleCollapse = React.useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  React.useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true)
    }
  }, [isMobile])

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, isMobile, toggleCollapse }}
    >
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  )
}

// --- 3. SIDEBAR WRAPPERS ---

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isCollapsed } = useSidebar()
  return (
    <div
      ref={ref}
      data-collapsed={isCollapsed}
      className={cn(
        "fixed z-50 flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out",
        "data-[collapsed=false]:w-60 data-[collapsed=true]:w-14",
        className
      )}
      {...props}
    />
  )
})
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isCollapsed } = useSidebar()
  return (
    <div
      ref={ref}
      data-collapsed={isCollapsed}
      className={cn(
        "sticky top-0 flex items-center border-b",
        "data-[collapsed=false]:gap-2 data-[collapsed=false]:px-3 data-[collapsed=true]:px-3.5",
        "h-14",
        className
      )}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full flex-1 flex-col overflow-y-auto overflow-x-hidden",
      className
    )}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isCollapsed, toggleCollapse } = useSidebar()

  return (
    <div
      ref={ref}
      data-collapsed={isCollapsed}
      className={cn("sticky bottom-0 mt-auto border-t", className)}
      {...props}
    >
      <div
        data-collapsed={isCollapsed}
        className={cn(
          "flex items-center",
          "h-14",
          "data-[collapsed=false]:px-3 data-[collapsed=true]:justify-center data-[collapsed=true]:px-3.5"
        )}
      >
        <SidebarMenuButton
          onClick={toggleCollapse}
          tooltip={isCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
          tooltipSide="right"
        >
          {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
        </SidebarMenuButton>
      </div>
    </div>
  )
})
SidebarFooter.displayName = "SidebarFooter"

// --- 4. SIDEBAR MENU ---

const SidebarMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full flex-1 flex-col gap-1 overflow-x-hidden px-2 py-4",
      className
    )}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("w-full", className)} {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

interface SidebarMenuButtonProps extends ButtonProps {
  isActive?: boolean
  tooltip?: React.ReactNode
  tooltipSide?: "top" | "bottom" | "left" | "right"
  tooltipSideOffset?: number
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(
  (
    {
      className,
      isActive,
      tooltip,
      asChild,
      tooltipSide,
      tooltipSideOffset,
      ...props
    },
    ref
  ) => {
    const { isCollapsed } = useSidebar()
    const isTooltipDisabled = !isCollapsed || !tooltip

    const button = (
      <Button
        ref={ref}
        data-active={isActive}
        data-collapsed={isCollapsed}
        variant="ghost"
        className={cn(
          "h-10 w-full justify-start overflow-hidden whitespace-nowrap",
          "data-[collapsed=false]:gap-2 data-[collapsed=false]:px-3",
          "data-[collapsed=true]:justify-center data-[collapsed=true]:px-0",
          "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
          className
        )}
        asChild={asChild}
        {...props}
      />
    )

    if (isTooltipDisabled) {
      return button
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side={tooltipSide} sideOffset={tooltipSideOffset}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

// --- 5. SIDEBAR INSET (MAIN CONTENT) ---

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isCollapsed } = useSidebar()

  return (
    <div
      ref={ref}
      data-collapsed={isCollapsed}
      className={cn(
        "transition-all duration-300 ease-in-out",
        "data-[collapsed=false]:ml-60 data-[collapsed=true]:ml-14",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

// --- 6. EXPORTS ---

export {
  SidebarProvider,
  useSidebar,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
}
