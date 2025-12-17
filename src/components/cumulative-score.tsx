"use client";

import { useTranslation } from "@/i18n/useTranslation";
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
          {/* Away Teams (Left) */}
          <div className='text-center flex-1'>
            <p className='text-4xl font-bold text-[#D99739]'>
              {formatNumber(awayTeams)}
            </p>
            <p className='text-white/80 text-xs uppercase tracking-wider mt-1'>
              {t.cumulative.awayTeams}
            </p>
          </div>

          {/* Divider */}
          <div className='text-3xl font-bold text-white/60'>:</div>

          {/* Home Teams (Right) */}
          <div className='text-center flex-1'>
            <p className='text-4xl font-bold text-[#D99739]'>
              {formatNumber(homeTeams)}
            </p>
            <p className='text-white/80 text-xs uppercase tracking-wider mt-1'>
              {t.cumulative.homeTeams}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
