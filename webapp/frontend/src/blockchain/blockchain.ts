import {Wallet, Transaction, BlockchainNode, BlockchainEdge, BlockchainGraph} from './models';

import chunk from 'lodash.chunk'

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJson(url: string) {
    let r = null;
    let backoff = 1000;
    while(!r) {
        try {
            r = await fetch(url);
        } catch(e) {
            if(backoff > 10000) {
                throw e;
            } else {
                await sleep(backoff);
                backoff *= 2;    
            }
        }
    }
    return await r.json();
}

export async function getTransactionGraph(addresses: string[]): Promise<BlockchainGraph> {
    let addresses_set = new Set(addresses);

    let json = await fetchJson(`https://blockchain.info/multiaddr?active=${addresses.join('|')}&n=100`);

    let nodes: {
        [key:string]: BlockchainNode
    } = {};
    let edges: BlockchainEdge[] = [];
    
    let new_addresses: string[] = [];

    for(let address_json of json['addresses']) {
        let wallet: Wallet = {
            address: address_json['address'],
            balance: address_json['final_balance'],
            num_in_txs: 0,
            num_out_txs: 0
        }
        let node: BlockchainNode = {
            details: wallet,
            id: address_json['address']
        }
        nodes[address_json['address']] = node;
    }

    let tx_jsons = json['txs'];
    let offset = 100;
    while(json['txs'].length === 100) {
        json = await fetchJson(`https://blockchain.info/multiaddr?active=${addresses.join('|')}&n=100&offset=${offset}`);
        tx_jsons.push(...json['txs']);
        offset += 100;
    }
    for(let tx_json of tx_jsons) {
        let input_addresses: string[] = [];
        let output_addresses: string[] = [];
        
        let amount_in = 0;
        let amount_out = 0;
        for(let input of tx_json['inputs']) {
            amount_in += input['prev_out']['value'];
            if(input['prev_out']['addr']) {
                input_addresses.push(input['prev_out']['addr']);
            }
        }
        for(let output of tx_json['out']) {
            amount_out += output['value'];
            if(output['addr']) {
                output_addresses.push(output['addr']);
            }
        }
        let fee = amount_in - amount_out;
        let tx: Transaction = {
            hash: tx_json['hash'],
            date: tx_json['time'],
            block_index: tx_json['block_index'],
            amount: amount_out,
            fee: fee,
            inputs: input_addresses,
            outputs: output_addresses
        };
        let tx_index = tx_json['tx_index'];
        
        let out_nodes = output_addresses.map( address =>
            {
                let node = nodes[address];
                if(!node) {
                    node = {
                        details: {
                            address: address,
                            balance: 0,
                            num_in_txs: 0,
                            num_out_txs: 0
                        },
                        id: address
                    }
                    nodes[address] =node;
                    new_addresses.push(address);
                }
                return node;
            }
        );

        let in_nodes = input_addresses
            .filter(address => addresses_set.has(address))
            .map(address => nodes[address]!);
        for(let node of out_nodes) {
            let wallet = node.details;
            wallet.num_in_txs += 1;
            let first_in_tx_index = wallet.first_in_tx_index;
            if(!first_in_tx_index || tx_index < first_in_tx_index) {
                wallet.first_in_tx_index = tx_index;
                wallet.first_in_tx_hash = tx.hash;
                wallet.first_in_tx_date = tx.date;
            }
            let last_in_tx_index = wallet.last_in_tx_index;
            if(!last_in_tx_index || tx_index > last_in_tx_index) {
                wallet.last_in_tx_index = tx_index;
                wallet.last_in_tx_hash = tx.hash;
                wallet.last_in_tx_date = tx.date;
                wallet.last_in_tx_amount = tx.amount;
            }
        }
        for(let node of in_nodes) {
            let wallet = node.details;
            wallet.num_out_txs += 1;
            let first_out_tx_index = wallet.first_out_tx_index;
            if(!first_out_tx_index || tx_index < first_out_tx_index) {
                wallet.first_out_tx_index = tx_index;
                wallet.first_out_tx_hash = tx.hash;
                wallet.first_out_tx_date = tx.date;
            }
            let last_out_tx_index = wallet.last_out_tx_index;
            if(!last_out_tx_index || tx_index > last_out_tx_index) {
                wallet.last_out_tx_index = tx_index;
                wallet.last_out_tx_hash = tx.hash;
                wallet.last_out_tx_date = tx.date;
                wallet.last_out_tx_amount = tx.amount;
            }
        }
        let i=0;
        for(const in_node of in_nodes) {
            for(const out_node of out_nodes) {
                if(in_node.id !== out_node.id) {
                    edges.push(
                        {
                            id: tx.hash + '_' + i++,
                            details: tx,
                            source: in_node.id,
                            target: out_node.id
                        }
                    );
                }
            }
        }
    }

    for(const addresses_chunk of chunk(new_addresses, 50)) {
        let balances_json = await fetchJson(`https://blockchain.info/balance?active=${addresses_chunk.join('|')}`);
        for(let address of addresses_chunk) {
            let node = nodes[address]!;
            node.details.balance = balances_json[address]['final_balance'];
        }
    }
    return {nodes: Object.values(nodes), edges: edges};
}