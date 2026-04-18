import { cn } from "@/lib/utils";

export default function Section(props: React.PropsWithChildren<{className?:string, id?:string}>) {
    return (
        <div className={cn('max-w-2xl md:max-w-5xl w-full px-6 md:px-8 mx-auto', props.className)}>
            {props.children}
        </div>
    )
}
