pragma solidity ^0.4.11;

import "./Owned.sol";

/* To be deploy by PaymentAgent, so that no human has owner access */
contract Stash is Owned {
  bytes32 bankName;
  int balance;
  /* Stash contract is keeping track of its position continuously as it will
     need to know its position continuously during the gridlock resolution
     process */
  int position; 	/* position = inflows + balance - outflows */
  bool controlled;	/* @private */

  constructor(bytes32 _bankName) public {
    bankName = _bankName;
  }

  function credit(int _crAmt) public onlyOwner {
    balance += _crAmt;
  }

  function debit(int _dAmt) public onlyOwner {
    balance -= _dAmt;
  }

  function safe_debit(int _dAmt) public onlyOwner {
    // throw is deprecated, see https://solidity.readthedocs.io/en/develop/control-structures.html#error-handling-assert-require-revert-and-exceptions
    //if (_dAmt > balance) throw;
    if (_dAmt > balance) {
      revert("Debit amount is more than balance."); // Seb: I do not see Solidity has localization of strings
    }
    balance -= _dAmt;
  }

  function inc_position(int amt) public onlyOwner {
    position += amt;
  }

  function dec_position(int amt) public onlyOwner {
    position -= amt;
  }

  function getBalance() public constant returns (int) {
    return balance;
  }

  function getPosition() public constant returns (int) {
    return position;
  }

  function isSolvent() public constant returns (bool) {
    return position >= 0;
  }

  function mark() public onlyOwner {
    controlled = true;
  }

  function isControlled() public constant returns (bool) {
    return controlled;
  }
}
