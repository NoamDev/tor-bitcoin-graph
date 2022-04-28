import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { useState } from "react";

type FindPathComponentProps = {
    addresses: string[],
    findPath?:(from: string, to:string)=>string[]|null
};

export default function FindPathComponent(props: FindPathComponentProps) {
    const [from, setFrom] = useState<string|null>(null);
    const [to, setTo] = useState<string|null>(null);
    type PathState = {
        exists: false
    }|
    {
        exists: true,
        path: string[]
    };

    const [path_state, setPathState] = useState<PathState|null>(null);

    function handleFindShortestPath() {
        if(from && to) {
            console.log('submitting')
            const path = props.findPath?.(from, to);
            if(path) {
                setPathState({
                    exists: true,
                    path: path
                });
            } else {
                setPathState({
                    exists: false
                })
            }
        }
    }

    function renderPath() {
        if(!path_state) {
            return [];
        } else if(path_state.exists) {
            return (
                path_state.path.map((x,i) => 
                        (i%2 === 0) ?
                        (
                            <Grid item>
                                {x}
                            </Grid>
                        ) :
                        (
                            <Grid item>
                                tx: {x}
                            </Grid>
                        )
                    )
            )
        } else {
            return (
                <Grid item>
                    No path exists between these addresses
                </Grid>
            );
        }
    }

    return (
        <Grid container direction='column' spacing={2} m={2}>
            <Grid item>
                Find Shortest Path
            </Grid>
            <Grid item>
                <Autocomplete
                    disablePortal
                    options={props.addresses}
                    sx={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} label="From Address"/>}
                    value={from}
                    onChange={(event, newValue)=>setFrom(newValue)}
                />
            </Grid>
            <Grid item>
                <Autocomplete
                    disablePortal
                    options={props.addresses}
                    sx={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} label="To Address"/>}
                    value={to}
                    onChange={(event, newValue)=>setTo(newValue)}
                />
            </Grid>
            <Grid item>
                <Button
                    variant="contained"
                    disabled={!to||!from}
                    onClick={handleFindShortestPath}
                >
                    Find
                </Button>
            </Grid>
            {renderPath()}
        </Grid>
    );
}