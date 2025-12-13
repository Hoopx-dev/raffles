"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { useEventStatus } from "@/lib/hooks/useHomeData";
import { formatNumber } from "@/lib/utils";

interface CumulativeScoreProps {
  homeTeams: number;
  awayTeams: number;
}

export function CumulativeScore({
  homeTeams,
  awayTeams,
}: CumulativeScoreProps) {
  const { t } = useTranslation();
  const { isEventEnded } = useEventStatus();

  return (
    <div className='mx-4 mb-4'>
      <p className='text-white font-medium text-sm mb-2'>
        {t.cumulative.title}
      </p>
      <div
        className='p-6 rounded-2xl'
        style={{
          background:
            "radial-gradient(circle at center, #326046 0%, #183824 100%)",
        }}
      >
        <div className='flex items-center justify-center gap-6'>
          {/* Home Teams */}
          <div className='text-center flex-1'>
            <p className='text-4xl font-bold text-[#D99739]'>
              {formatNumber(homeTeams)}
            </p>
            <p className='text-white/80 text-xs uppercase tracking-wider mt-1'>
              {t.cumulative.homeTeams}
            </p>
          </div>

          {/* Status & Divider */}
          <div className='flex flex-col items-center'>
            <span
              className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                isEventEnded
                  ? "bg-red-500/30 text-red-400"
                  : "bg-green-500/30 text-green-400"
              }`}
            >
              {isEventEnded ? "Final" : "Ongoing"}
            </span>
            <div className='text-3xl font-bold text-white/60 mt-1'>:</div>
          </div>

          {/* Away Teams */}
          <div className='text-center flex-1'>
            <p className='text-4xl font-bold text-[#D99739]'>
              {formatNumber(awayTeams)}
            </p>
            <p className='text-white/80 text-xs uppercase tracking-wider mt-1'>
              {t.cumulative.awayTeams}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
