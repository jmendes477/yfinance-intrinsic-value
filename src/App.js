import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [stockData, setStockData] = useState(null);
  const [intrinsicValue, setIntrinsicValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tickers = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"]; // Example tickers

  const apiKey = process.env.REACT_APP_RAPIDAPI_KEY;
  
  const fetchStockData = async (ticker) => {
    setLoading(true);
    setError("");
    setStockData(null);
    setIntrinsicValue(null);

    try {
      const response = await axios.get(
        `https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/quotes?`,
        {
          params: { ticker: ticker},
          headers: {
            "X-RapidAPI-Key": apiKey, // Replace with your key
            "X-RapidAPI-Host": "yahoo-finance15.p.rapidapi.com",
          },
        }
      );

      const data = response.data;
      console.log(data);
      // const earnings = data.earnings?.financialsChart?.yearly[0];
      // const currentPrice = data.price?.regularMarketPrice?.raw;

      const stock = response.data.body[0];
      const price = stock.regularMarketPrice;
      const eps = stock.epsTrailingTwelveMonths;
      const peRatio = stock.trailingPE;

      // Calculate intrinsic value assuming a fixed P/E multiplier (e.g., 15)
      const intrinsicValue = eps * 15;
      setStockData({
        price,
        eps,
        peRatio,
        forwardPE: stock.forwardPE,
        marketCap: stock.marketCap,
        dividendYield: stock.dividendYield,
      });
      setIntrinsicValue(intrinsicValue.toFixed(2));
      
    } catch (err) {
      setError("Error fetching stock data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTickerChange = (e) => {
    const ticker = e.target.value;
    setSelectedTicker(ticker);
    fetchStockData(ticker);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Stock Intrinsic Value Calculator</h1>
      <label htmlFor="ticker">Select a stock:</label>
      <select
        id="ticker"
        value={selectedTicker}
        onChange={handleTickerChange}
        style={{ margin: "10px", padding: "5px" }}
      >
        {tickers.map((ticker) => (
          <option key={ticker} value={ticker}>
            {ticker}
          </option>
        ))}
      </select>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {stockData && (
        <div>
          <p>Current Price: ${stockData.price}</p>
          <p>EPS (TTM): ${stockData.eps}</p>
          <p>Trailing P/E: {stockData.peRatio}</p>
          <p>Forward P/E: {stockData.forwardPE}</p>
          <p>Market Cap: ${Intl.NumberFormat().format(stockData.marketCap)}</p>
          <p>Dividend Yield: {stockData.dividendYield}%</p>
          <p>Intrinsic Value: ${intrinsicValue}</p>
        </div>
      )}
    </div>
  );
};

export default App;