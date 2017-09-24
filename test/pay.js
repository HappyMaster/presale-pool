const chai = require('chai');

const server = require('./server');
const util = require('./util');

const expect = chai.expect;

describe('pay to presale address', () => {
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

    it("cant be called from open state", async () => {
        await util.expectVMException(
            util.methodWithGas(PresalePool.methods.payToPresale(payoutAddress), creator)
        );
    });

    it("cant be called from failed state", async () => {
        await util.methodWithGas(PresalePool.methods.fail(), creator)

        await util.expectVMException(
            util.methodWithGas(PresalePool.methods.payToPresale(payoutAddress), creator)
        );
    });

    it("can only be called by creator", async () => {
        await util.methodWithGas(PresalePool.methods.close(), creator)
        await util.expectVMException(
            util.methodWithGas(PresalePool.methods.payToPresale(payoutAddress), buyer1)
        );
    });

    it("cant transition to any other states", async () => {
        await util.methodWithGas(PresalePool.methods.close(), creator)
        await util.methodWithGas(PresalePool.methods.payToPresale(payoutAddress), creator)

        await util.expectVMException(
            util.methodWithGas(PresalePool.methods.payToPresale(payoutAddress), creator)
        );
        await util.expectVMException(
            util.methodWithGas(PresalePool.methods.close(), creator)
        );
        await util.expectVMException(
            util.methodWithGas(PresalePool.methods.open(), creator)
        );
        await util.expectVMException(
            util.methodWithGas(PresalePool.methods.fail(), creator)
        );
    });

    it("does not accept deposits", async () => {
        await util.methodWithGas(PresalePool.methods.close(), creator)
        await util.expectVMException(
            util.sendTransactionWithGas(
                web3,
                {
                    from: buyer1,
                    to: PresalePool.options.address,
                    value: web3.utils.toWei(5, "ether")
                }
            )
        );
    });

    it("respects min contribution", async () => {
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
        await util.methodWithGas(PresalePool.methods.setContributionSettings(web3.utils.toWei(2, "ether"), 0, 0), creator)

        let expectedBalances = {}
        expectedBalances[buyer1] = {
            remaining: web3.utils.toWei(0, "ether"),
            contribution: web3.utils.toWei(5, "ether")
        }
        expectedBalances[buyer2] = {
            remaining: web3.utils.toWei(1, "ether"),
            contribution: web3.utils.toWei(0, "ether")
        }
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(6, "ether"));
        await payToPresale(web3.utils.toWei(5, "ether"));
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(1, "ether"));

        let buyerBalance = await web3.eth.getBalance(buyer2);
        await util.methodWithGas(PresalePool.methods.withdrawAll(), buyer2);
        expectedBalances[buyer2].remaining = web3.utils.toWei(0, "ether");
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(0, "ether"));

        let buyerBalanceAfterRefund = await web3.eth.getBalance(buyer2);
        let difference = parseInt(buyerBalanceAfterRefund) - parseInt(buyerBalance);
        expect(difference / web3.utils.toWei(1, "ether")).to.be.within(.98, 1.0);
    });

    it("respects max contribution", async () => {
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
        await util.methodWithGas(PresalePool.methods.setContributionSettings(0, web3.utils.toWei(2, "ether"), 0), creator)

        let expectedBalances = {}
        expectedBalances[buyer1] = {
            remaining: web3.utils.toWei(3, "ether"),
            contribution: web3.utils.toWei(2, "ether")
        }
        expectedBalances[buyer2] = {
            remaining: web3.utils.toWei(0, "ether"),
            contribution: web3.utils.toWei(1, "ether")
        }
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(6, "ether"));
        await payToPresale(web3.utils.toWei(3, "ether"));
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(3, "ether"));

        let buyerBalance = await web3.eth.getBalance(buyer1);
        await util.methodWithGas(PresalePool.methods.withdrawAll(), buyer1);
        expectedBalances[buyer1].remaining = web3.utils.toWei(0, "ether");
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(0, "ether"));

        let buyerBalanceAfterRefund = await web3.eth.getBalance(buyer1);
        let difference = parseInt(buyerBalanceAfterRefund) - parseInt(buyerBalance);
        expect(difference / web3.utils.toWei(3, "ether")).to.be.within(.98, 1.0);
    });

    it("respects pool max", async () => {
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
        await util.methodWithGas(PresalePool.methods.setContributionSettings(0, 0, web3.utils.toWei(2, "ether")), creator)

        let expectedBalances = {}
        expectedBalances[buyer1] = {
            remaining: web3.utils.toWei(3, "ether"),
            contribution: web3.utils.toWei(2, "ether")
        }
        expectedBalances[buyer2] = {
            remaining: web3.utils.toWei(1, "ether"),
            contribution: web3.utils.toWei(0, "ether")
        }
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(6, "ether"));
        await payToPresale(web3.utils.toWei(2, "ether"));
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(4, "ether"));

        let buyerBalance = await web3.eth.getBalance(buyer1);
        //cant do partial refunds in paid state
        await util.expectVMException(
            util.methodWithGas(
                PresalePool.methods.withdraw(web3.utils.toWei(5, "ether")),
                buyer1
            )
        );
        await util.methodWithGas(
            PresalePool.methods.withdrawAll(),
            buyer1
        );
        expectedBalances[buyer1].remaining = web3.utils.toWei(0, "ether");
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(1, "ether"));

        let buyerBalanceAfterRefund = await web3.eth.getBalance(buyer1);
        let difference = parseInt(buyerBalanceAfterRefund) - parseInt(buyerBalance);
        expect(difference / web3.utils.toWei(3, "ether")).to.be.within(.97, 1.0);
    });

    it("respects contribution settings", async () => {
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
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(8, "ether"));
        await payToPresale(web3.utils.toWei(3, "ether"));
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(5, "ether"));

        let buyerBalance = await web3.eth.getBalance(buyer1);
        await util.methodWithGas(PresalePool.methods.withdrawAll(), buyer1);
        expectedBalances[buyer1].remaining = web3.utils.toWei(0, "ether");
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(1, "ether"));

        let buyerBalanceAfterRefund = await web3.eth.getBalance(buyer1);
        let difference = parseInt(buyerBalanceAfterRefund) - parseInt(buyerBalance);
        expect(difference / web3.utils.toWei(4, "ether")).to.be.within(.98, 1.0);
    });

    it("respects whitelist", async () => {
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
        await util.methodWithGas(PresalePool.methods.modifyWhitelist([buyer1], []), creator)

        let expectedBalances = {}
        expectedBalances[buyer1] = {
            remaining: web3.utils.toWei(0, "ether"),
            contribution: web3.utils.toWei(5, "ether")
        }
        expectedBalances[buyer2] = {
            remaining: web3.utils.toWei(1, "ether"),
            contribution: web3.utils.toWei(0, "ether")
        }
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(6, "ether"));
        await payToPresale(web3.utils.toWei(5, "ether"));
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(1, "ether"));

        let buyerBalance = await web3.eth.getBalance(buyer2);
        await util.methodWithGas(PresalePool.methods.withdrawAll(), buyer2);
        expectedBalances[buyer2].remaining = web3.utils.toWei(0, "ether");
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(0, "ether"));

        let buyerBalanceAfterRefund = await web3.eth.getBalance(buyer2);
        let difference = parseInt(buyerBalanceAfterRefund) - parseInt(buyerBalance);
        expect(difference / web3.utils.toWei(1, "ether")).to.be.within(.98, 1.0);
    });
});

