'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/lib/store/useWalletStore';
import { useUIStore } from '@/lib/store/useUIStore';
import { useTranslation } from '@/i18n/useTranslation';
import { useEligibleBalance, ELIGIBILITY_CUTOFF_DISPLAY } from '@/lib/hooks/useEligibleBalance';
import { Modal } from './ui/modal';
import { Button } from './ui/button';
import { QuantitySelector } from './ui/quantity-selector';
import { formatNumber } from '@/lib/utils';

const DEFAULT_TICKET_PRICE = 10000; // HoopX per ticket

interface RedeemModalProps {
  ticketPrice?: number;
}

export function RedeemModal({ ticketPrice = DEFAULT_TICKET_PRICE }: RedeemModalProps) {
  const { isRedeemModalOpen, closeRedeemModal, openConfirmModal } = useUIStore();
  const hoopxBalance = useWalletStore((s) => s.hoopxBalance);
  const [quantity, setQuantity] = useState(1);
  const { t } = useTranslation();

  // Get swap history from Helius - only fetch when modal is open
  const { availableQuota, isLoading: isLoadingSwaps } = useEligibleBalance(ticketPrice, isRedeemModalOpen);

  // Max tickets based on available quota (min of swapped and wallet balance)
  const maxTickets = Math.max(1, Math.floor(availableQuota / ticketPrice));

  const totalCost = quantity * ticketPrice;

  // Can redeem if available quota covers the cost
  const canRedeem = availableQuota >= totalCost;

  // Reset quantity when modal opens
  useEffect(() => {
    if (isRedeemModalOpen) {
      setQuantity(1);
    }
  }, [isRedeemModalOpen]);

  const handleRedeem = () => {
    openConfirmModal(quantity);
  };

  const getErrorMessage = () => {
    // Don't show error while loading
    if (isLoadingSwaps) return null;

    if (availableQuota === 0) {
      return `No eligible HOOPX. Only newly swapped HOOPX after ${ELIGIBILITY_CUTOFF_DISPLAY} can be redeemed.`;
    }
    if (availableQuota < totalCost) {
      return `Insufficient eligible balance. Available: ${formatNumber(availableQuota)} HOOPX`;
    }
    return null;
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
          max={maxTickets || 1}
          label={quantity > 1 ? 'Tickets' : 'Ticket'}
        />

        {/* Balance Info */}
        <div className="space-y-2 bg-bg-input rounded-xl p-4">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Wallet Balance</span>
            <span className="text-text-dark font-medium">{formatNumber(hoopxBalance)} HOOPX</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Available to Redeem</span>
            <span className={`font-medium ${availableQuota > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {isLoadingSwaps ? '...' : `${formatNumber(availableQuota)} HOOPX`}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Price per ticket</span>
            <span className="text-text-dark font-medium">{formatNumber(ticketPrice)} HOOPX</span>
          </div>
        </div>

        {/* Total Cost or Error Warning */}
        {canRedeem ? (
          <div className="flex justify-between items-center py-3 border-t border-gray-100">
            <span className="text-text-muted">Total</span>
            <span className="text-xl font-bold text-text-dark">{formatNumber(totalCost)} HOOPX</span>
          </div>
        ) : (
          <div className="py-3 border-t border-gray-100">
            <p className="text-red-500 text-sm mb-1">{getErrorMessage()}</p>
            <a
              href="https://jup.ag/tokens/9GhjesUhxmVo9x4UHpdS6NVi4TGzcx8BtGckUqFrjupx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium text-sm hover:underline cursor-pointer"
            >
              Swap HOOPX on Jupiter »
            </a>
          </div>
        )}

        {/* Redeem Button */}
        <Button
          variant="gold"
          fullWidth
          size="lg"
          onClick={handleRedeem}
          disabled={!canRedeem || quantity === 0 || isLoadingSwaps}
        >
          {isLoadingSwaps ? 'Checking...' : `${t.modals.redeem.redeem} - ${formatNumber(totalCost)} HOOPX`}
        </Button>
      </div>
    </Modal>
  );
}
