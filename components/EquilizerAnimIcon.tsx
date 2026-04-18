export default function EquilizerAnimIcon() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-4 h-4">
        <div 
          className="w-[2px] h-full bg-primary absolute left-0 bottom-0 animate-equilizer" 
          style={{animationDuration: '1.7s'}}
        />
        <div 
          className="w-[2px] h-full bg-primary absolute left-1 bottom-0 animate-equilizer duration-700"
          style={{animationDuration: '2s'}}
        />
        <div 
          className="w-[2px] h-full bg-primary absolute left-[calc(2*0.25rem)] bottom-0 animate-equilizer duration-200"
          style={{animationDuration: '2.1s'}}
        />
        <div 
          className="w-[2px] h-full bg-primary absolute left-[calc(3*0.25rem)] bottom-0 animate-equilizer"
          style={{animationDuration: '1.5s'}}
        />
      </div>
    </div>
  )
}
