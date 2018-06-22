echo "[*] deploying contract..."
node deploy_multi.js n1 20010 
echo "[*] hardwiring z-contract address..."
node hardwire.js
