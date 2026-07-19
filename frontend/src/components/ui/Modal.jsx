import React from "react";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

export function Modal({ isOpen, onClose, title, description, children, maxWidth = "max-w-lg" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className={cn("w-full bg-card rounded-2xl shadow-modal border animate-slide-up flex flex-col max-h-[90vh]", maxWidth)} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
