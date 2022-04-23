#!/bin/sh
echo "onion domain: http://$(cat /var/lib/tor/bitcoin-graph/hostname)"
tor