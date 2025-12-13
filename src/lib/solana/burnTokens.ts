import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

// HOOPX token mint address (replace with actual mint address)
const HOOPX_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_HOOPX_MINT || '11111111111111111111111111111111'
);

// Default burn address - can be overridden
const DEFAULT_BURN_ADDRESS = '1nc1nerator11111111111111111111111111111111';

export interface BurnTokensParams {
  connection: Connection;
  walletPublicKey: PublicKey;
  amount: number; // Amount in HOOPX (will be converted to lamports based on decimals)
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  burnAddress?: string; // Optional burn address from API
}

export interface BurnTokensResult {
  success: boolean;
  txHash: string;
  error?: string;
}

/**
 * Burns HOOPX tokens by transferring them to the burn address
 */
export async function burnHoopxTokens({
  connection,
  walletPublicKey,
  amount,
  signTransaction,
  burnAddress = DEFAULT_BURN_ADDRESS,
}: BurnTokensParams): Promise<BurnTokensResult> {
  try {
    const burnPublicKey = new PublicKey(burnAddress);

    // Get the token accounts
    const senderTokenAccount = await getAssociatedTokenAddress(
      HOOPX_MINT,
      walletPublicKey
    );

    const burnTokenAccount = await getAssociatedTokenAddress(
      HOOPX_MINT,
      burnPublicKey
    );

    // HOOPX has 6 decimals (adjust if different)
    const HOOPX_DECIMALS = 6;
    const amountInSmallestUnit = BigInt(amount * Math.pow(10, HOOPX_DECIMALS));

    // Create transfer instruction
    const transferInstruction = createTransferInstruction(
      senderTokenAccount,
      burnTokenAccount,
      walletPublicKey,
      amountInSmallestUnit,
      [],
      TOKEN_PROGRAM_ID
    );

    // Create transaction
    const transaction = new Transaction().add(transferInstruction);

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletPublicKey;

    // Sign transaction
    const signedTransaction = await signTransaction(transaction);

    // Send transaction
    const txHash = await connection.sendRawTransaction(signedTransaction.serialize());

    // Confirm transaction
    await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature: txHash,
    });

    return {
      success: true,
      txHash,
    };
  } catch (error) {
    console.error('Failed to burn tokens:', error);

    // Handle user rejection
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isUserRejection =
      errorMessage.includes('User rejected') ||
      errorMessage.includes('user rejected') ||
      errorMessage.includes('Transaction cancelled');

    return {
      success: false,
      txHash: '',
      error: isUserRejection ? 'Transaction cancelled' : errorMessage,
    };
  }
}

/**
 * Get RPC connection
 */
export function getConnection(): Connection {
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta');
  return new Connection(rpcUrl, 'confirmed');
}
