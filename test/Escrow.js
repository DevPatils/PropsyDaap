const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseEther(n.toString());
}

describe('Escrow Contract', () => {
  let realEstate, escrow;
  let buyer, seller, inspector, lender;
  let tokenId;

  beforeEach(async () => {
    [buyer, seller, inspector, lender] = await ethers.getSigners();

    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();
    await realEstate.deployed();

    // Mint token
    const mintTx = await realEstate.connect(seller).mint(
      "https://media.istockphoto.com/id/513133900/photo/golden-retriever-sitting-in-front-of-a-white-background.jpg?s=612x612&w=0&k=20&c=rPuBgfn_wcAzaa8o2GhrA2eBTdbvrTvYw4demzV-bOs="
    );
    const mintReceipt = await mintTx.wait();
    tokenId = await realEstate.toSupply(); // should be 1

    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(
      realEstate.address,
      lender.address,
      inspector.address,
      seller.address
    );
    await escrow.deployed();

    // Approve and list
    const approveTx = await realEstate.connect(seller).approve(escrow.address, tokenId);
    await approveTx.wait();

    const listTx = await escrow.connect(seller).list(1,buyer.address,tokens(10),tokens(5));
    await listTx.wait();
  });

  describe('Deployment', () => {
    it('Stores NFT address', async () => {
      expect(await escrow.nftAddress()).to.equal(realEstate.address);
    });

    it('Stores seller address', async () => {
      expect(await escrow.seller()).to.equal(seller.address);
    });

    it('Stores inspector address', async () => {
      expect(await escrow.inspector()).to.equal(inspector.address);
    });

    it('Stores lender address', async () => {
      expect(await escrow.lender()).to.equal(lender.address);
    });
  });

  describe('Listing', () => {
    it('Updates the ownership', async () => {
      expect(await realEstate.ownerOf(tokenId)).to.equal(escrow.address);
    });

    it("updates as listed", async()=>{
      const result = await escrow.isListed(1);
      expect(result).to.be.equal(true);
    })

    it("Returns buyer",async()=>{
      const result = await escrow.buyer(1);
      expect(result).to.be.equal(buyer.address);
    })
    it("Returns the purchase",async()=>{
      const result = await escrow.purchaseprice(1);
      expect(result).to.be.equal(tokens(10))
    })
    it("Returns the escrow amount",async()=>{
      const result = await escrow.escrowAmount(1);
      expect(result).to.be.equal(tokens(5));
    })
  });

  describe("Deposits",()=>{
    it("Updates the contract balance",async()=>{
      const transaction = await escrow.connect(buyer).depositEarnest(1,{value : tokens(5)});
      await transaction.wait();
      const result = await escrow.getBalance();
      expect(result).to.be.equal(tokens(5));
      console.log(result);
    })


  })

  describe("Inspections",()=>{
    it("Inspects the transaction",async()=>{
      const transaction = await escrow.connect(inspector).updateInspectionStatus(1,true);
      await transaction.wait();
      const result = await escrow.inspectionPassed(1);
      expect(result).to.be.equals(true);
    })
  })

  describe("Approval",()=>{
    it("Approves the t")
  })
});
