import { cn } from "@/lib/utils";

type TitleProps = React.HTMLAttributes<HTMLHeadingElement>;

const Title = ({ className, ...props }: TitleProps) => {
  return (
    <h1
      className={cn(
        "text-3xl font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
};

export default Title;
