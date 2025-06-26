#!/usr/bin/env /opt/homebrew/bin/deno run --allow-net --allow-env --allow-read
import { config } from "https://deno.land/x/dotenv/mod.ts";

config({ export: true });

const API_URL = "https://www.gaitameonline.com/rateaj/getrate";
const DEFAULT_MULTIPLIER = 1000;

const getEnvFloat = (key) => {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`環境変数 ${key} が設定されていません`);
  const parsed = parseFloat(value);
  if (isNaN(parsed)) throw new Error(`環境変数 ${key} は有効な数値ではありません`);
  return parsed;
};

const hold = getEnvFloat("HOLD");
const pair = Deno.env.get("PAIR") || "USDJPY";

const settings = {
  say: null,
  type: "ask",
  thresholds: {
    USDJPY: [
      { check: "high", value: hold + 0.6 },
      { check: "low", value: hold - 0.6 },
    ],
  },
  multipliers: {
    GBPUSD: 100000,
    GBPJPY: 1000,
    USDJPY: 1000,
  },
  symbols: {
    GBPUSD: "£/$",
    USDJPY: "$/¥",
  },
};

const positions = [
  { pair, hold, monitoring: true, priority: 1 }
];

const alert = (message) => {
  if (message) console.log(`say ${message}`);
};

const colorize = (text, color = "red") => `${text} | color=${color}`;

const calcPips = (pair, price, hold) => {
  if (!hold) return null;
  const multiplier = settings.multipliers[pair] || DEFAULT_MULTIPLIER;
  return Math.round((price - hold) * multiplier);
};

const formatPipsProfit = (pips, profit) => {
  if (pips && profit) return ` [${pips} : ${profit}]`;
  if (pips) return ` [${pips}]`;
  return "";
};

const checkThreshold = (pair, price, pips) => {
  const thresholds = settings.thresholds[pair];
  if (!thresholds) return false;
  
  return thresholds.some(({ check, value }) => {
    switch (check) {
      case "high": return price >= value;
      case "low": return price <= value;
      case "abs": return pips && Math.abs(pips) > value;
      default: return false;
    }
  });
};

const formatPosition = ({ pair, bid, ask, hold, quantity, slip }) => {
  const price = settings.type === "bid" ? bid : ask;
  const pips = calcPips(pair, price, hold);
  const adjustedPips = pips !== null ? pips + (slip || 0) : null;
  const profit = adjustedPips && quantity ? adjustedPips * quantity : "";
  
  const symbol = settings.symbols[pair] || pair;
  const text = formatPipsProfit(adjustedPips, profit);
  const output = `${symbol} ${price}${text}`;
  
  if (checkThreshold(pair, price, adjustedPips)) {
    alert(settings.say);
    return colorize(output, "red");
  }
  
  return output;
};

const fetchQuotes = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`);
    }
    const data = await response.json();
    
    return data.quotes.reduce((acc, quote) => {
      acc[quote.currencyPairCode] = quote;
      return acc;
    }, {});
  } catch (error) {
    console.error("レート取得エラー:", error.message);
    throw error;
  }
};

const main = async () => {
  try {
    const quotes = await fetchQuotes();
    
    const activePositions = positions
      .filter(p => p.monitoring)
      .map(p => ({ ...p, ...quotes[p.pair] }))
      .filter(p => p.bid && p.ask)
      .sort((a, b) => a.priority - b.priority);
    
    activePositions.forEach((position, index) => {
      console.log(formatPosition(position));
      if (index === 0) console.log("---");
    });
  } catch (error) {
    console.error("エラー:", error.message);
    Deno.exit(1);
  }
};

await main();