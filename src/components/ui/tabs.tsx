"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted/80 border border-border/60 text-muted-foreground inline-flex h-10 w-fit items-center justify-center rounded-xl p-1 gap-1",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer text-muted-foreground hover:text-foreground",
        "data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:font-semibold data-[selected]:shadow-xs",
        "aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:font-semibold aria-selected:shadow-xs",
        "data-active:bg-primary data-active:text-primary-foreground data-active:font-semibold data-active:shadow-xs",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("outline-none data-[hidden]:hidden", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
