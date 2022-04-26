
const decimal_places = 8;
const satoshi_in_btc = 0.00000001;
export function formatBalance(satoshis: number) {
    return (satoshi_in_btc * satoshis).toFixed(decimal_places);
}

export function formatDate(timestamp: number) {
    return (new Date(timestamp*1000)).toLocaleDateString();
}
