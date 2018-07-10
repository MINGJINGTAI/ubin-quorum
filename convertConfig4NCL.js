const fs = require('fs');

var config = JSON.parse(fs.readFileSync('networkNodesInfo.json', 'utf8'));

var nettingConfig = [];

var truffleNetworks = { 	// PHH added
  "development": { 		// PHH added
    "nodeId": 0,                // PHH added
    "host": "localhost", 	// PHH added
    "port": 8545, 		// PHH added
    "network_id": "*" 		// PHH added
  } 				// PHH added
} ; 				// PHH added

/* Seb commented
var stashNames = {
  "01" : "MASREGULATOR",
  "02" : "MASGSGSG",
  "03" : "BOFASG2X",
  "04" : "CHASSGSG",
  "05" : "CITISGSG",
  "06" : "CSFBSGSX",
  "07" : "DBSSSGSG",
  "08" : "HSBCSGSG",
  "09" : "MTBCSGSG",
  "10" : "OCBCSGSG",
  "12" : "SCBLSGSG",
  "14" : "UOBVSGSG",
  "15" : "XSIMSGSG"
};

var truffleNames = { 		// PHH added
  "01" : "mas", 		// PHH added
  "02" : "cb", 			// PHH added
  "03" : "a", 			// PHH added
  "04" : "b", 			// PHH added
  "05" : "c", 			// PHH added
  "06" : "d", 			// PHH added
  "07" : "e", 			// PHH added
  "08" : "f", 			// PHH added
  "09" : "g", 			// PHH added
  "10" : "h", 			// PHH added
  "12" : "i", 			// PHH added
  "14" : "j", 			// PHH added
  "15" : "k" 			// PHH added
}; 				// PHH added
*/

// Seb modified
var stashNames = {
  "1" : "MASREGULATOR",
  "2" : "MASGSGSG",
  "3" : "BOFASG2X",
  "4" : "CHASSGSG",
  "5" : "CITISGSG",
  "6" : "CSFBSGSX",
  "7" : "DBSSSGSG",
  "8" : "HSBCSGSG",
  "9" : "MTBCSGSG",
  "10" : "OCBCSGSG",
  "12" : "SCBLSGSG",
  "13" : "UOBVSGSG",
  "14" : "XSIMSGSG"
};
// Seb modified
var truffleNames = { 
  "1" : "mas", 		
  "2" : "cb", 	
  "3" : "a", 
  "4" : "b", 	
  "5" : "c", 
  "6" : "d", 		
  "7" : "e", 	
  "8" : "f", 
  "9" : "g", 
  "10" : "h", 	
  "12" : "i", 	
  "13" : "j", 
  "14" : "k" 	
}; 			

var counter = 0;

Object.keys(config).forEach( enode => {
  /* Seb: We do not need this as long as networkNodesInfo.json contains
          nx01, nx02, nx03,......nx10, nx12, nx13, nx14
  if (config[enode].nodeName === "nx14") {
    config[enode].nodeName = "nx13";
    console.log("NCL nodeName nx14 changed to nx13");
  }
  if (config[enode].nodeName === "nx15") {
    config[enode].nodeName = "nx14";
    console.log("NCL nodeName nx15 changed to nx14");
  }
  */
  let nodeId = config[enode].nodeName.slice(2,4);
  let nodeNr = parseInt(nodeId); // Seb: NCL nodes, no padding required
  if (nodeNr < 10 ) {
    nodeId = nodeNr;
  }
  let centralBank = false;
  let regulator = false;
  let stashName = stashNames[nodeId];
  if (stashName === "MASGSGSG") centralBank = true;
  if (stashName === "MASREGULATOR") regulator = true;
  let nodeConfig = {
    "nodeId" : parseInt(nodeId),
    /*"host" : "quorumnx"+nodeId+".southeastasia.cloudapp.azure.com",*/
    "host" : "n"+nodeId, // Seb: NCL nodes does not need FQDN, just hostname is preferred
    "port": "20010",
    "accountNumber" : 0,
    "ethKey" : config[enode].address,
    "constKey" : config[enode].constellationPublicKey,
    "stashName" : stashName,
    "enode" : enode,
    "centralBank" : centralBank,
    "regulator" : regulator,
    "localport" : 3000
  };
  nettingConfig.push(nodeConfig);

  if( typeof stashName != 'undefined' ) { 	// PHH added
    let truffleName = truffleNames[ nodeId ] ; 	// PHH added
    let truffleNode = { 			// PHH added
      "nodeId": nodeConfig.nodeId,              // PHH added
      "host": nodeConfig.host, 			// PHH added
      "port": parseInt( nodeConfig.port ), 	// PHH added
      "network_id": "*" 			// PHH added
    }; 						// PHH added
    if( regulator ) { 				// PHH added
      truffleNode["from"] = "0x7ce0c1d9ad848a781af2ed613b2d8db6c9178673" ; // Seb added, this should be coinbase from n1
      truffleNode["gas"] = 200000000 ; 		// PHH added
    } 						// PHH added
    truffleNetworks[truffleName] = truffleNode ;// PHH added
  } 						// PHH added

  counter++;

});

nettingConfig.sort((a,b) => { return a.nodeId - b.nodeId; });

function sortTruffle( o ) { // PHH added
	return Object.keys(o).sort( (a,b) => { return o[a].nodeId - o[b].nodeId; } ).reduce((r, k) => (r[k] = o[k], r), {}); // PHH added
} // PHH added

truffleNetworks = sortTruffle( truffleNetworks ) // PHH added

fs.writeFile('test-scripts/config/config.json', JSON.stringify(nettingConfig, null, "    "), // PHH modified null, "    "
             err => { if(err) console.log(err); });

var testnet = { "nodes" : nettingConfig.map(i => i.constKey) };

fs.writeFile('testnet.json', JSON.stringify(testnet, null, "    "), // PHH modified null, "    "
             err => { if(err) console.log(err); });


fs.writeFile('server/config/network.json', JSON.stringify(nettingConfig, null, "    "), // PHH modified null, "    "
            err => { if(err) console.log(err); });

fs.writeFile('truffle.js', 'module.exports = ' + JSON.stringify({"networks": truffleNetworks}, null, "  ").replace(/\"([^"]+)\":/g,"$1:") + ';', // PHH added
            err => { if(err) console.log(err); }); // PHH added
