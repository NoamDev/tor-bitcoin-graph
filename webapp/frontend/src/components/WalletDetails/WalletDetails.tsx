import Grid from "@mui/material/Grid";
import { Wallet } from "../../blockchain/models"
import { formatBalance } from "../../util";

type WalletDetailsProps = {
    wallet: Wallet
}
export default function WalletDetails(props: WalletDetailsProps) {
    const wallet = props.wallet;
    return (<Grid container spacing={1} direction="column" m={2}>
                <Grid item>
                    <b>Address</b>
                </Grid>
                <Grid item>
                    {wallet.address}
                </Grid>
                <Grid item>
                    <b>Balance</b>
                </Grid>
                <Grid item>
                    {formatBalance(wallet.balance)} BTC
                </Grid>
                <Grid item>
                    <b>Incoming Transactions</b>
                </Grid>
                <Grid item>
                    {wallet.num_in_txs}
                </Grid>
                <Grid item>
                    <b>Outgoing Transactions</b>
                </Grid>
                <Grid item>
                    {wallet.num_out_txs}
                </Grid>
                {wallet.last_in_tx_hash &&
                    [(<Grid item>
                        <b>Last Incoming Transaction</b>
                    </Grid>),
                    (<Grid item>
                        {wallet.last_in_tx_hash}
                    </Grid>)]
                }
                {wallet.last_out_tx_hash &&
                    [(<Grid item>
                        <b>Last Outgoing Transaction</b>
                    </Grid>),
                    (<Grid item>
                        {wallet.last_out_tx_hash}
                    </Grid>)]
                }
                
            </Grid>);
}