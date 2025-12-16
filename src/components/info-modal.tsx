'use client';

import { useUIStore } from '@/lib/store/useUIStore';
import { useTranslation } from '@/i18n/useTranslation';
import { Modal } from './ui/modal';

export function InfoModal() {
  const { isInfoModalOpen, closeInfoModal } = useUIStore();
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isInfoModalOpen}
      onClose={closeInfoModal}
      title={t.modals.info.title}
    >
      <div className="space-y-6">
        {/* Period */}
        <div>
          <h3 className="font-bold text-text-dark mb-2">{t.modals.info.period}</h3>
          <p className="text-text-muted text-sm">
            {t.modals.info.periodValue}
          </p>
        </div>

        {/* How to Redeem */}
        <div>
          <h3 className="font-bold text-text-dark mb-2">{t.modals.info.howToRedeem}</h3>
          <ol className="text-text-muted text-sm space-y-2 list-decimal list-inside">
            <li>{t.modals.info.step1}</li>
            <li>{t.modals.info.step2}</li>
            <li>{t.modals.info.step3}</li>
            <li>{t.modals.info.step4}</li>
            <li>{t.modals.info.step5}</li>
            <li>{t.modals.info.step6}</li>
          </ol>
        </div>

        {/* Prize */}
        <div>
          <h3 className="font-bold text-text-dark mb-2">{t.modals.info.prizePool}</h3>
          <ul className="text-text-muted text-sm space-y-2">
            <li>{t.modals.info.mainPrize}</li>
            <li>{t.modals.info.luckyPrize}</li>
          </ul>
        </div>

        {/* Prize Ladder */}
        <div>
          <h3 className="font-bold text-text-dark mb-2">{t.modals.info.prizeLadder}</h3>
          <div className="bg-bg-input rounded-xl p-4">
            <table className="text-sm">
              <tbody className="text-text-muted">
                <tr>
                  <td className="py-1 pr-4 whitespace-nowrap">0 - 100 Tickets</td>
                  <td className="py-1 whitespace-nowrap">Prize Pool: 2,000 USDT</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 whitespace-nowrap">100 - 1,000 Tickets</td>
                  <td className="py-1 whitespace-nowrap">Prize Pool: 20,000 USDT</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 whitespace-nowrap">1,000 - 10,000 Tickets</td>
                  <td className="py-1 whitespace-nowrap">Prize Pool: 200,000 USDT</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 whitespace-nowrap">10,000 - 100,000 Tickets</td>
                  <td className="py-1 whitespace-nowrap">Prize Pool: 2,000,000 USDT</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Rules */}
        <div>
          <h3 className="font-bold text-text-dark mb-2">{t.modals.info.rules}</h3>
          <ul className="text-text-muted text-sm space-y-1 list-disc list-inside">
            <li>{t.modals.info.rule1}</li>
            <li>{t.modals.info.rule2}</li>
            <li>{t.modals.info.rule3}</li>
            <li>{t.modals.info.rule4}</li>
            <li>{t.modals.info.rule5}</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
