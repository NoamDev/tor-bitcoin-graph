import Grid from "@mui/material/Grid";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useState } from "react";
import { Wallet } from "../../blockchain/models";

type AddressListProps = {
    wallets: Wallet[]
}

enum SortBy {
    INCOMING_TXS,
    OUTGOING_TXS,
    TOTAL_TXS,
}

export default function AddressList(props: AddressListProps) {
    const [sort_by, setSortBy] = useState(SortBy.TOTAL_TXS);

    function getSortedAddresses() {
        let sorted_wallets = [...props.wallets];
        switch(sort_by) {
            case SortBy.INCOMING_TXS:
                sorted_wallets.sort((a,b)=>b.num_in_txs-a.num_in_txs);
                break;
            case SortBy.OUTGOING_TXS:
                sorted_wallets.sort((a,b)=>b.num_out_txs-a.num_out_txs);
                break;
            case SortBy.TOTAL_TXS:
                sorted_wallets.sort((a,b)=>(b.num_in_txs+b.num_out_txs) - (a.num_in_txs+a.num_out_txs));
                break;
        }
        return sorted_wallets.map(w=>w.address);
    }

    return (
        <Grid container direction="column" spacing={2} m={2}>
            <Grid item>
            <Select
                value={sort_by}
                onChange={(event)=>setSortBy(event.target.value as SortBy)}
            >
                <MenuItem value={SortBy.INCOMING_TXS}>Incoming transactions</MenuItem>
                <MenuItem value={SortBy.OUTGOING_TXS}>Outgoing transactions</MenuItem>
                <MenuItem value={SortBy.TOTAL_TXS}>Toal transactions</MenuItem>
            </Select>
            </Grid>
            {
                getSortedAddresses().map((addr,i) =>(
                    <Grid item key={i}>
                        {addr}
                    </Grid>
                ))
            }
        </Grid>
    )
}