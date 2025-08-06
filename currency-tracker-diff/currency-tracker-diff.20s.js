#!/usr/bin/env -S -P/${HOME}/.deno/bin:/usr/local/bin:/opt/homebrew/bin deno run --allow-net --allow-env --allow-read

// スクリプトの実際のディレクトリを取得（シンボリックリンクを解決）
const scriptPath = Deno.realPathSync(new URL(import.meta.url).pathname);
const SCRIPT_DIR = scriptPath.substring(0, scriptPath.lastIndexOf('/'));

const CONFIG_FILE = `${SCRIPT_DIR}/config/config.json`;
const LOCAL_CONFIG_FILE = `${SCRIPT_DIR}/config/config.local.json`;

function isPlainObject(obj) {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj) && obj.constructor === Object;
}

function deepMerge(target, source) {
  // 入力検証
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return target || {};
  }

  if (!target || typeof target !== 'object' || Array.isArray(target)) {
    target = {};
  }

  const result = { ...target };

  for (const key in source) {
    // セキュリティチェック：プロトタイプ汚染対策
    if (
      !Object.prototype.hasOwnProperty.call(source, key) ||
      key === '__proto__' ||
      key === 'constructor' ||
      key === 'prototype'
    ) {
      continue;
    }

    const sourceValue = source[key];
    const targetValue = result[key];

    // undefinedは無視（既存の設定を削除しない）
    if (sourceValue === undefined) {
      continue;
    }

    // プレーンオブジェクトのみ再帰処理
    if (isPlainObject(sourceValue)) {
      result[key] = deepMerge(targetValue, sourceValue);
    } else {
      result[key] = sourceValue;
    }
  }

  return result;
}

async function loadConfig() {
  try {
    // ベース設定を読み込み
    const configText = await Deno.readTextFile(CONFIG_FILE);
    let config = JSON.parse(configText);

    // ローカル設定があれば読み込んでマージ
    try {
      const localConfigText = await Deno.readTextFile(LOCAL_CONFIG_FILE);
      const localConfig = JSON.parse(localConfigText);
      config = deepMerge(config, localConfig);
    } catch {
      // ローカル設定ファイルが存在しない場合は無視
    }

    return config;
  } catch (error) {
    console.error(`設定ファイルの読み込みエラー: ${error.message}`);
    throw error;
  }
}

function buildThresholds(currencyConfig, hold) {
  if (!currencyConfig.thresholds) return null;

  return Object.entries(currencyConfig.thresholds).map(([check, config]) => ({
    check,
    value: hold + (config.offset || 0),
  }));
}

function alert(command) {
  if (command) console.log(`say ${command}`);
}

function colorize(text, color = 'red') {
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
  return '';
}

function checkThreshold(pair, price, pips, thresholds) {
  if (!thresholds) return false;

  return thresholds.some(({ check, value }) => {
    switch (check) {
      case 'high':
        return price >= value;
      case 'low':
        return price <= value;
      case 'abs':
        return pips && Math.abs(pips) > value;
      default:
        return false;
    }
  });
}

function formatPosition({ pair, bid, ask, hold, quantity, slip }, config, thresholds) {
  const price = config.display.type === 'bid' ? bid : ask;
  const pips = calcPips(pair, price, hold, config);
  const adjustedPips = pips !== null ? pips + (slip || 0) : null;
  const profit = adjustedPips && quantity ? adjustedPips * quantity * 10 : '';

  const currencyConfig = config.currencies[pair] || {};
  const symbol = currencyConfig.symbol || pair;
  const text = formatPipsProfit(adjustedPips, profit);
  const output = `${symbol} ${price}${text}`;

  if (checkThreshold(pair, price, adjustedPips, thresholds[pair])) {
    alert(config.display.alertCommand);
    return colorize(output, 'red');
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
        console.error('レート取得エラー:', error.message);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

async function main() {
  try {
    const config = await loadConfig();

    // positionsセクションから設定を読み込み
    const positions = [];
    if (config.positions) {
      for (const [pair, posConfig] of Object.entries(config.positions)) {
        if (posConfig.monitoring) {
          positions.push({
            pair,
            hold: posConfig.hold,
            quantity: posConfig.lot || posConfig.quantity,
            slip: posConfig.slip || 0,
            monitoring: true,
            priority: posConfig.priority || positions.length + 1,
          });
        }
      }
    }

    // positionsが空の場合はデフォルト設定を使用
    if (positions.length === 0) {
      console.error('監視対象の通貨ペアが設定されていません');
      Deno.exit(1);
    }

    // 各通貨ペアのしきい値を事前に計算
    const thresholds = {};
    for (const position of positions) {
      const currencyConfig = config.currencies[position.pair];
      if (currencyConfig && currencyConfig.thresholds) {
        thresholds[position.pair] = buildThresholds(currencyConfig, position.hold);
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
      if (index === 0) console.log('---');
    });
  } catch (error) {
    console.error('エラー:', error.message);
    Deno.exit(1);
  }
}

await main();
