pragma solidity ^0.4.11;

contract Owned{
  address owner;

  constructor() public {
    owner = msg.sender;
  }

  // throw is deprecated, see https://solidity.readthedocs.io/en/develop/control-structures.html#error-handling-assert-require-revert-and-exceptions
  //modifier onlyOwner() {
  //  if(msg.sender!=owner) throw; _;
  //}

  modifier onlyOwner{
    if (msg.sender != owner){
        revert();
    }
    _;
  }

  function getOwner() public constant returns (address) {
    return owner;
  }

  function changeOwner(address _newOwner) public onlyOwner {
    owner = _newOwner;
  }
}
