const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');

// Seb: host and port to read from deployment script, otherwise default to Project Ubin nodes
var host = process.argv[2];
var port = process.argv[3];
host = (host != null && host.length > 0) ? host : "quorumnx01.southeastasia.cloudapp.azure.com";
port = (port != null && port.length > 0) ? port : "20010";

const web3 = new Web3(new Web3.providers.HttpProvider("http://" + host + ":" + port));
// Seb: check Web3 Provider reachability
//      https://github.com/ethereum/web3.js/blob/develop/lib/web3/httpprovider.js
if (!web3.isConnected()) {
  throw "Web3 Provider Host " + host + " or Port " + port + " unreachable!";
}

var sgdz_compiled = JSON.parse(fs.readFileSync('sgdz_compiled_bak', 'utf8'));

var sgdzContract = web3.eth.contract(sgdz_compiled["abi"]);

var sgdz = sgdzContract.new({
    from: web3.eth.accounts[0],
    data: "0x" + sgdz_compiled["bytecode"],
    gas: '114700000'
}, (e, contract) => {
    if (e) {
        console.log("err creating contract", e);
    } else {
        if (!contract.address) {
            console.log("Contract transaction send: TransactionHash: " + contract.transactionHash
                + " waiting to be mined...");
        } else {
            console.log("Contract mined! Address: " + contract.address);

            fs.writeFile('zAddress', contract.address,
                err => { if (err) console.log(err); });
        }
    }
});
