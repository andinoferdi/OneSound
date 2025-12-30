"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RightScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
	maxHeight?: number | string;
}

export const RightScrollBar = React.forwardRef<HTMLDivElement, RightScrollBarProps>(
	({ className, style, maxHeight, children, ...props }, ref) => {
		const resolvedMax = React.useMemo(() => {
			if (typeof maxHeight === "number") return `${maxHeight}px`;
			return maxHeight;
		}, [maxHeight]);

		return (
			<div
				ref={ref}
				className={cn(
					"right-scrollbar overflow-y-auto relative",
					className
				)}
				style={{ maxHeight: resolvedMax, ...style }}
				{...props}
			>
				{children}
			</div>
		);
	}
);
RightScrollBar.displayName = "RightScrollBar";


