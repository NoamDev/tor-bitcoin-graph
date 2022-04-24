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

export type GraphNode<T,U> = {
    value: T,
    in_edges: GraphEdge<T,U>[],
    out_edges: GraphEdge<T,U>[]
}

export type GraphEdge<T,U> = {
    value: U,
    from: GraphNode<T,U>,
    to: GraphNode<T,U>
}