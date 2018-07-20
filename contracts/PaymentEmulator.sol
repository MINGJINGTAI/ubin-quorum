pragma solidity ^0.4.21;

import "./StashEmulator.sol";

contract PaymentEmulator {

  uint public current; // current resolving bank

  constructor() public {
    /*
    owner = msg.sender;
    agentState = AgentState.Normal;
    maxQueueDepth = 100;
    */
    //timeout = 10 * 1000000000;   /* seconds */
    //proofTimeout = 20 * 1000000000;   /* seconds */
  }

  /* set up central bank */
  bytes32 public centralBank;
  function setCentralBank(bytes32 _stashName) public /*onlyOwner*/ {
    centralBank = _stashName;
  }

  enum PmtState { Pending, Confirmed, Onhold, Cancelled }
  struct Pmt {
    bytes32 txRef;
    bytes32 sender;
    bytes32 receiver;
    int amount; // > 0
    PmtState state;
    int express;
    bool putInQueue;
    uint timestamp; // added to include sorting in API layer - Laks
    bytes16 salt;
  }

  bytes32[] public pmtIdx;                  // @private (list of all-trans)
  mapping (bytes32 => Pmt) public payments; // @private

  event Payment(bytes32 txRef, bool gridlocked, bool confirmPmt);
  function submitPmt(bytes32 _txRef, bytes32 _sender, bytes32 _receiver, int _amount,
                     int _express, bool _putInQueue, bytes16 _salt) public 
  {
    Pmt memory pmt = Pmt(_txRef,
                         _sender,
                         _receiver,
                         _amount,
                         PmtState.Pending,
                         _express,
                         _putInQueue,
                         now,
                         _salt);
    pmtIdx.push(_txRef);
    payments[_txRef] = pmt;

    emit Payment(_txRef, false, false);
  }

  function getHistoryLength() public constant returns (uint) {
    return pmtIdx.length;
  }

  function getPmtAmt(bytes32 _txRef) public constant returns (int) {
    return payments[_txRef].amount;
  }

  
  bytes32[] public stashNames;
  mapping (bytes32 => address) public stashRegistry;

  function createStash(bytes32 _stashName) public /*onlyOwner*/ returns (bool){
    address stash = new StashEmulator(_stashName);
    stashRegistry[_stashName] = stash;
    stashNames.push(_stashName);
    return true;
  }

  /* @depolyment:
     privateFor = MAS and owner node */
  event StashMarked(bytes32 stashName);
  function markStash(bytes32 _stashName) public /*onlyOwner*/ {
    StashEmulator stash = StashEmulator(stashRegistry[_stashName]);
    stash.mark();
    emit StashMarked(_stashName);
  }

  struct Pledge {
    bytes32 txRef;
    bytes32 stashName;
    int amount;
    uint timestamp;
  }
  bytes32[] public pledgeIdx;
  mapping (bytes32 => Pledge) public pledges;

  event BalancePledged(bytes32 txRef, bytes32 stashName, int amount);
  function pledge(bytes32 _txRef, bytes32 _stashName, int _amount) public
  {
    if (_stashName != centralBank || isCentralBankNode()) {      
	  if (stashRegistry[_stashName] != address(0x0)) {
        StashEmulator stash = StashEmulator(stashRegistry[_stashName]);
        if (address(stash) != address(0x0)) {
          //stash.credit(_amount);
          //stash.inc_position(_amount);
        }
      }

      pledgeIdx.push(_txRef);
      pledges[_txRef].txRef = _txRef;
      pledges[_txRef].stashName = _stashName;
      pledges[_txRef].amount = _amount;
      pledges[_txRef].timestamp = now;

      emit BalancePledged(_txRef, _stashName, _amount);
    }
  }

  function getBalance(bytes32 _stashName) public /*isStashOwner(_stashName)*/ constant returns (int) {
    //StashEmulator stash = StashEmulator(stashRegistry[_stashName]);
    //return stash.getBalance();
    return 42;
  }

  function getPosition(bytes32 _stashName) public /*isStashOwner(_stashName)*/ constant returns (int) {
    StashEmulator stash = StashEmulator(stashRegistry[_stashName]);
    return stash.getPosition();
  }

  // Central bank controls all the stashes
  function isCentralBankNode() public constant returns (bool) {
    for (uint i = 0; i < stashNames.length; i++) {
      StashEmulator stash = StashEmulator(stashRegistry[stashNames[i]]);
      if (!stash.isControlled()) {
        return false;
      }
    }
    return true;
  }

  function wipeout() public {
    //clearQueue();
    for (uint i = 0; i < pmtIdx.length; i++){
      delete payments[pmtIdx[i]];
    }
    pmtIdx.length = 0;
    //agentState = AgentState.Normal;
    stashNames.length = 0;
    //resolveSequence.length = 0;
    current = 0;
  }

}

