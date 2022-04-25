import {Wallet, Transaction, GraphEdge, GraphNode, BlockchainNode, BlockchainEdge, BlockchainGraph} from './models';

import chunk from 'lodash.chunk'

async function fetchJson(url: string, backoff=1000) {
    var r;
    try {
        r = await fetch(url);
        return await r.json();
    } catch(e) {
        if(backoff >= 5000) {
            throw e;
        }
        return new Promise((resolve, reject)=>{
            setTimeout(async ()=>{
                try {
                    let json = await fetchJson(url, backoff*2);
                    resolve(json);
                } catch(e) {
                    reject(e);
                }
            }, backoff);
        });
    }
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
            value: wallet,
            id: address_json['address']
        }
        nodes[address_json['address']] = node;
    }

    let tx_jsons = json['txs'];
    let offset = 100;
    while(json['txs'].length == 100) {
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
            input_addresses.push(input['prev_out']['addr']);
        }
        for(let output of tx_json['out']) {
            amount_out += output['value'];
            output_addresses.push(output['addr']);
        }
        let fee = amount_in - amount_out;
        let tx: Transaction = {
            hash: tx_json['hash'],
            date: tx_json['time'],
            block_index: tx_json['block_index'],
            amount: amount_out,
            fee: fee
        };
        let tx_index = tx_json['tx_index'];
        
        let out_nodes = output_addresses.map( address =>
            {
                let node = nodes[address];
                if(!node) {
                    node = {
                        value: {
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
        let i=0;
        for(let node of out_nodes) {
            let wallet = node.value;
            wallet.num_in_txs += 1;
            let first_in_tx_index = wallet.first_in_tx_index;
            if(!first_in_tx_index || tx_index < first_in_tx_index) {
                wallet.first_in_tx_index = tx_index;
                wallet.first_in_tx_hash = tx.hash;
            }
            let last_in_tx_index = wallet.last_in_tx_index;
            if(!last_in_tx_index || tx_index > last_in_tx_index) {
                wallet.last_in_tx_index = tx_index;
                wallet.last_in_tx_hash = tx.hash;
            }
            
            let in_edges = in_nodes.map(from_node => ({
                id: tx.hash + '_' + i++,
                value: tx,
                source: from_node.id,
                target: node.id
            }));
            edges.push(...in_edges);
        }
        for(let node of in_nodes) {
            let wallet = node.value;
            wallet.num_out_txs += 1;
            let first_out_tx_index = wallet.first_out_tx_index;
            if(!first_out_tx_index || tx_index < first_out_tx_index) {
                wallet.first_out_tx_index = tx_index;
                wallet.first_out_tx_hash = tx.hash;
            }
            let last_out_tx_index = wallet.last_out_tx_index;
            if(!last_out_tx_index || tx_index > last_out_tx_index) {
                wallet.last_out_tx_index = tx_index;
                wallet.last_out_tx_hash = tx.hash;
            }
            
            let out_edges = out_nodes.map(to_node => ({
                id: tx.hash + '_' + i++,
                value: tx,
                source: node.id,
                target: to_node.id
            }));
            edges.push(...out_edges);
        }
    }

    for(const addresses_chunk of chunk(new_addresses, 50)) {
        let balances_json = await fetchJson(`https://blockchain.info/balance?active=${addresses_chunk.join('|')}`);
        for(let address of addresses_chunk) {
            let node = nodes[address]!;
            node.value.balance = balances_json[address]['final_balance'];
        }
    }
    return {nodes: nodes, edges: edges};
}