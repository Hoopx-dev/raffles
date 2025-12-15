'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useUIStore } from '@/lib/store/useUIStore';
import { useWalletStore } from '@/lib/store/useWalletStore';
import { useTranslation } from '@/i18n/useTranslation';
import { useRedeemTickets } from '@/lib/hooks/useTickets';
import { burnHoopxTokens } from '@/lib/solana/burnTokens';
import { Modal } from './ui/modal';
import { Button } from './ui/button';
import { formatNumber, truncateAddress } from '@/lib/utils';

const DEFAULT_TICKET_PRICE = 10000;
const DEFAULT_BURN_ADDRESS = '1nc1nerator11111111111111111111111111111111';

interface ConfirmModalProps {
  onSuccess?: () => void;
  eventId?: number;
  burnAddress?: string;
  ticketPrice?: number;
}

export function ConfirmModal({
  onSuccess,
  eventId = 1,
  burnAddress = DEFAULT_BURN_ADDRESS,
  ticketPrice = DEFAULT_TICKET_PRICE,
}: ConfirmModalProps) {
  const { isConfirmModalOpen, closeConfirmModal, pendingRedeemAmount } = useUIStore();
  const { address } = useWalletStore();
  const hoopxBalance = useWalletStore((s) => s.hoopxBalance);
  const setHoopxBalance = useWalletStore((s) => s.setHoopxBalance);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'confirm' | 'burning' | 'redeeming'>('confirm');
  const { t } = useTranslation();

  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const { mutate: redeemTickets, isPending: isRedeeming } = useRedeemTickets();

  const totalCost = pendingRedeemAmount * ticketPrice;
  const isProcessing = step === 'burning' || step === 'redeeming';

  const handleConfirm = async () => {
    if (!address || !publicKey || !signTransaction) {
      setError('Wallet not connected');
      return;
    }

    // Check wallet balance before burning
    if (hoopxBalance < totalCost) {
      setError('Insufficient wallet balance');
      return;
    }

    setError(null);
    setStep('burning');

    try {
      // Step 1: Burn HOOPX tokens on-chain
      const burnResult = await burnHoopxTokens({
        connection,
        walletPublicKey: publicKey,
        amount: totalCost,
        signTransaction,
        burnAddress,
      });

      if (!burnResult.success) {
        // Handle user cancellation silently
        if (burnResult.error === 'Transaction cancelled') {
          setStep('confirm');
          return;
        }
        // Show error for other failures
        setError(burnResult.error || 'Failed to burn tokens');
        setStep('confirm');
        return;
      }

      console.log('Burn transaction:', burnResult.txHash);
      setStep('redeeming');

      // Step 2: Call API to redeem tickets with the real txHash
      redeemTickets(
        {
          eventId,
          txHash: burnResult.txHash,
          userWallet: address,
          amountToken: totalCost,
          ticketQuantity: pendingRedeemAmount,
        },
        {
          onSuccess: (ticketsCreated) => {
            console.log('Redeemed tickets:', ticketsCreated);
            // Update local balance
            setHoopxBalance(hoopxBalance - totalCost);
            setStep('confirm');
            closeConfirmModal();
            if (onSuccess) {
              onSuccess();
            }
          },
          onError: (err) => {
            console.error('Failed to redeem tickets:', err);
            setError('Token burn succeeded but ticket creation failed. Contact support.');
            setStep('confirm');
          },
        }
      );
    } catch (err) {
      console.error('Transaction failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';

      // Don't show error for user cancellation - just reset state
      if (errorMessage === 'Transaction cancelled') {
        setError(null);
      } else {
        setError(errorMessage);
      }
      setStep('confirm');
    }
  };

  const getButtonText = () => {
    if (step === 'burning') return 'Burning tokens...';
    if (step === 'redeeming') return 'Creating tickets...';
    return t.modals.confirm.confirm;
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
          <img
            src="/images/token-badge.png"
            alt="HOOPX"
            className="w-20 h-20"
          />
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
            <span className="text-text-dark font-mono text-xs">{truncateAddress(burnAddress, 6)}</span>
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Confirm Button */}
        <Button
          variant="gold"
          fullWidth
          size="lg"
          onClick={handleConfirm}
          isLoading={isProcessing}
          disabled={isProcessing}
        >
          {getButtonText()}
        </Button>
      </div>
    </Modal>
  );
}
