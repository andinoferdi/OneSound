import { Children, cloneElement, forwardRef, useMemo } from 'react';
import type { ElementRef, HTMLAttributes, ReactElement } from 'react';

import { cn } from '@/lib/utils';

type TAvatarGroupRef = ElementRef<'div'>;
type TAvatarGroupProps = HTMLAttributes<HTMLDivElement> & { max?: number; spacing?: number };

interface AvatarChildProps {
  className?: string;
  style?: React.CSSProperties;
}

const AvatarGroup = forwardRef<TAvatarGroupRef, TAvatarGroupProps>(
  ({ className, children, max = 1, spacing = 10, ...props }, ref) => {
    const avatarItems = Children.toArray(children).filter(
      (child): child is ReactElement<AvatarChildProps> => {
        return typeof child === 'object' && child !== null && 'props' in child;
      }
    );

    const renderContent = useMemo(() => {
      return (
        <>
          {avatarItems.slice(0, max).map((child, index) => {
            const childProps = child.props as AvatarChildProps;
            return cloneElement(child, {
              className: cn(childProps.className, 'border-2 border-background'),
              style: {
                marginLeft: index === 0 ? 0 : -spacing,
                ...childProps.style
              }
            });
          })}

          {avatarItems.length > max && (
            <div
              className={cn(
                'border-background bg-muted relative flex items-center justify-center rounded-full border-2',
                avatarItems[0]?.props?.className
              )}
              style={{ marginLeft: -spacing }}>
              <p>+{avatarItems.length - max}</p>
            </div>
          )}
        </>
      );
    }, [avatarItems, max, spacing]);

    return (
      <div ref={ref} className={cn('relative flex', className)} {...props}>
        {renderContent}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

export { AvatarGroup };
