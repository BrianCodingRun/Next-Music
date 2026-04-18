import { useSession } from "next-auth/react"

export default function Like() {

    const { data: session }: any = useSession()

    return (
        <div className='flex-grow h-4/5 rounded-xl mx-2 py-4 px-6 space-y-4 bg-neutral-900'>
            <h1 className='font-sans text-base font-bold'>Like</h1>
        </div>
    )
}
