'use client';

import { useEffect, useRef } from 'react';
import { useUIStore } from '@/lib/store/useUIStore';
import { useTranslation } from '@/i18n/useTranslation';
import { Modal } from './ui/modal';
import { Button } from './ui/button';

// Confetti animation
function createConfetti(container: HTMLDivElement) {
  const colors = ['#FFD700', '#FF6B35', '#31D99C', '#FF4B4B', '#512784', '#FCB825'];

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.cssText = `
      position: absolute;
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      background-color: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}%;
      top: -10px;
      opacity: ${Math.random() * 0.7 + 0.3};
      transform: rotate(${Math.random() * 360}deg);
      animation: confetti-fall ${Math.random() * 3 + 2}s linear forwards;
    `;
    container.appendChild(confetti);
  }
}

export function LuckyNumberModal() {
  const { isLuckyNumberModalOpen, closeLuckyNumberModal, luckyNumber } = useUIStore();
  const confettiRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (isLuckyNumberModalOpen && confettiRef.current) {
      createConfetti(confettiRef.current);

      // Clean up confetti after animation
      return () => {
        if (confettiRef.current) {
          confettiRef.current.innerHTML = '';
        }
      };
    }
  }, [isLuckyNumberModalOpen]);

  return (
    <Modal
      isOpen={isLuckyNumberModalOpen}
      onClose={closeLuckyNumberModal}
      showCloseButton={false}
    >
      <style jsx global>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(500px) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>

      {/* Confetti container */}
      <div
        ref={confettiRef}
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 0 }}
      />

      <div className="relative z-10 text-center py-4">
        {/* Trophy/Star Icon */}
        <div className="text-6xl mb-4">🎉</div>

        {/* Congratulations */}
        <h2 className="text-2xl font-bold text-text-dark mb-2">{t.modals.lucky.congrats}</h2>

        {/* Lucky Number */}
        <div className="my-6">
          <p className="text-text-muted text-sm mb-1">{t.modals.lucky.luckyNumber}</p>
          <p className="text-5xl font-bold text-orange">{luckyNumber}</p>
        </div>

        {/* Prize Info */}
        <div className="bg-gradient-to-r from-gold/10 to-orange/10 rounded-xl p-4 mb-6">
          <p className="text-text-dark font-medium">
            {t.modals.lucky.youWon}
          </p>
          <p className="text-2xl font-bold text-gold">{t.modals.lucky.prize}</p>
        </div>

        {/* Close Button */}
        <Button
          variant="primary"
          fullWidth
          onClick={closeLuckyNumberModal}
        >
          OK
        </Button>
      </div>
    </Modal>
  );
}
