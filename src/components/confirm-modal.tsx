'use client';

import { useState } from 'react';
import { useUIStore } from '@/lib/store/useUIStore';
import { useTicketStore } from '@/lib/store/useTicketStore';
import { useWalletStore } from '@/lib/store/useWalletStore';
import { useTranslation } from '@/i18n/useTranslation';
import { Modal } from './ui/modal';
import { Button } from './ui/button';
import { formatNumber, generateTicketId, truncateAddress } from '@/lib/utils';

const TICKET_PRICE = 10000;
const BURN_ADDRESS = '1nc1nerator11111111111111111111111111111111';

interface ConfirmModalProps {
  onSuccess?: () => void;
}

export function ConfirmModal({ onSuccess }: ConfirmModalProps) {
  const { isConfirmModalOpen, closeConfirmModal, pendingRedeemAmount } = useUIStore();
  const addTickets = useTicketStore((s) => s.addTickets);
  const setHoopxBalance = useWalletStore((s) => s.setHoopxBalance);
  const hoopxBalance = useWalletStore((s) => s.hoopxBalance);
  const [isProcessing, setIsProcessing] = useState(false);
  const { t } = useTranslation();

  const totalCost = pendingRedeemAmount * TICKET_PRICE;

  const handleConfirm = async () => {
    setIsProcessing(true);

    // Simulate transaction processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create new tickets
    const newTickets = Array.from({ length: pendingRedeemAmount }, () => ({
      id: generateTicketId(),
      status: 'unbet' as const,
    }));

    addTickets(newTickets);

    // Update balance (simulate burn)
    setHoopxBalance(hoopxBalance - totalCost);

    setIsProcessing(false);
    closeConfirmModal();

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Modal
      isOpen={isConfirmModalOpen}
      onClose={closeConfirmModal}
      title={t.modals.confirm.title}
    >
      <div className="space-y-6 pt-2">
        {/* HoopX Logo/Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
            <span className="text-white text-2xl font-bold">HX</span>
          </div>
        </div>

        {/* Amount */}
        <div className="text-center">
          <p className="text-3xl font-bold text-text-dark">{formatNumber(totalCost)}</p>
          <p className="text-text-muted">HOOPX</p>
        </div>

        {/* Transaction Details */}
        <div className="space-y-3 bg-bg-input rounded-xl p-4">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">{t.modals.confirm.transferTo}</span>
            <span className="text-text-dark font-mono text-xs">{truncateAddress(BURN_ADDRESS, 6)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">{t.modals.confirm.youllReceive}</span>
            <span className="text-text-dark font-medium">{pendingRedeemAmount} Ticket{pendingRedeemAmount > 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">{t.modals.confirm.networkFee}</span>
            <span className="text-text-dark font-medium">~0.000005 SOL</span>
          </div>
        </div>

        {/* Confirm Button */}
        <Button
          variant="gold"
          fullWidth
          size="lg"
          onClick={handleConfirm}
          isLoading={isProcessing}
        >
          {t.modals.confirm.confirm}
        </Button>
      </div>
    </Modal>
  );
}
