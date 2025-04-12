// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol"; 

contract RealEstate is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;


    constructor() ERC721("RealEstate", "Real") {} 

    function mint(string memory _tokenURI) public returns (uint256) {
    _tokenIds.increment(); // ✅ Start from token ID 1
    uint256 newItemId = _tokenIds.current();

    _mint(msg.sender, newItemId);
    _setTokenURI(newItemId, _tokenURI);

    return newItemId;
}

    function toSupply() public view returns(uint256){
        return _tokenIds.current();
    }

}
