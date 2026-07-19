import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

// A simple minimal dropdown menu without heavy headless UI dependencies
export function DropdownMenu({ trigger, children, align = "right" }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-56 rounded-xl border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 slide-in-from-top-2",
            align === "right" ? "right-0" : "left-0"
          )}
          onClick={(e) => {
            // Close dropdown if an item is clicked
            if (e.target.closest("[role='menuitem']")) {
              setIsOpen(false);
            }
          }}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, className, destructive }) {
  return (
    <div
      role="menuitem"
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-4 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        destructive && "text-destructive hover:bg-destructive/10 hover:text-destructive",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator() {
  return <div className="h-px bg-border my-1" />;
}

export function DropdownMenuLabel({ children }) {
  return (
    <div className="px-4 py-2 text-sm font-semibold text-muted-foreground">
      {children}
    </div>
  );
}
