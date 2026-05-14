export function formatNaira(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

export function shortWallet(wallet) {
  if (!wallet) return "-";
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}
