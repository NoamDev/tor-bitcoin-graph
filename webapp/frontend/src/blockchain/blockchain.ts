import {Wallet, Transaction, GraphEdge, GraphNode} from './models';

export async function getTransactionGraph(addresses: string[]) {
    let addresses_set = new Set(addresses);

    let r = await fetch(`https://blockchain.info/multiaddr?active=${addresses.join('|')}&n=100`);
    let json = await r.json();

    type BlockchainNode = GraphNode<Wallet,Transaction>;
    type BlockchainEdge = GraphEdge<Wallet,Transaction>;
    
    let nodes = new Map<string, BlockchainNode>();
    let external_addresses: string[] = [];

    for(let address_json of json['addresses']) {
        let wallet: Wallet = {
            address: address_json['address'],
            balance: address_json['final_balance'],
            num_in_txs: 0,
            num_out_txs: 0
        }
        let node: BlockchainNode = {
            value: wallet,
            in_edges: [],
            out_edges: []
        }
        nodes.set(address_json['address'], node);
    }

    let tx_jsons = json['txs'];
    let offset = 100;
    while(json['txs'].length == 100) {
        let r = await fetch(`https://blockchain.info/multiaddr?active=${addresses.join('|')}&n=100&offset=${offset}`);
        json = await r.json();
        tx_jsons.push(...json['txs']);
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
                let node = nodes.get(address);
                if(!node) {
                    node = {
                        value: {
                            address: address,
                            balance: 0,
                            num_in_txs: 0,
                            num_out_txs: 0
                        },
                        in_edges: [],
                        out_edges: []
                    }
                    nodes.set(address, node);
                    external_addresses.push(address);
                }
                return node;
            }
        );

        let in_nodes = input_addresses
            .filter(address => addresses_set.has(address))
            .map(address => nodes.get(address)!);
        
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
            
            let edges = in_nodes.map(from_node => ({
                value: tx,
                from: from_node,
                to: node
            }));
            node.in_edges.push(...edges);
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
            
            let edges = out_nodes.map(to_node => ({
                value: tx,
                from: node,
                to: to_node
            }));
            node.out_edges.push(...edges);
        }

        let r = await fetch(`https://blockchain.info/balance?active=${external_addresses.join('|')}`);
        let json = await r.json();
        
        for(let address in external_addresses) {
            let node = nodes.get(address)!;
            node.value.balance = json[address]['total_balance'];
        }
    }
    return nodes;
}