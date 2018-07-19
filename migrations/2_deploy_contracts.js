const fs = require('fs');
var nodes = JSON.parse(fs.readFileSync('../testnet.json', 'utf8'))['nodes'];

var PaymentAgent = artifacts.require("./PaymentAgent.sol")
var SGDz = artifacts.require("./SGDz.sol")
// var ZSLPrecompile = artifacts.require("./ZSLPrecompile.sol")

// Seb
var PaymentSeb = artifacts.require("./PaymentSeb.sol")
var PaymentEmulator = artifacts.require("./PaymentEmulator.sol")

module.exports = function(deployer) {
  // deployer.deploy(ZSLPrecompile);  
  deployer.deploy(SGDz);
  deployer.deploy(PaymentAgent, {privateFor: nodes.slice(1)});

  // Seb
  deployer.deploy(PaymentSeb, {privateFor: nodes.slice(1)});
  deployer.deploy(PaymentEmulator, {privateFor: nodes.slice(1)});
};

