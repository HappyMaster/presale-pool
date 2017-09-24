const chai = require('chai');

const server = require('./server');
const util = require('./util');

const expect = chai.expect;

describe('refundPresale', () => {
    let defaultPoolArgs = [0, 0, 0, []];
    let creator;
    let buyer1;
    let buyer2;
    let payoutAddress;
    let web3;

    before(async () => {
        let result = await server.setUp();
        web3 = result.web3;
        creator = result.addresses[0].toLowerCase();
        buyer1 = result.addresses[1].toLowerCase();
        buyer2 = result.addresses[2].toLowerCase();
        payoutAddress = result.addresses[3].toLowerCase();
    });


    after(() => {
        server.tearDown();
    });

    let PresalePool;
    beforeEach(async () => {
        PresalePool = await util.deployContract(web3, "PresalePool", creator, defaultPoolArgs);
    });

    async function payToPresale(expectedPayout) {
        let beforeBalance = await web3.eth.getBalance(payoutAddress);

        await util.methodWithGas(PresalePool.methods.payToPresale(payoutAddress), creator);

        let afterBalance = await web3.eth.getBalance(payoutAddress);
        let difference = parseInt(afterBalance) - parseInt(beforeBalance);
        expect(difference / expectedPayout).to.be.within(.98, 1.0);
    }

    async function assertRefund(participant, expectedGain) {
        let balance = await web3.eth.getBalance(participant);
        await util.methodWithGas(PresalePool.methods.withdrawAll(), participant);
        let balanceAfterRefund = await web3.eth.getBalance(participant);
        let difference = parseInt(balanceAfterRefund) - parseInt(balance);
        expect(difference / expectedGain).to.be.within(.98, 1.0);
    }

    it("cant be called from open state", async () => {
        await util.expectVMException(
            util.methodWithGas(PresalePool.methods.refundPresale(), creator)
        );
    });

    it("cant be called from failed state", async () => {
        await util.methodWithGas(PresalePool.methods.fail(), creator);

        await util.expectVMException(
            util.methodWithGas(PresalePool.methods.refundPresale(), creator)
        );
    });

    it("cant be called from closed state", async () => {
        await util.methodWithGas(PresalePool.methods.close(), creator);
        await util.expectVMException(
            util.methodWithGas(PresalePool.methods.refundPresale(), creator)
        );
    });

    it("can be called by presale address", async () => {
        await util.methodWithGas(PresalePool.methods.close(), creator);
        await util.methodWithGas(PresalePool.methods.payToPresale(payoutAddress), creator);
        await util.methodWithGas(PresalePool.methods.refundPresale(), payoutAddress);
        // state should be failed
        expect(await PresalePool.methods.state().call()).to.be.equal('1');
    });

    it("can be called by admin", async () => {
        await util.methodWithGas(PresalePool.methods.close(), creator);
        await util.methodWithGas(PresalePool.methods.payToPresale(payoutAddress), creator);
        await util.methodWithGas(PresalePool.methods.refundPresale(), creator);
        // state should be failed
        expect(await PresalePool.methods.state().call()).to.be.equal('1');
    });

    it("only accepts transactions with a minimum of poolTotal wei", async () => {
        await util.sendTransactionWithGas(
            web3,
            {
                from: creator,
                to: PresalePool.options.address,
                value: web3.utils.toWei(2, "ether")
            }
        );
        await util.methodWithGas(PresalePool.methods.close(), creator);
        await util.methodWithGas(PresalePool.methods.payToPresale(payoutAddress), creator);
        await util.expectVMException(
            util.methodWithGas(PresalePool.methods.refundPresale(), payoutAddress)
        );
        await util.expectVMException(
            util.methodWithGas(
                PresalePool.methods.refundPresale(),
                payoutAddress,
                web3.utils.toWei(1, "ether")
            )
        );
        await util.methodWithGas(
            PresalePool.methods.refundPresale(),
            payoutAddress,
            web3.utils.toWei(2, "ether")
        );
        // state should be failed
        expect(await PresalePool.methods.state().call()).to.be.equal('1');
    });

    it("cant be called after tokens have already been redeemed", async () => {
        await util.sendTransactionWithGas(
            web3,
            {
                from: creator,
                to: PresalePool.options.address,
                value: web3.utils.toWei(2, "ether")
            }
        );

        await util.methodWithGas(PresalePool.methods.close(), creator);
        await util.methodWithGas(PresalePool.methods.payToPresale(payoutAddress), creator);

        let TestToken = await util.deployContract(web3, "TestToken", creator, [payoutAddress]);
        await util.methodWithGas(PresalePool.methods.setToken(TestToken.options.address), creator);
        await util.methodWithGas(
            TestToken.methods.transfer(
                PresalePool.options.address, 60
            ),
            creator
        );

        await util.methodWithGas(PresalePool.methods.transferMyTokens(), creator);
        await util.expectVMException(
            util.methodWithGas(
                PresalePool.methods.refundPresale(),
                payoutAddress,
                web3.utils.toWei(2, "ether")
            )
        );
    });

    it("allows full refunds", async () => {
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
            PresalePool.methods.refundPresale(),
            payoutAddress,
            web3.utils.toWei(101, "ether")
        );

        await assertRefund(creator, web3.utils.toWei(68, "ether"))
        await assertRefund(buyer1, web3.utils.toWei(38, "ether"))
        await assertRefund(buyer2, web3.utils.toWei(1, "ether"))
    });
});

