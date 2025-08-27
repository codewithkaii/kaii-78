import { TrendingUp, TrendingDown } from "lucide-react";

const CryptoChart = () => {
  // Mock Bitcoin price data for demonstration
  const bitcoinPrice = 67843.21;
  const priceChange = +2.34;
  const priceChangePercent = +3.57;

  return (
    <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Bitcoin Price</h2>
        <div className="text-right">
          <div className="text-2xl font-bold">${bitcoinPrice.toLocaleString()}</div>
          <div className={`flex items-center gap-1 text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            ${Math.abs(priceChange)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent}%)
          </div>
        </div>
      </div>
      <div className="h-[400px] w-full flex items-center justify-center bg-muted/20 rounded-lg">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Trading Chart</p>
          <p className="text-sm text-muted-foreground">Chart integration will be available with API keys configured</p>
        </div>
      </div>
    </div>
  );
};

export default CryptoChart;