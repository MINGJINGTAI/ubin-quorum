const fs = require('fs');
const truffleAssert = require('truffle-assertions'); // Seb added, do from ubin-quorum/
                                                     // npm install truffle-assertions
var nodes = JSON.parse(fs.readFileSync('config/config.json', 'utf8'));

var PaymentAgent = artifacts.require("./PaymentEmulator.sol");
var SGDz = artifacts.require("./SGDz.sol");
var util = require('../util.js');
var u = require('./test-utils.js');

var sha256 = require('js-sha256').sha256;

// Seb: tracing run_test_cancelPayment.sh

// set initial variables

console.log('web3.eth.accounts[0]: '+web3.eth.accounts[0]); // Seb
var sender = u.getStashName(nodes, web3.eth.accounts[0]); // Seb: account from nx03 (truffle exec --network a)
var receiver  = process.argv[6]; // Seb: argv[6] = 2
var receiver_acc = null;

// Seb: below comment means this test is hardcoded based on the order of nodes in config.json

//enable quick selection of receiver based on order in config.json
//bypass if full name of recever provided//
if (receiver.length === 1){
  receiver_acc = nodes[receiver].ethKey;
  receiver = nodes[receiver].stashName;
}

var amount  = process.argv[7];
var express = process.argv[8];
var directQueue = process.argv[9] === 1? true : false;
var txRef = process.argv[10];

console.log('receiver_acc: '+receiver_acc);
console.log('Sender: '+sender); // Seb
console.log('Receiver: '+receiver); // Seb

// Seb: sender == receiver, nodes entry will be removed from below line!?!
nodesPseudoPub = u.removeMe(nodes, sender);
// nodesPrivateFor = u.removeOthers(nodes, receiver);
// remove central bank as well
nodesPrivateFor = nodes.filter((i) => { return i.stashName == receiver; });

console.log('nodesPrivateFor: '+nodesPrivateFor);
keysPseudoPub = u.getValueFromAllNodes(nodesPseudoPub, 'constKey');
keysPrivateFor = u.getValueFromAllNodes(nodesPrivateFor, 'constKey');

module.exports = (done) => {
  let paymentAgent = null;
  let currentNetwork = util.getCurrentNetwork(web3);
  let gridlocked = null;

  String.prototype.lpad = function(padString, length) {
    var str = this;
    while (str.length < length)
      str = padString + str;

    return str;
  };

  var salt = "cb06bf108dd249884188983c75186512".lpad("0", 32); // fixed salt for now
  var saltInt = parseInt(amount).toString(16).lpad("0", 32) + salt;
  var a = [];
  for (var i = 0; i < saltInt.length; i += 2) {
    a.push("0x" + saltInt.substr(i, 2));
  }

  var amountHash = "0x" + sha256(a.map((i) => { return parseInt(i, 16); }));

  PaymentAgent.deployed().then((instance) => {
    paymentAgent = instance;
    return SGDz.deployed();
  }).then((instance) => {
    sgdz = instance;

    util.colorLog("Submitting payment of "+amount+" for "+sender+" to "+receiver+"...", currentNetwork);
    util.colorLog("keysPrivateFor: "+keysPrivateFor, currentNetwork); // Seb
    util.colorLog("with salt: "+salt, currentNetwork);
    console.log(txRef, sender, receiver, amount, express, directQueue, "0x"+salt);

    return paymentAgent.submitPmt(txRef, sender, receiver, amount, express, directQueue, "0x"+salt, 
                                  {gas: 1000000,
                                   privateFor: keysPrivateFor});
  }).then((result) => {
    util.colorLog(JSON.stringify(result), currentNetwork);

    gridlocked = result.logs[0].args.gridlocked;

    util.colorLog("\tmined!, block: "+result.receipt.blockNumber+", tx hash: "+result.tx, currentNetwork);
    // Seb: event emission
    // https://blog.kalis.me/check-events-solidity-smart-contract-test-truffle/
    truffleAssert.eventEmitted(result, 'Payment', (ev) => {
        //return ev.player === bettingAccount && !ev.betNumber.eq(ev.winningNumber);
        util.colorLog("Event >>> "+JSON.stringify(ev), currentNetwork);
        util.colorLog("");
        return ev.txRef != null;
    });
    util.colorLog(JSON.stringify(result.logs), currentNetwork);
    util.colorLog("");
    util.colorLog('[Payment event] txRef: '+util.hex2a(result.logs[0].args.txRef), currentNetwork);
    util.colorLog('[Payment event] gridlocked: '+gridlocked, currentNetwork);
    util.colorLog("", currentNetwork);

/*
    return paymentAgent.getHistoryLength.call().then((result) => {
	  console.log("Payments length:"+result);
	  done();
    });
*/

    return paymentAgent.payments.call(txRef)
      .then((result) => {
        console.log(result);
        done();
    });
  }).catch((e) => {
    console.error(e);
    done();
  });

};
