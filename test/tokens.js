const chai = require('chai');

const server = require('./server');
const util = require('./util');

const expect = chai.expect;

describe('tokens', () => {
    let defaultPoolArgs = [0, 0, 0, []];
    let creator;
    let buyer1;
    let buyer2;
    let blacklistedBuyer;
    let payoutAddress;
    let web3;

    before(async () => {
        let result = await server.setUp();
        web3 = result.web3;
        creator = result.addresses[0].toLowerCase();
        buyer1 = result.addresses[1].toLowerCase();
        buyer2 = result.addresses[2].toLowerCase();
        payoutAddress = result.addresses[3].toLowerCase();
        blacklistedBuyer = result.addresses[4].toLowerCase();
    });


    after(() => {
        server.tearDown();
    });

    let PresalePool;
    let TestToken;
    beforeEach(async () => {
        PresalePool = await util.deployContract(web3, "PresalePool", creator, defaultPoolArgs);
        TestToken = await util.deployContract(web3, "TestToken", creator, [blacklistedBuyer]);
        await util.methodWithGas(PresalePool.methods.setToken(TestToken.options.address), creator);
    });

    it("setToken() can only be called by creator", async () => {
        await util.expectVMException(
            util.methodWithGas(PresalePool.methods.setToken(TestToken.options.address), buyer1)
        );
    });

    it("transferMyTokens()", async () => {
        await util.sendTransactionWithGas(
            web3,
            {
                from: creator,
                to: PresalePool.options.address,
                value: web3.utils.toWei(2, "ether")
            }
        );
        await util.sendTransactionWithGas(
            web3,
            {
                from: buyer1,
                to: PresalePool.options.address,
                value: web3.utils.toWei(5, "ether")
            }
        );
        await util.sendTransactionWithGas(
            web3,
            {
                from: buyer2,
                to: PresalePool.options.address,
                value: web3.utils.toWei(1, "ether")
            }
        );

        await util.methodWithGas(PresalePool.methods.close(), creator)
        await util.methodWithGas(
            PresalePool.methods.setContributionSettings(
                0, web3.utils.toWei(2, "ether"), web3.utils.toWei(3, "ether")
            ),
            creator
        )
        await util.methodWithGas(PresalePool.methods.payToPresale(payoutAddress), creator);

        let expectedBalances = {}
        expectedBalances[creator] = {
            remaining: web3.utils.toWei(0, "ether"),
            contribution: web3.utils.toWei(2, "ether")
        }
        expectedBalances[buyer1] = {
            remaining: web3.utils.toWei(4, "ether"),
            contribution: web3.utils.toWei(1, "ether")
        }
        expectedBalances[buyer2] = {
            remaining: web3.utils.toWei(1, "ether"),
            contribution: web3.utils.toWei(0, "ether")
        }
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(5, "ether"));

        await util.methodWithGas(
            TestToken.methods.transfer(
                PresalePool.options.address, 60
            ),
            creator
        );
        expect(await TestToken.methods.balanceOf(creator).call())
        .to.equal("940");

        // calling transferMyTokens() doesn't give you more tokens
        await util.methodWithGas(PresalePool.methods.transferMyTokens(), buyer1);
        await util.methodWithGas(PresalePool.methods.transferMyTokens(), buyer1);

        expectedBalances[creator].contribution = web3.utils.toWei(0, "ether");
        await util.methodWithGas(PresalePool.methods.transferMyTokens(), creator);
        expectedBalances[buyer1].contribution = web3.utils.toWei(0, "ether");
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(5, "ether"));

        expect(await TestToken.methods.balanceOf(creator).call())
        .to.equal("980");
        expect(await TestToken.methods.balanceOf(buyer1).call())
        .to.equal("20");
    });

    it("transferAllTokens()", async () => {
        await util.sendTransactionWithGas(
            web3,
            {
                from: creator,
                to: PresalePool.options.address,
                value: web3.utils.toWei(2, "ether")
            }
        );
        await util.sendTransactionWithGas(
            web3,
            {
                from: buyer1,
                to: PresalePool.options.address,
                value: web3.utils.toWei(5, "ether")
            }
        );
        await util.sendTransactionWithGas(
            web3,
            {
                from: buyer2,
                to: PresalePool.options.address,
                value: web3.utils.toWei(1, "ether")
            }
        );

        await util.methodWithGas(PresalePool.methods.close(), creator)
        await util.methodWithGas(
            PresalePool.methods.setContributionSettings(
                0, web3.utils.toWei(2, "ether"), web3.utils.toWei(3, "ether")
            ),
            creator
        )
        await util.methodWithGas(PresalePool.methods.payToPresale(payoutAddress), creator);

        let expectedBalances = {}
        expectedBalances[creator] = {
            remaining: web3.utils.toWei(0, "ether"),
            contribution: web3.utils.toWei(2, "ether")
        }
        expectedBalances[buyer1] = {
            remaining: web3.utils.toWei(4, "ether"),
            contribution: web3.utils.toWei(1, "ether")
        }
        expectedBalances[buyer2] = {
            remaining: web3.utils.toWei(1, "ether"),
            contribution: web3.utils.toWei(0, "ether")
        }
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(5, "ether"));

        await util.methodWithGas(
            TestToken.methods.transfer(
                PresalePool.options.address, 60
            ),
            creator
        );
        expect(await TestToken.methods.balanceOf(creator).call())
        .to.equal("940");

        // can only be called by creator
        await util.expectVMException(
            util.methodWithGas(PresalePool.methods.transferAllTokens(), buyer1)
        );

        await util.methodWithGas(PresalePool.methods.transferAllTokens(), creator);
        // expect no failures
        await util.expectVMException(
            PresalePool.methods.failures(0).call()
        );

        expectedBalances[creator].contribution = web3.utils.toWei(0, "ether");
        expectedBalances[buyer1].contribution = web3.utils.toWei(0, "ether");
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(5, "ether"));

        expect(await TestToken.methods.balanceOf(creator).call())
        .to.equal("980");
        expect(await TestToken.methods.balanceOf(buyer1).call())
        .to.equal("20");
    });

    it("transferMyTokens() fails on blacklisted sender", async () => {
        await util.sendTransactionWithGas(
            web3,
            {
                from: buyer1,
                to: PresalePool.options.address,
                value: web3.utils.toWei(5, "ether")
            }
        );
        await util.sendTransactionWithGas(
            web3,
            {
                from: blacklistedBuyer,
                to: PresalePool.options.address,
                value: web3.utils.toWei(5, "ether")
            }
        );

        await util.methodWithGas(PresalePool.methods.close(), creator)
        await util.methodWithGas(PresalePool.methods.payToPresale(payoutAddress), creator);

        let expectedBalances = {}
        expectedBalances[buyer1] = {
            remaining: web3.utils.toWei(0, "ether"),
            contribution: web3.utils.toWei(5, "ether")
        }
        expectedBalances[blacklistedBuyer] = {
            remaining: web3.utils.toWei(0, "ether"),
            contribution: web3.utils.toWei(5, "ether")
        }
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(0, "ether"));

        await util.methodWithGas(
            TestToken.methods.transfer(
                PresalePool.options.address, 60
            ),
            creator
        );
        expect(await TestToken.methods.balanceOf(creator).call())
        .to.equal("940");

        // doesn't get anything because buyer2 is not in the pool
        await util.methodWithGas(PresalePool.methods.transferMyTokens(), buyer2);
        await util.methodWithGas(PresalePool.methods.transferMyTokens(), buyer1);
        expectedBalances[buyer1].contribution = web3.utils.toWei(0, "ether");
        await util.expectVMException(
            util.methodWithGas(PresalePool.methods.transferMyTokens(), blacklistedBuyer)
        );
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(0, "ether"));

        expect(await TestToken.methods.balanceOf(PresalePool.options.address).call())
        .to.equal("30");
        expect(await TestToken.methods.balanceOf(buyer1).call())
        .to.equal("30");
        expect(await TestToken.methods.balanceOf(buyer2).call())
        .to.equal("0");
        expect(await TestToken.methods.balanceOf(blacklistedBuyer).call())
        .to.equal("0");
    });

    it("transferAllTokens() fails on blacklisted sender", async () => {
        await util.sendTransactionWithGas(
            web3,
            {
                from: buyer1,
                to: PresalePool.options.address,
                value: web3.utils.toWei(5, "ether")
            }
        );
        await util.sendTransactionWithGas(
            web3,
            {
                from: blacklistedBuyer,
                to: PresalePool.options.address,
                value: web3.utils.toWei(5, "ether")
            }
        );

        await util.methodWithGas(PresalePool.methods.close(), creator)
        await util.methodWithGas(PresalePool.methods.payToPresale(payoutAddress), creator);

        let expectedBalances = {}
        expectedBalances[buyer1] = {
            remaining: web3.utils.toWei(0, "ether"),
            contribution: web3.utils.toWei(5, "ether")
        }
        expectedBalances[blacklistedBuyer] = {
            remaining: web3.utils.toWei(0, "ether"),
            contribution: web3.utils.toWei(5, "ether")
        }
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(0, "ether"));

        await util.methodWithGas(
            TestToken.methods.transfer(
                PresalePool.options.address, 60
            ),
            creator
        );
        expect(await TestToken.methods.balanceOf(creator).call())
        .to.equal("940");

        await util.methodWithGas(PresalePool.methods.transferAllTokens(), creator);
        let failedOn = await PresalePool.methods.failures(0).call();
        expect(failedOn.toLowerCase()).to.equal(blacklistedBuyer)
        expectedBalances[buyer1].contribution = web3.utils.toWei(0, "ether");
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(0, "ether"));

        // buyer1 already claimed tokens so this doesn't do anythin
        await util.methodWithGas(PresalePool.methods.transferMyTokens(), buyer1);
        // doesn't get anything because buyer2 is not in the pool
        await util.methodWithGas(PresalePool.methods.transferMyTokens(), buyer2);

        expect(await TestToken.methods.balanceOf(PresalePool.options.address).call())
        .to.equal("30");
        expect(await TestToken.methods.balanceOf(buyer1).call())
        .to.equal("30");
        expect(await TestToken.methods.balanceOf(buyer2).call())
        .to.equal("0");
        expect(await TestToken.methods.balanceOf(blacklistedBuyer).call())
        .to.equal("0");
    });
});

