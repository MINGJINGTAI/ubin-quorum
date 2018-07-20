const fs = require('fs');
const truffleAssert = require('truffle-assertions'); // Seb added, do from ubin-quorum/
                                                     // npm install truffle-assertions
var nodes = JSON.parse(fs.readFileSync('config/config.json', 'utf8'));
var PaymentAgent = artifacts.require("./PaymentEmulator.sol");
var util = require('../util.js');
var u = require('./test-utils.js');

var Promise = require("bluebird");
var promiseFor = Promise.method(function(condition, action, value) {
  if (!condition(value)) return value;
  return action(value).then(promiseFor.bind(null, condition, action));
});

//remove trx sender.
let currentNetwork = util.getCurrentNetwork(web3);
let stashName = u.getStashName(nodes, web3.eth.accounts[0]);
nodes = u.removeMe(nodes, stashName);
let constellationKeys = u.getValueFromAllNodes(nodes, 'constKey');

// set initial variables
var stashCount = nodes.length - 1;//assume central bank has no stash

module.exports = (done) => {
  let paymentAgent = null;
  let currentNetwork = util.getCurrentNetwork(web3);

  PaymentAgent.deployed().then((instance) => {
    paymentAgent = instance;
    
    util.colorLog("Creating stashes...\n", currentNetwork);

    return promiseFor((count) => {
      return count < nodes.length;
    }, (count) => {

      util.colorLog("Creating stash for " + nodes[count].stashName, currentNetwork);
      return paymentAgent.createStash(nodes[count].stashName, {privateFor: constellationKeys}).then((result) => {
          console.log("\tmined!, block: "+result.receipt.blockNumber+", tx hash: "+result.tx);
          console.log("");


        util.colorLog("\tMarking stash for " + nodes[count].stashName, currentNetwork);
        return paymentAgent.markStash(nodes[count].stashName, {privateFor: [constellationKeys[count]]}).then((result) => {
        console.log("\tmined!, block: "+result.receipt.blockNumber+", tx hash: "+result.tx);
        console.log("");

        console.log(JSON.stringify(result));
        console.log("");

        // https://blog.kalis.me/check-events-solidity-smart-contract-test-truffle/
        truffleAssert.eventEmitted(result, 'StashMarked', (ev) => {
            //return ev.player === bettingAccount && !ev.betNumber.eq(ev.winningNumber);
            console.log("Event for stashName:" + util.hex2a(ev.stashName) + " >>> " + JSON.stringify(ev));
            console.log("");
            return ev.txRef != null;
        });

        return ++count;

    });      

  });
    }, 0);
        
  }).then(() => {
    done();
  }).catch((e) => {
    console.error(e);
    done();
  });
};



