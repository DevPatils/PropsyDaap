//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
    address public nftAddress;
    address public lender;
    address public inspector;
    address payable public seller;
    //nft id  ------ bool
    mapping(uint256 => bool) public isListed;

    //nftid ---------- price in eth
    mapping(uint256 =>uint256) public purchaseprice;
    //nftif ----------- escrowAmount
    mapping(uint256 => uint256) public escrowAmount;
    
    //nftid ------------buyer addrress
    mapping(uint256 => address) public buyer;

    mapping(uint256 => bool) public inspectionPassed;

    mapping(uint256 => mapping(address =>bool)) public approval ;




    constructor(address _nftAddress, address _lender,address _inspector, address payable _seller ){
        nftAddress = _nftAddress;
        lender = _lender;
        inspector = _inspector;
        seller = _seller;
    }

    modifier onlySeller(){
        require(msg.sender==seller,"Only seller can list ");
        _;
    }

    modifier onlyBuyer(uint256 _nftId){
        require(msg.sender == buyer[_nftId],"Only buyer can call this method");
        _;
    }

    modifier onlyInspector(uint256 _nftId){
        require(msg.sender == inspector,"Only inspector can call this function");
        _;
    }

    function list(uint256 _nftID, address _buyer, uint256 _purchaseprice, uint256 _escrowAmount) payable public onlySeller {
        //Transfer NFT from Seller to this contract 
        IERC721(nftAddress).transferFrom(msg.sender,address(this), _nftID);

        //Listing the nft id inside the mappings 
        isListed[_nftID] = true;
        purchaseprice[_nftID] = _purchaseprice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;

    }

    function depositEarnest(uint256 _nftId) public payable {
        require(msg.value == escrowAmount[_nftId]);

    }
    function updateInspectionStatus(uint256 _nftId, bool _passed) public onlyInspector(_nftId){
        inspectionPassed[_nftId] = _passed;
    }
    function approveSale(uint256 _nftId) public {
        approval[_nftId][msg.sender] = true;
    }
    function getBalance() public view returns(uint256){
        return address(this).balance;    
    }


}
