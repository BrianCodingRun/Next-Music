import { cn } from "@/lib/utils"

export default function FullSection(props: React.PropsWithChildren, { className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section className={cn('w-full py-4', className)}>
        {props.children}
    </section>
  )
}
