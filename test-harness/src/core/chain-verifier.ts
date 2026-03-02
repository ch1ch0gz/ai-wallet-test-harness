import { Connection, PublicKey } from "@solana/web3.js";
import { ethers } from "ethers";

export class ChainVerifier {
  private solana: Connection;
  private eth?: ethers.JsonRpcProvider;

  constructor() {
    this.solana = new Connection(
      process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
      "confirmed"
    );
    if (process.env.ETH_RPC_URL) {
      this.eth = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
    }
  }

  async verifySolanaTransaction(signature: string): Promise<boolean> {
    try {
      const tx = await this.solana.getTransaction(signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });
      return tx !== null && !tx.meta?.err;
    } catch {
      return false;
    }
  }

  async getSolanaBalance(address: string): Promise<number> {
    const pubkey = new PublicKey(address);
    const lamports = await this.solana.getBalance(pubkey);
    return lamports / 1e9; // lamports → SOL
  }

  async verifyEthereumTransaction(txHash: string): Promise<boolean> {
    if (!this.eth) return false;
    try {
      const receipt = await this.eth.getTransactionReceipt(txHash);
      return receipt?.status === 1;
    } catch {
      return false;
    }
  }

  isValidSolanaAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  isValidEthereumAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /** Extract the first Solana transaction signature from a text blob */
  static extractSolanaSignature(text: string): string | undefined {
    // Solana signatures are base-58, 87–88 chars
    const match = text.match(/[1-9A-HJ-NP-Za-km-z]{87,88}/);
    return match?.[0];
  }

  /** Extract the first Ethereum tx hash from a text blob */
  static extractEthTxHash(text: string): string | undefined {
    const match = text.match(/0x[0-9a-fA-F]{64}/);
    return match?.[0];
  }
}
