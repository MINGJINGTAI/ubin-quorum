#!/bin/bash

# TODO: 
# backup js files, change js files to use PaymentSeb.sol
# PaymentSeb.sol to emulate pledge(), getBalance()

echo "[*] initializing states and initial funds..."
truffle exec --network mas wipeout.js
truffle exec --network mas createStashesDyn.js
truffle exec --network mas setBalance.js 1 100
truffle exec --network mas setBalance.js 2 200
truffle exec --network mas setBalance.js 3 300

#./initStash.sh 5 1000 2000 3000
# check these
# https://blog.vjrantal.net/2017/05/12/testing-quorum-transaction-privacy-with-truffle/
# https://ethereum.stackexchange.com/questions/34570/how-to-know-the-contract-address-which-truffle-is-deploying-with

echo "[*] starting balances:"
truffle exec --network mas getStashes.js

echo "[*] submitting payment for regression testing"
truffle exec --network a emulateCreateTrx.js 3 20 0 0 R0000001

echo "[*] checking payment status R0000001 - Seb"
truffle exec --network a emulateGetPmtDtls.js R0000001

