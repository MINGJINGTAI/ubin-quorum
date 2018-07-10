#!/bin/bash


echo "###############################################"
echo "       Starting UBIN Quorum API Layer";
echo "###############################################"

NETWORK_CONFIG_PATH='/server/config/network.json'
#API_PATH='/home/azureuser/ubin-quorum'
#HOME_DIR='/home/azureuser/ubin-quorum'
#USER='azureuser'

# Seb:
# modified for own ubin home and user
API_PATH='/mnt/ubin/ubin-quorum'
HOME_DIR='/mnt/ubin/ubin-quorum'
USER='sma05054'

if hash jq 2>/dev/null; then
    echo "JQ installed.. Proceeding...";
else
    echo "JQ is not installed.. Installing JQ.."
    sudo apt install jq
fi

echo "###############################################"

jq -c '.[] | { host, stashName}' server/config/network.json | while read i; do
    HOST=`echo $i | jq -r .host`
    STASHNAME=`echo $i | jq -r .stashName`
    echo "Copying contract to $HOST ..."
    #ssh -n $USER@$HOST "sudo rm -r $HOME_DIR/build/contracts/*json"
    #ssh -n $USER@$HOST "cd $HOME_DIR && sudo mkdir -p build/contracts && sudo chmod -R 777 build"
    # Seb: No sudo, no password input from terminal
    ssh -n $USER@$HOST "rm -r $HOME_DIR/build/contracts/*json"
    ssh -n $USER@$HOST "cd $HOME_DIR && mkdir -p build/contracts && chmod -R 777 build"
    scp -r build/contracts/*.json $USER@$HOST:$HOME_DIR/build/contracts
    
    echo "Copying network config to $HOST ..."
    #ssh -n $USER@$HOST "sudo rm -r $HOME_DIR/server/config/network.json"
    # Seb: No sudo, no password input from terminal
    ssh -n $USER@$HOST "rm -r $HOME_DIR/server/config/network.json"
    scp -r server/config/network.json $USER@$HOST:$HOME_DIR/server/config/

    echo "Starting API Server for $STASHNAME ..."
    ssh -n $USER@$HOST bash -c "'
        pkill -9 node
        cd $API_PATH
        nohup npm start $STASHNAME > $API_PATH/api.log &
    '"
    # Seb: api.log should be written to API_PATH 
    # WRONG: nohup npm start $STASHNAME > ~/api.log &

    echo "API Server for $STASHNAME is running"

done
