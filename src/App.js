import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; // Import the CSS file

const App = () => {
  const [selectedTicker, setSelectedTicker] = useState("");
  const [stockData, setStockData] = useState(null);
  const [intrinsicValues, setIntrinsicValues] = useState({
    peMethod: null,
    dcf: null,
    graham: null,
    nav: null,
  });
  const [parameters, setParameters] = useState({
    growthRate: 10,
    discountRate: 10,
    terminalGrowthRate: 2,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tickers = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"];
  const apiKey = process.env.REACT_APP_RAPIDAPI_KEY;

  // Fetch stock data
  const fetchStockData = async (ticker) => {
    setLoading(true);
    setError("");
    setStockData(null);
    setIntrinsicValues({
      peMethod: null,
      dcf: null,
      graham: null,
      nav: null,
    });

    try {
      const response = await axios.get(
        `https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/quotes`,
        {
          params: { ticker },
          headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": "yahoo-finance15.p.rapidapi.com",
          },
        }
      );

      const stock = response.data.body[0];
      const { epsTrailingTwelveMonths: eps, trailingPE, sharesOutstanding } = stock;
      const price = stock.regularMarketPrice;

      setStockData({
        eps,
        price,
        trailingPE,
        sharesOutstanding,
      });
    } catch (err) {
      setError("Failed to fetch stock data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateIntrinsicValues = () => {
    if (!stockData) return;

    const { eps, sharesOutstanding } = stockData;
    const { growthRate, discountRate, terminalGrowthRate } = parameters;

    const futureCashFlows = [10, 12, 14, 16, 18];
    const terminalValue = (futureCashFlows[futureCashFlows.length - 1] * (1 + terminalGrowthRate / 100)) /
      (discountRate / 100 - terminalGrowthRate / 100);
    const dcfValue = futureCashFlows.reduce(
      (acc, fcf, i) => acc + fcf / Math.pow(1 + discountRate / 100, i + 1),
      0
    ) + terminalValue / Math.pow(1 + discountRate / 100, futureCashFlows.length);

    const grahamValue = eps * (8.5 + 2 * growthRate);
    const nav = (5000000000 - 2000000000) / sharesOutstanding;
    const peMethod = eps * 15;

    setIntrinsicValues({
      peMethod: peMethod.toFixed(2),
      dcf: dcfValue.toFixed(2),
      graham: grahamValue.toFixed(2),
      nav: nav.toFixed(2),
    });
  };

  useEffect(() => {
    calculateIntrinsicValues();
  }, [parameters, stockData]);

  const handleParameterChange = (e) => {
    const { name, value } = e.target;
    setParameters((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleTickerChange = (e) => {
    setSelectedTicker(e.target.value);
  };

  const handleFetchData = () => {
    if (selectedTicker.trim() !== "") {
      fetchStockData(selectedTicker.trim().toUpperCase());
    }
  };

  return (
    <div className="container">
      <h1 className="header">Stock Intrinsic Value Calculator</h1>
      <label>
        Select or enter a stock ticker:
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "10px" }}>
          <select
            value={selectedTicker}
            onChange={handleTickerChange}
            className="select"
          >
            <option value="" disabled>
              Select a stock
            </option>
            {tickers.map((ticker) => (
              <option key={ticker} value={ticker}>
                {ticker}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Or type ticker here"
            value={selectedTicker}
            onChange={(e) => setSelectedTicker(e.target.value)}
            className="input"
          />
          <button onClick={handleFetchData} className="button">
            Fetch Data
          </button>
        </div>
      </label>

      <div className="parameters">
        <div className="input-group">
          <label>Growth Rate (%):</label>
          <input
            type="number"
            name="growthRate"
            value={parameters.growthRate}
            onChange={handleParameterChange}
            className="input"
          />
        </div>
        <div className="input-group">
          <label>Discount Rate (%):</label>
          <input
            type="number"
            name="discountRate"
            value={parameters.discountRate}
            onChange={handleParameterChange}
            className="input"
          />
        </div>
        <div className="input-group">
          <label>Terminal Growth Rate (%):</label>
          <input
            type="number"
            name="terminalGrowthRate"
            value={parameters.terminalGrowthRate}
            onChange={handleParameterChange}
            className="input"
          />
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {stockData && (
        <div className="data-section">
          <h3>Stock Details</h3>
          <p>Price: ${stockData.price}</p>
          <p>EPS: ${stockData.eps}</p>
          <p>Trailing P/E: {stockData.trailingPE}</p>
        </div>
      )}

      {intrinsicValues && (
        <div className="intrinsic-values">
          <h3>Intrinsic Value Calculations</h3>
          <p>P/E Method: ${intrinsicValues.peMethod}</p>
          <p>DCF: ${intrinsicValues.dcf}</p>
          <p>Benjamin Graham Formula: ${intrinsicValues.graham}</p>
          <p>NAV: ${intrinsicValues.nav}</p>
        </div>
      )}
    </div>
  );
};

export default App;
