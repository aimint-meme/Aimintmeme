import { useWallet,useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Connection } from '@solana/web3.js';
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
const endpoint = process.env.NEXT_PUBLIC_APP_SOLANA_COM;
// 自定义 Hook
export function useSolBalance() {
  const { connection } = useConnection();
  const setState = useLocalGlobalStore((state) => state.setState);

  // 查询钱包余额并更新状态
  const fetchSolBalance = async (address) => {
    if (!address) {
      throw new Error("Address is required");
    }
    const solVaultPda = new PublicKey(address);
    const balanceLamports = await connection.getBalance(solVaultPda);
    const balanceSol = balanceLamports / 1e9; // 将 lamports 转换为 SOL
    console.log("balanceSol",balanceSol);
    setState((prevState) => ({
      ...prevState,
      wallet: {
        ...prevState.wallet,
        sol: balanceSol,
      },
    }));
  };
  const getTop20Holder = async (mintAddr:string) => {
    const connection = new Connection(endpoint)
    try {
      const res = await connection.getTokenLargestAccounts(new PublicKey(mintAddr))
      console.log("res.value",res.value)
      return res.value;
    } catch (error) {
        console.log("err:", error)
    }
}

  return { fetchSolBalance,getTop20Holder };
}