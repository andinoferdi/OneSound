import * as React from 'react';

import { cn } from '@/lib/utils';

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

interface ButtonGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
  isSelected?: boolean;
  onSelect?: () => void;
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('inline-flex rounded-md border border-border bg-card p-1 shadow-sm', className)}
        {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === ButtonGroupItem) {
            return React.cloneElement(child as React.ReactElement<ButtonGroupItemProps>, {
              isSelected: (child.props as ButtonGroupItemProps).value === value,
              onSelect: () => onValueChange?.((child.props as ButtonGroupItemProps).value)
            });
          }
          return child;
        })}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';

const ButtonGroupItem = React.forwardRef<HTMLButtonElement, ButtonGroupItemProps>(
  ({ className, value, isSelected, onSelect, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type='button'
        onClick={onSelect}
        className={cn(
          'relative inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors focus:z-10 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none',
          isSelected ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-card text-foreground hover:bg-muted',
          className
        )}
        {...props}>
        {children}
      </button>
    );
  }
);

ButtonGroupItem.displayName = 'ButtonGroupItem';

export { ButtonGroup, ButtonGroupItem };
