interface ProgressStatsProps {
  knownCount: number;
  unknownCount: number;
  progressPercentage: number;
}

export default function ProgressStats({ knownCount, unknownCount, progressPercentage }: ProgressStatsProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Progress</span>
        <span>{progressPercentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-3 text-sm">
        <div className="text-green-600">
          <span>{knownCount}</span> 외움
        </div>
        <div className="text-red-600">
          <span>{unknownCount}</span> 모름
        </div>
      </div>
    </div>
  );
}
