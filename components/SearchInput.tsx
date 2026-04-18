import { Input } from "./ui/input";
import { CiSearch } from "react-icons/ci";
import { Label } from "./ui/label";

export default function SearchInput({handleInputChange} : {handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="w-full max-w-sm relative">
        <CiSearch className="w-6 h-6 absolute left-2.5 top-2.5 text-gray-500 dark:text-gray-400" />
        <Label htmlFor="search" className="sr-only">Rechercher</Label>
        <Input type="search" id="search" name="search" placeholder="Que souhaitez-vous écouter ou regarder ?" className="cursor-pointer h-11 border-none pl-10 rounded-full font-sans text-base bg-neutral-900" onChange={handleInputChange} />
    </div>
  )
}