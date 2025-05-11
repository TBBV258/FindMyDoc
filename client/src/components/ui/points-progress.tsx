import { cn } from "@/lib/utils";

interface PointsProgressProps {
  current: number;
  total: number;
  className?: string;
}

export function PointsProgress({ current, total, className }: PointsProgressProps) {
  const percentage = Math.min(Math.round((current / total) * 100), 100);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="font-roboto font-medium">Your Activity Points</h3>
          <p className="text-2xl font-bold text-primary">
            {current} <span className="text-sm text-darkGray font-normal">/ {total}</span>
          </p>
        </div>
        <div className="bg-primary/10 p-2 rounded-full">
          <i className="ri-award-line text-2xl text-primary"></i>
        </div>
      </div>
      <div className="w-full bg-lightGray rounded-full h-2 mb-2">
        <div className="points-progress" style={{ width: `${percentage}%` }}></div>
      </div>
      {current < total && (
        <p className="text-xs text-darkGray">
          Earn {total - current} more points for a free document verification!
        </p>
      )}
      {current >= total && (
        <p className="text-xs text-green-600">
          Congratulations! You've earned a free document verification.
        </p>
      )}
    </div>
  );
}
