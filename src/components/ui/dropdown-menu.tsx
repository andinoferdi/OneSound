"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DropdownMenuContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

export interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onSelect?: (event: Event) => void;
  disabled?: boolean;
  asChild?: boolean;
  variant?: "default" | "destructive";
}

export interface DropdownMenuSeparatorProps {
  className?: string;
}

export interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DropdownMenuContext =
  React.createContext<DropdownMenuContextValue | null>(null);

const useDropdownMenu = () => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error("useDropdownMenu must be used within a DropdownMenu");
  }
  return context;
};

const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ children, className, open, onOpenChange, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);

    // Use controlled or uncontrolled state
    const isOpen = open !== undefined ? open : internalOpen;
    const setIsOpen = (newOpen: boolean) => {
      if (onOpenChange) {
        onOpenChange(newOpen);
      }
      if (open === undefined) {
        setInternalOpen(newOpen);
      }
    };

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node) &&
          contentRef.current &&
          !contentRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsOpen(false);
          triggerRef.current?.focus();
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [isOpen]);

    const contextValue: DropdownMenuContextValue = {
      isOpen,
      setIsOpen,
      triggerRef,
      contentRef,
    };

    return (
      <DropdownMenuContext.Provider value={contextValue}>
        <div ref={ref} className={cn("relative", className)} {...props}>
          {children}
        </div>
      </DropdownMenuContext.Provider>
    );
  }
);

DropdownMenu.displayName = "DropdownMenu";

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ children, className, asChild = false, ...props }, ref) => {
  const { setIsOpen, isOpen, triggerRef } = useDropdownMenu();

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  React.useImperativeHandle(ref, () => triggerRef.current!);

  if (asChild && React.isValidElement(children)) {
    const elementProps = {
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      className: cn(
        (children.props as { className?: string })?.className || "",
        className
      ),
      "aria-haspopup": "true",
      "aria-expanded": isOpen,
      ...props,
    };
    return React.cloneElement(children as React.ReactElement, elementProps);
  }

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-haspopup="true"
      aria-expanded={isOpen}
      {...props}
    >
      {children}
    </button>
  );
});

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

// Dropdown Menu Content Component
const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ children, className, align = "start", sideOffset = 4, ...props }, ref) => {
  const { isOpen, contentRef, triggerRef } = useDropdownMenu();

  React.useImperativeHandle(
    ref,
    () => contentRef.current as unknown as HTMLDivElement
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay for mobile */}
      <div className="fixed inset-0 z-40 md:hidden" />

      <div
        ref={contentRef}
        className={cn(
          "fixed z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          align === "end" && "right-0",
          align === "center" && "left-1/2 transform -translate-x-1/2",
          "md:absolute",
          className
        )}
        style={{
          ...(triggerRef.current && {
            top: triggerRef.current.getBoundingClientRect().bottom + sideOffset,
            left:
              align === "start"
                ? triggerRef.current.getBoundingClientRect().left
                : undefined,
            right:
              align === "end"
                ? window.innerWidth -
                  triggerRef.current.getBoundingClientRect().right
                : undefined,
          }),
        }}
        {...props}
      >
        {children}
      </div>
    </>
  );
});

DropdownMenuContent.displayName = "DropdownMenuContent";

// Dropdown Menu Item Component
const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuItemProps
>(
  (
    {
      children,
      className,
      onClick,
      onSelect,
      disabled = false,
      asChild = false,
      variant = "default",
      ...props
    },
    ref
  ) => {
    const { setIsOpen } = useDropdownMenu();

    const handleClick = (event?: React.MouseEvent) => {
      if (disabled) return;

      if (onClick) {
        onClick();
      }
      if (onSelect && event) {
        onSelect(event.nativeEvent);
      }
      setIsOpen(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleClick();
      }
    };

    const itemClasses = cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none",
      variant === "destructive"
        ? "text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
        : "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
      "data-disabled:pointer-events-none data-disabled:opacity-50",
      disabled && "pointer-events-none opacity-50",
      className
    );

    if (asChild && React.isValidElement(children)) {
      const elementProps = {
        ref,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        className: cn(
          itemClasses,
          (children.props as { className?: string })?.className || ""
        ),
        ...props,
      };
      return React.cloneElement(children as React.ReactElement, elementProps);
    }

    return (
      <div
        ref={ref}
        className={itemClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="menuitem"
        tabIndex={-1}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    role="separator"
    {...props}
  />
));

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
}

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  DropdownMenuLabelProps
>(({ children, className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
  </div>
));

DropdownMenuLabel.displayName = "DropdownMenuLabel";

export interface DropdownMenuCheckboxItemProps {
  children: React.ReactNode;
  className?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuCheckboxItemProps
>(
  (
    {
      children,
      className,
      checked = false,
      onCheckedChange,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const { setIsOpen } = useDropdownMenu();

    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
      setIsOpen(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleClick();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:bg-accent focus:text-accent-foreground",
          "data-disabled:pointer-events-none data-disabled:opacity-50",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="menuitemcheckbox"
        aria-checked={checked}
        tabIndex={-1}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {checked && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>
        {children}
      </div>
    );
  }
);

DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
};
