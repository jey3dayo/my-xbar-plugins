#!/usr/bin/env /opt/homebrew/bin/deno run --allow-net --allow-env --allow-read
import { config } from "https://deno.land/x/dotenv/mod.ts";

config({ export: true });

const CONFIG_FILE = "./config.json";

async function loadConfig() {
  try {
    const configText = await Deno.readTextFile(CONFIG_FILE);
    return JSON.parse(configText);
  } catch (error) {
    console.error(`設定ファイルの読み込みエラー: ${error.message}`);
    throw error;
  }
}

function getEnvFloat(key) {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`環境変数 ${key} が設定されていません`);
  const parsed = parseFloat(value);
  if (isNaN(parsed)) throw new Error(`環境変数 ${key} は有効な数値ではありません`);
  return parsed;
}

function buildThresholds(currencyConfig, hold) {
  if (!currencyConfig.thresholds) return null;

  return Object.entries(currencyConfig.thresholds).map(([check, config]) => ({
    check,
    value: hold + (config.offset || 0)
  }));
}

function alert(command) {
  if (command) console.log(`say ${command}`);
}

function colorize(text, color = "red") {
  return `${text} | color=${color}`;
}

function calcPips(pair, price, hold, config) {
  if (!hold) return null;
  const currencyConfig = config.currencies[pair] || {};
  const multiplier = currencyConfig.multiplier || config.defaults.multiplier;
  return Math.round((price - hold) * multiplier);
}

function formatPipsProfit(pips, profit) {
  if (pips && profit) return ` [${pips} : ${profit}]`;
  if (pips) return ` [${pips}]`;
  return "";
}

function checkThreshold(pair, price, pips, thresholds) {
  if (!thresholds) return false;

  return thresholds.some(({ check, value }) => {
    switch (check) {
      case "high": return price >= value;
      case "low": return price <= value;
      case "abs": return pips && Math.abs(pips) > value;
      default: return false;
    }
  });
}

function formatPosition({ pair, bid, ask, hold, quantity, slip }, config, thresholds) {
  const price = config.display.type === "bid" ? bid : ask;
  const pips = calcPips(pair, price, hold, config);
  const adjustedPips = pips !== null ? pips + (slip || 0) : null;
  const profit = adjustedPips && quantity ? adjustedPips * quantity : "";

  const currencyConfig = config.currencies[pair] || {};
  const symbol = currencyConfig.symbol || pair;
  const text = formatPipsProfit(adjustedPips, profit);
  const output = `${symbol} ${price}${text}`;

  if (checkThreshold(pair, price, adjustedPips, thresholds[pair])) {
    alert(config.display.alertCommand);
    return colorize(output, "red");
  }

  return output;
}

async function fetchQuotes(config) {
  const maxRetries = config.api.retries || 3;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(config.api.url);
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      const data = await response.json();

      return data.quotes.reduce((acc, quote) => {
        acc[quote.currencyPairCode] = quote;
        return acc;
      }, {});
    } catch (error) {
      if (i === maxRetries - 1) {
        console.error("レート取得エラー:", error.message);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

async function main() {
  try {
    const config = await loadConfig();
    const hold = getEnvFloat("HOLD");
    const pair = Deno.env.get("PAIR") || config.defaults.pair;

    const positions = [
      { pair, hold, monitoring: true, priority: 1 }
    ];

    // 各通貨ペアのしきい値を事前に計算
    const thresholds = {};
    for (const [currencyPair, currencyConfig] of Object.entries(config.currencies)) {
      if (currencyConfig.thresholds) {
        thresholds[currencyPair] = buildThresholds(currencyConfig, hold);
      }
    }

    const quotes = await fetchQuotes(config);

    const activePositions = positions
      .filter(p => p.monitoring)
      .map(p => ({ ...p, ...quotes[p.pair] }))
      .filter(p => p.bid && p.ask)
      .sort((a, b) => a.priority - b.priority);

    activePositions.forEach((position, index) => {
      console.log(formatPosition(position, config, thresholds));
      if (index === 0) console.log("---");
    });
  } catch (error) {
    console.error("エラー:", error.message);
    Deno.exit(1);
  }
}

await main();
