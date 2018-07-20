const fs = require('fs');
const truffleAssert = require('truffle-assertions'); // Seb added, do from ubin-quorum/
                                                     // npm install truffle-assertions
var nodes = JSON.parse(fs.readFileSync('config/config.json', 'utf8'));
var PaymentAgent = artifacts.require("./PaymentEmulator.sol");
var util = require('../util.js');
var u = require('./test-utils.js');
// set initial variables
var bankIdx = process.argv[6];
var bal = process.argv[7];
bal = bal < 1 ? 1 : bal; //balance can't be zero

bankName = nodes[bankIdx].stashName;
let i = u.searchNode(nodes, 'stashName', bankName);
var consKey = nodes[i].constKey;
var txId = null; // Seb added

module.exports = (done) => {
  let paymentAgent = null;
  let txId = null;

  PaymentAgent.deployed().then((instance) => {
    paymentAgent = instance;

    console.log("Setting "+bankName+"'s stash balance to " + bal + "...");
    //return paymentAgent.pledge(bankName, bal, {privateFor: [consKey]});
    // Seb: fix for Error: Invalid number of arguments to Solidity function
    let txId = 'R'+Date.now();
    console.log("TxID: "+ txId);    
    return paymentAgent.pledge(txId, bankName, bal, {gas: 1000000, privateFor: [consKey]});
  }).then((result) => {
    console.log("\tmined!, block: "+result.receipt.blockNumber+", tx hash: "+result.tx);
    console.log("");

    console.log(JSON.stringify(result));
    console.log("");

    // https://blog.kalis.me/check-events-solidity-smart-contract-test-truffle/
    truffleAssert.eventEmitted(result, 'BalancePledged', (ev) => {
        //return ev.player === bettingAccount && !ev.betNumber.eq(ev.winningNumber);
        console.log("Event for stashName:" + util.hex2a(ev.stashName) + " >>> " + JSON.stringify(ev));
        console.log("");
        return ev.txRef != null;
    });

    done();
  }).catch((e) => {
    console.log(e);
    done();
  });
};
