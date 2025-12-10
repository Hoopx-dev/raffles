'use client';

import { useState } from 'react';
import { useWalletStore } from '@/lib/store/useWalletStore';
import { useUIStore } from '@/lib/store/useUIStore';
import { useTicketStore } from '@/lib/store/useTicketStore';
import { useTranslation } from '@/i18n/useTranslation';
import { Modal } from './ui/modal';
import { Button } from './ui/button';
import { QuantitySelector } from './ui/quantity-selector';
import { formatNumber } from '@/lib/utils';

const TICKET_PRICE = 10000; // HoopX per ticket

export function RedeemModal() {
  const { isRedeemModalOpen, closeRedeemModal, openConfirmModal } = useUIStore();
  const hoopxBalance = useWalletStore((s) => s.hoopxBalance);
  const availableRedeem = useTicketStore((s) => s.availableRedeem);
  const [quantity, setQuantity] = useState(1);
  const { t } = useTranslation();

  const maxTickets = Math.min(
    availableRedeem > 0 ? availableRedeem : 10, // Default to 10 if no backend data
    Math.floor(hoopxBalance / TICKET_PRICE)
  );
  const totalCost = quantity * TICKET_PRICE;
  const hasEnoughBalance = hoopxBalance >= totalCost;

  const handleRedeem = () => {
    openConfirmModal(quantity);
  };

  return (
    <Modal
      isOpen={isRedeemModalOpen}
      onClose={closeRedeemModal}
      title={t.modals.redeem.title}
    >
      <div className="space-y-6 pt-2">
        {/* Quantity Selector */}
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={maxTickets || 10}
          label={t.modals.redeem.quantity}
        />

        {/* Balance Info */}
        <div className="space-y-2 bg-bg-input rounded-xl p-4">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">{t.modals.redeem.availableBalance}</span>
            <span className="text-text-dark font-medium">{formatNumber(hoopxBalance)} HOOPX</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">{t.modals.redeem.availableRedeem}</span>
            <span className="text-text-dark font-medium">{availableRedeem > 0 ? availableRedeem : '∞'} Tickets</span>
          </div>
        </div>

        {/* Total Cost */}
        <div className="flex justify-between items-center py-3 border-t border-gray-100">
          <span className="text-text-muted">{t.modals.redeem.ticketPrice}</span>
          <span className="text-xl font-bold text-text-dark">{formatNumber(totalCost)} HOOPX</span>
        </div>

        {/* Redeem Button */}
        <Button
          variant="gold"
          fullWidth
          size="lg"
          onClick={handleRedeem}
          disabled={!hasEnoughBalance || quantity === 0}
        >
          {t.modals.redeem.redeem} - {formatNumber(totalCost)} HOOPX
        </Button>
      </div>
    </Modal>
  );
}
