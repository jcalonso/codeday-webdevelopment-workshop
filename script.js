const WEATHER_CACHE_KEY = 'weather_data_cache'
const BITCOIN_PRICE_CACHE_KEY = 'bitcoin_price_cache'

async function get_current_weather() {
  let cacheData = cache_get(WEATHER_CACHE_KEY)
  if (cacheData) {
    return cacheData;
  }

  const url = "https://api.open-meteo.com/v1/forecast?latitude=5.4141&longitude=100.3288&current_weather=true&timezone=Asia%2FSingapore"
  let response = await fetch(url);
  if (response.status === 200) {
    let payload = await response.json();
    let temp = payload.current_weather.temperature;
    cache_set(WEATHER_CACHE_KEY, temp);
    return temp;
  } else {
    console.error('Got error fetching weather data')
  }
}

async function get_bitcoin_price() {
  let cacheData = cache_get(BITCOIN_PRICE_CACHE_KEY)
  if (cacheData) {
    return cacheData;
  }

  const url = "https://data.messari.io/api/v1/assets/btc/metrics"
  let response = await fetch(url);
  if (response.status === 200) {
    let payload = await response.json();
    price = payload.data.market_data.price_usd;
    cache_set(BITCOIN_PRICE_CACHE_KEY, price);
    return price;
  } else {
    console.error('Got error fetching Bitcon price')
  }

}

async function load_bitcoin_component() {
  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  let price = await get_bitcoin_price()
  let fmtPrice = formatter.format(price);
  let template = `<a href="https://coinmarketcap.com/currencies/bitcoin/" target="_blank"><i class="fa fa-btc" aria-hidden="true"></i> ${fmtPrice}</a>`
  document.getElementById('bitcoin-component').innerHTML = template;
}

async function load_weather_component() {
  let temp = await get_current_weather();
  let template = `<a href="https://openweathermap.org/city/1735106" target="_blank"><i class="fa fa-sun-o" aria-hidden="true"></i> ${temp}° C</a>`
  document.getElementById('weather-component').innerHTML = template;
}

function cache_set(key, val) {
  console.log(`Caching key: ${key}`);
  localStorage.setItem(key, JSON.stringify({
    value: val,
    ttl: 300,
    timestamp: Math.floor(new Date().getTime() / 1000)
  }))
}

function cache_get(key) {

  console.log(`Checking cache for ${key}`)
  let cache = localStorage.getItem(key)

  if (cache) {

    // Check that cache is still valid
    let data = JSON.parse(cache);
    let date = data.timestamp;
    let ttl = data.ttl;

    let dateWithTtl = date + ttl;
    let currDate = Math.floor(new Date().getTime() / 1000)

    if (dateWithTtl > currDate) {
      // Cache is still valid 
      console.log(`Cache for ${key} is still valid`);
      return data.value;
    }

    // Cache has expired
    console.log(`Cache for ${key} has expired`);
    return false;
  }

  return false;
}

load_bitcoin_component();
load_weather_component();