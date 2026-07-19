import React from "react";
import { Menu, Search, Bell } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import ThemeToggle from "../components/ThemeToggle";

export function TopNav({ toggleSidebar, collapsed, admin }) {
  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-muted-foreground shrink-0">
          <Menu size={20} />
        </Button>
        <div className="max-w-md w-full hidden md:block">
          <Input 
            icon={Search} 
            placeholder="Search students, teachers, or classes..." 
            className="h-9 bg-muted/50 border-transparent focus-visible:bg-background"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border border-card"></span>
        </Button>
        
        <div className="h-6 w-px bg-border mx-1"></div>
        
        <ThemeToggle />
      </div>
    </header>
  );
}
