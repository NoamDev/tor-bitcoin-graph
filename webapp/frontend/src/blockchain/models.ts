import { getValue } from "@testing-library/user-event/dist/utils";

export type Wallet = {
    address: string,
    balance: number,
    num_out_txs: number,
    num_in_txs: number,
    first_in_tx_hash?: string,
    first_out_tx_hash?: string,
    last_in_tx_hash?: string,
    last_out_tx_hash?: string,
    first_in_tx_index?: number,
    first_out_tx_index?: number,
    last_in_tx_index?: number,
    last_out_tx_index?: number
};

export type Transaction = {
    hash: string,
    date: number,
    block_index?: number,
    amount: number,
    fee: number
}

export type GraphNode<T> = {
    value: T,
    id: string
}

export type GraphEdge<T> = {
    value: T,
    id: string,
    source: string,
    target: string
}

export type Graph<T,U> = {
    nodes: {[key:string]: GraphNode<T>},
    edges: GraphEdge<U>[]
}

export type BlockchainNode = GraphNode<Wallet>;
export type BlockchainEdge = GraphEdge<Transaction>;
export type BlockchainGraph = Graph<Wallet,Transaction>;