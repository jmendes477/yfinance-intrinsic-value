import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [stockData, setStockData] = useState(null);
  // const [intrinsicValue, setIntrinsicValue] = useState(null);
  const [intrinsicValues, setIntrinsicValues] = useState({
    peMethod: null,
    dcf: null,
    graham: null,
    nav: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tickers = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"]; // Example tickers

  const apiKey = process.env.REACT_APP_RAPIDAPI_KEY;
  
  const fetchStockData = async (ticker) => {
    setLoading(true);
    setError("");
    setStockData(null);
    // setIntrinsicValue(null);
    setIntrinsicValues({
      peMethod: null,
      dcf: null,
      graham: null,
      nav: null,
    });

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
      // const eps = stock.epsTrailingTwelveMonths;
      const peRatio = stock.trailingPE;

      //to be improved
      const eps = stock.epsTrailingTwelveMonths;
      //make it adjustable 
      const growthRate = 10; // Example growth rate for Graham Formula (adjustable)
      const discountRate = 0.10; // Example discount rate for DCF (10%)
      const futureCashFlows = [10, 12, 14, 16, 18]; // Example projected FCF
      const terminalValueGrowth = 0.02; // Example terminal growth rate

      const totalAssets = 5000000000; // Replace 
      const totalLiabilities = 2000000000; // Replace
      const sharesOutstanding = stock.sharesOutstanding;

      // Calculate intrinsic value assuming a fixed P/E multiplier (e.g., 15)
      // const intrinsicValue = eps * 15;
      
      // P/E Method
      const peMethod = eps * 15; // Assume P/E ratio of 15

      // DCF Calculation
      const terminalValue = (futureCashFlows[futureCashFlows.length - 1] * (1 + terminalValueGrowth)) /(discountRate - terminalValueGrowth);
      const dcfValue = futureCashFlows.reduce((acc, fcf, i) => acc + fcf / Math.pow(1 + discountRate, i + 1), 0) + terminalValue / Math.pow(1 + discountRate, futureCashFlows.length);

      // Benjamin Graham's Formula
      const grahamValue = eps * (8.5 + 2 * growthRate);

      // Net Asset Value (NAV)
      const nav = (totalAssets - totalLiabilities) / sharesOutstanding;
      setStockData({
        price,
        eps,
        peRatio,
        forwardPE: stock.forwardPE,
        marketCap: stock.marketCap,
        dividendYield: stock.dividendYield,
      });
      // setIntrinsicValue(intrinsicValue.toFixed(2));
      setIntrinsicValues({
        peMethod,
        dcf: dcfValue.toFixed(2),
        graham: grahamValue.toFixed(2),
        nav: nav.toFixed(2),
      });
      
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
          
        </div>
      )}
      {stockData && intrinsicValues && (
      <div>
        <h3>Intrinsic Value Calculations</h3>
        <p>P/E Method: ${intrinsicValues.peMethod}</p>
        <p>Discounted Cash Flow (DCF): ${intrinsicValues.dcf}</p>
        <p>Benjamin Graham Formula: ${intrinsicValues.graham}</p>
        <p>Net Asset Value (NAV): ${intrinsicValues.nav}</p>
      </div>
)}
    </div>
  );
};

export default App;