import { ReactNode, useState } from "react";
import { SidebarLeft } from "./SidebarLeft";
import { SidebarRight } from "./SidebarRight";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommunityLayoutProps {
    children: ReactNode;
}

export const CommunityLayout = ({ children }: CommunityLayoutProps) => {
    return (
        <div className="h-[calc(100vh-0px)] bg-black overflow-hidden flex relative">

            {/* MOBILE: Left Sidebar Drawer */}
            <div className="md:hidden absolute top-4 left-4 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-black/50 backdrop-blur-md border-white/10 text-white">
                            <Menu className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-r border-white/10 bg-zinc-950 w-80">
                        <SidebarLeft />
                    </SheetContent>
                </Sheet>
            </div>

            {/* MOBILE: Right Sidebar Drawer */}
            <div className="xl:hidden absolute top-4 right-4 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-black/50 backdrop-blur-md border-white/10 text-white">
                            <PanelRightOpen className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="p-0 border-l border-white/10 bg-zinc-950 w-80">
                        <SidebarRight />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Left Panel - Navigation (18% - Fixed Width ~280px) */}
            <div className="w-[280px] hidden md:block h-full z-20 shadow-xl">
                <SidebarLeft />
            </div>

            {/* Center Panel - Main Content (Fluid) */}
            <div className="flex-1 h-full relative z-10 flex flex-col min-w-0">
                {children}
            </div>

            {/* Right Panel - Intelligence (22% - Fixed Width ~320px) */}
            <div className="w-[320px] hidden xl:block h-full z-20 shadow-xl border-l border-white/5">
                <SidebarRight />
            </div>
        </div>
    );
};

