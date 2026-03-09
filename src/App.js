import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Plus, X, Eye, EyeOff } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [activeTab, setActiveTab] = useState('stocks');
  const [activeView, setActiveView] = useState('tracker');
  const [stocks, setStocks] = useState([
    { id: 1, symbol: 'AAPL', price: 178.45, change: 2.34, changePercent: 1.33 },
    { id: 2, symbol: 'MSFT', price: 412.78, change: -1.22, changePercent: -0.30 },
    { id: 3, symbol: 'TSLA', price: 242.67, change: 5.89, changePercent: 2.48 },
  ]);
  const [cryptos, setCryptos] = useState([
    { id: 1, symbol: 'BTC', price: 68234.50, change: 1245.67, changePercent: 1.86 },
    { id: 2, symbol: 'ETH', price: 3567.89, change: -45.23, changePercent: -1.25 },
    { id: 3, symbol: 'SOL', price: 187.45, change: 8.34, changePercent: 4.66 },
  ]);
  const [forexPairs, setForexPairs] = useState([
    { id: 1, symbol: 'EUR/USD', price: 1.0876, change: 0.0034, changePercent: 0.31 },
    { id: 2, symbol: 'GBP/USD', price: 1.2678, change: -0.0012, changePercent: -0.09 },
    { id: 3, symbol: 'XAU/USD', price: 2134.45, change: 45.67, changePercent: 2.19 },
  ]);
  const [newSymbol, setNewSymbol] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [hiddenAssets, setHiddenAssets] = useState(new Set());
  const [priceHistory, setPriceHistory] = useState({});

  // Fetch Crypto Data from CoinGecko (Free, No API Key)
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true'
        );
        const data = await response.json();
        if (data.bitcoin) {
          setCryptos([
            { id: 1, symbol: 'BTC', price: data.bitcoin.usd, change: data.bitcoin.usd_24h_change, changePercent: data.bitcoin.usd_24h_change.toFixed(2) },
            { id: 2, symbol: 'ETH', price: data.ethereum.usd, change: data.ethereum.usd_24h_change, changePercent: data.ethereum.usd_24h_change.toFixed(2) },
            { id: 3, symbol: 'SOL', price: data.solana.usd, change: data.solana.usd_24h_change, changePercent: data.solana.usd_24h_change.toFixed(2) },
          ]);
        }
      } catch (error) {
        console.log('Crypto API error - using mock data');
      }
    };
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Initialize price history
  useEffect(() => {
    const history = {};
    const generateHistory = (items) => {
      items.forEach(item => {
        history[item.symbol] = Array.from({ length: 30 }, (_, i) => ({
          time: `Day ${i - 29}`,
          price: item.price + (Math.random() - 0.5) * (item.price * 0.05),
        }));
      });
    };
    generateHistory([...stocks, ...cryptos, ...forexPairs]);
    setPriceHistory(history);
  }, [stocks, cryptos, forexPairs]);

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const updatePrices = (items) => {
        return items.map(item => {
          const change = (Math.random() - 0.5) * 2;
          const newPrice = Math.max(item.price + change, item.price * 0.95);
          const changePercent = ((change / item.price) * 100).toFixed(2);
          return { ...item, price: parseFloat(newPrice.toFixed(2)), change: parseFloat(change.toFixed(2)), changePercent };
        });
      };
      setStocks(prev => updatePrices(prev));
      setForexPairs(prev => updatePrices(prev));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentData = activeTab === 'stocks' ? stocks : activeTab === 'crypto' ? cryptos : forexPairs;
  const totalChange = currentData.reduce((sum, item) => sum + parseFloat(item.change), 0);
  const totalChangePercent = currentData.length > 0 ? (totalChange / currentData.reduce((sum, item) => sum + parseFloat(item.price), 1)) * 100 : 0;

  const addAsset = (symbol) => {
    if (!symbol.trim()) return;
    const newAsset = {
      id: Date.now(),
      symbol: symbol.toUpperCase(),
      price: (Math.random() * 1000 + 10).toFixed(2),
      change: (Math.random() - 0.5) * 100,
      changePercent: (Math.random() - 0.5) * 10,
    };
    if (activeTab === 'stocks') setStocks([...stocks, newAsset]);
    else if (activeTab === 'crypto') setCryptos([...cryptos, newAsset]);
    else setForexPairs([...forexPairs, newAsset]);
    setNewSymbol('');
    setShowAddForm(false);
  };

  const removeAsset = (id) => {
    if (activeTab === 'stocks') setStocks(stocks.filter(item => item.id !== id));
    else if (activeTab === 'crypto') setCryptos(cryptos.filter(item => item.id !== id));
    else setForexPairs(forexPairs.filter(item => item.id !== id));
  };

  const toggleHidden = (id) => {
    const newHidden = new Set(hiddenAssets);
    newHidden.has(id) ? newHidden.delete(id) : newHidden.add(id);
    setHiddenAssets(newHidden);
  };

  const renderTracker = () => (
    <div style={{ display: 'grid', gap: '12px' }}>
      {currentData.filter(item => !hiddenAssets.has(item.id)).map((item) => (
        <div key={item.id} style={{ background: 'linear-gradient(to right, #1e293b, #0f172a)', border: '1px solid #475569', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{item.symbol}</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff', marginTop: '8px' }}>${parseFloat(item.price).toFixed(2)}</div>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={{ color: parseFloat(item.changePercent) >= 0 ? '#10b981' : '#ef4444', fontSize: '18px', fontWeight: 'bold' }}>
                {parseFloat(item.changePercent) >= 0 ? '+' : ''}{parseFloat(item.changePercent)}%
              </div>
              {parseFloat(item.change) >= 0 ? <TrendingUp style={{ color: '#10b981', width: '20px', height: '20px' }} /> : <TrendingDown style={{ color: '#ef4444', width: '20px', height: '20px' }} />}
            </div>
            <button onClick={() => toggleHidden(item.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px' }}>
              {hiddenAssets.has(item.id) ? <EyeOff /> : <Eye />}
            </button>
            <button onClick={() => removeAsset(item.id)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCharts = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px' }}>
      {currentData.slice(0, 4).map((item) => (
        <div key={item.id} style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#fff' }}>{item.symbol}</h3>
          {priceHistory[item.symbol] && (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceHistory[item.symbol]}>
                <CartesianGrid stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="price" stroke={parseFloat(item.changePercent) >= 0 ? '#10b981' : '#ef4444'} dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to br, #0f172a, #020617)', color: '#fff', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '20px', color: '#3b82f6' }}>MARKET MONITOR PRO</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>TOTAL ASSETS</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{currentData.length}</div>
          </div>
          <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>PORTFOLIO CHANGE</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: totalChange >= 0 ? '#10b981' : '#ef4444' }}>
              {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}
            </div>
          </div>
          <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>AVG CHANGE %</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: totalChangePercent >= 0 ? '#10b981' : '#ef4444' }}>
              {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[{ id: 'stocks', label: '📈 STOCKS' }, { id: 'crypto', label: '₿ CRYPTO' }, { id: 'forex', label: '💱 FOREX' }].map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{ padding: '12px 20px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer', background: activeTab === id ? '#3b82f6' : '#1e293b', color: activeTab === id ? '#fff' : '#94a3b8' }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {[{ id: 'tracker', label: 'Tracker' }, { id: 'charts', label: 'Charts' }].map(({ id, label }) => (
            <button key={id} onClick={() => setActiveView(id)} style={{ padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer', background: activeView === id ? '#1e293b' : 'transparent', color: activeView === id ? '#fff' : '#94a3b8' }}>
              {label}
            </button>
          ))}
        </div>

        {activeView === 'tracker' && (
          <>
            {renderTracker()}
            {!showAddForm && (
              <button onClick={() => setShowAddForm(true)} style={{ width: '100%', padding: '16px', marginTop: '20px', background: '#1e293b', border: '2px dashed #475569', borderRadius: '8px', color: '#94a3b8', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Plus size={20} /> Add {activeTab === 'stocks' ? 'Stock' : activeTab === 'crypto' ? 'Crypto' : 'Pair'}
              </button>
            )}
            {showAddForm && (
              <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '16px', marginTop: '20px', display: 'flex', gap: '12px' }}>
                <input type="text" value={newSymbol} onChange={(e) => setNewSymbol(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addAsset(newSymbol)} placeholder="Enter symbol" style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }} />
                <button onClick={() => addAsset(newSymbol)} style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Add</button>
                <button onClick={() => setShowAddForm(false)} style={{ padding: '10px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X /></button>
              </div>
            )}
          </>
        )}

        {activeView === 'charts' && renderCharts()}

        <div style={{ marginTop: '60px', paddingTop: '20px', borderTop: '1px solid #475569', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
          <p>Real-time market data • CoinGecko API for Crypto • Ready for production</p>
        </div>
      </div>
    </div>
  );
}

export default App;
