"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputBase = "block w-full bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:border-border disabled:cursor-not-allowed disabled:opacity-50 border border-border";

const inputVariants = cva(inputBase, {
	variants: {
		variant: {
			default: "",
			subtle: "bg-background/80 backdrop-blur-sm",
			ghost: "bg-transparent",
		},
		uiSize: {
			sm: "h-9 px-3 text-sm",
			default: "h-10 px-3.5 text-sm",
			lg: "h-12 px-4 text-base",
		},
		radius: {
			sm: "rounded-md",
			default: "rounded-xl",
			full: "rounded-full",
		},
	},
	defaultVariants: {
		variant: "default",
		uiSize: "default",
		radius: "default",
	},
});

export interface InputProps
extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
		VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, variant, uiSize, radius, ...props }, ref) => {
		return (
			<input ref={ref} className={cn(inputVariants({ variant, uiSize, radius, className }))} {...props} />
		);
	}
);
Input.displayName = "Input";

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
		VariantProps<typeof inputVariants> {
		autoResize?: boolean;
		maxHeight?: number;
	}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, variant, uiSize, radius, autoResize = true, maxHeight = 160, onChange, style, ...props }, ref) => {
		const innerRef = React.useRef<HTMLTextAreaElement | null>(null);
		const combinedRef = React.useCallback(
			(node: HTMLTextAreaElement) => {
				innerRef.current = node;
				if (typeof ref === "function") ref(node);
				else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
			},
			[ref]
		);

		const resize = React.useCallback(() => {
			const el = innerRef.current;
			if (!el || !autoResize) return;
			el.style.height = "auto";
			const next = Math.min(maxHeight, el.scrollHeight);
			el.style.height = `${next}px`;
		}, [autoResize, maxHeight]);

		React.useEffect(() => {
			resize();
		}, [resize, props.value]);

		const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
			if (autoResize) resize();
			onChange?.(e);
		};

		return (
			<textarea
				ref={combinedRef}
				rows={1}
				className={cn("min-h-10 py-2", inputVariants({ variant, uiSize, radius, className }))}
				style={{ 
					overflow: autoResize && maxHeight ? "auto" : "hidden", 
					...style 
				}}
				onChange={handleChange}
				{...props}
			/>
		);
	}
);
Textarea.displayName = "Textarea";

export { Input, Textarea };


