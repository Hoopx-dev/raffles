'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useQueryClient } from '@tanstack/react-query';
import { useWalletStore } from '@/lib/store/useWalletStore';
import { useUIStore } from '@/lib/store/useUIStore';
import { useTranslation } from '@/i18n/useTranslation';
import { useEligibleBalance } from '@/lib/hooks/useEligibleBalance';
import { getHoopxBalance } from '@/lib/solana/burnTokens';
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
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();
  const hoopxBalance = useWalletStore((s) => s.hoopxBalance);
  const setHoopxBalance = useWalletStore((s) => s.setHoopxBalance);
  const [quantity, setQuantity] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t } = useTranslation();

  // Get swap history from Helius - only fetch when modal is open
  const { availableQuota, isLoading: isLoadingSwaps } = useEligibleBalance(ticketPrice, isRedeemModalOpen);

  // Max tickets based on available quota (min of swapped and wallet balance)
  const maxTickets = Math.max(1, Math.floor(availableQuota / ticketPrice));

  const totalCost = quantity * ticketPrice;

  // Can redeem if available quota covers the cost
  const canRedeem = availableQuota >= totalCost;

  // Refetch balances when modal opens
  useEffect(() => {
    if (isRedeemModalOpen && publicKey) {
      setQuantity(1);
      setIsRefreshing(true);

      // Refetch wallet HOOPX balance
      getHoopxBalance(connection, publicKey)
        .then((balance) => {
          console.log('Refreshed HOOPX balance:', balance);
          setHoopxBalance(balance);
        })
        .catch((error) => {
          console.error('Failed to refresh HOOPX balance:', error);
        });

      // Invalidate tickets query
      queryClient.invalidateQueries({ queryKey: ['tickets'] });

      // Clear refreshing state after a short delay
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [isRedeemModalOpen, publicKey, connection, setHoopxBalance, queryClient]);

  const handleRedeem = () => {
    openConfirmModal(quantity);
  };

  const getErrorMessage = () => {
    // Don't show error while loading
    if (isLoadingSwaps) return null;

    if (availableQuota === 0) {
      return 'No HOOPX in wallet. Swap some HOOPX to redeem tickets.';
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
          disabled={!canRedeem || quantity === 0 || isLoadingSwaps || isRefreshing}
        >
          {isLoadingSwaps || isRefreshing ? 'Checking...' : `${t.modals.redeem.redeem} - ${formatNumber(totalCost)} HOOPX`}
        </Button>
      </div>
    </Modal>
  );
}
