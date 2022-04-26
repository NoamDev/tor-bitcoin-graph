import Grid from "@mui/material/Grid";
import { Transaction } from "../../blockchain/models"
import { formatBalance } from "../../util";

type TransactionDetailsProps = {
    tx: Transaction
};

export default function TransactionDetails(props: TransactionDetailsProps) {
    const {tx} = props;
    
    return (
        <Grid container spacing={1} direction="column" m={2}>
            <Grid item>
                <b>Hash</b>
            </Grid>
            <Grid item>
                {tx.hash}
            </Grid>
            <Grid item>
                <b>Date</b>
            </Grid>
            <Grid item>
                {(new Date(tx.date*1000)).toLocaleDateString()}
            </Grid>
            <Grid item>
                <b>Block Index</b>
            </Grid>
            <Grid item>
                {tx.block_index ?? 'Unavailable'}
            </Grid>
            <Grid item>
                <b>Amount</b>
            </Grid>
            <Grid item>
                {formatBalance(tx.amount)} BTC
            </Grid>
            <Grid item>
                <b>Fee</b>
            </Grid>
            <Grid item>
                {formatBalance(tx.fee)} BTC
            </Grid>
            <Grid item>
                <b>Input Addresses</b>
            </Grid>
            {
            tx.inputs.map(addr =>
                (<Grid item>
                    {addr}
                </Grid>))
            }
            <Grid item>
                <b>Output Addresses</b>
            </Grid>
            {
            tx.outputs.map(addr =>
                (<Grid item>
                    {addr}
                </Grid>))
            }
        </Grid>
    );
}