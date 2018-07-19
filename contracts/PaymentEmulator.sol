pragma solidity ^0.4.21;

contract PaymentEmulator {

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
}

