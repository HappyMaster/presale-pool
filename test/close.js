const chai = require('chai');

const server = require('./server');
const util = require('./util');

const expect = chai.expect;

describe('closed state', () => {
    let defaultPoolArgs = [0, 0, 0, []];
    let creator;
    let buyer1;
    let buyer2;
    let web3;

    before(async () => {
        let result = await server.setUp();
        web3 = result.web3;
        creator = result.addresses[0].toLowerCase();
        buyer1 = result.addresses[1].toLowerCase();
        buyer2 = result.addresses[2].toLowerCase();
    });

    after(() => {
        server.tearDown();
    });

    let PresalePool;
    beforeEach(async () => {
        PresalePool = await util.deployContract(web3, "PresalePool", creator, defaultPoolArgs);
    });

    it("can only be called by the creator", async () => {
        await util.expectVMException(
            util.methodWithGas(PresalePool.methods.close(), buyer1)
        );
    });

    it("cannot be called from a closed state", async () => {
        await util.methodWithGas(PresalePool.methods.close(), creator);
        await util.expectVMException(
            util.methodWithGas(PresalePool.methods.close(), creator)
        );
    });

    it("cannot accept perform deposits or refunds", async () => {
        await util.methodWithGas(PresalePool.methods.close(), creator);

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

        await util.expectVMException(
            PresalePool.methods.withdrawAll().send({ from: buyer1 })
        );
    });

    it("can transition back to open", async () => {
        await util.methodWithGas(PresalePool.methods.close(), creator);
        // can only be called by creator
        await util.expectVMException(
            util.methodWithGas(PresalePool.methods.open(), buyer1)
        );
        await util.methodWithGas(PresalePool.methods.open(), creator);

        await util.sendTransactionWithGas(
            web3,
            {
                from: buyer1,
                to: PresalePool.options.address,
                value: web3.utils.toWei(5, "ether")
            }
        );
        let expectedBalances = {}
        expectedBalances[buyer1] = {
            remaining: web3.utils.toWei(0, "ether"),
            contribution: web3.utils.toWei(5, "ether")
        }
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(5, "ether"));

        await PresalePool.methods.withdrawAll().send({ from: buyer1 });
        expectedBalances[buyer1].contribution = web3.utils.toWei(0, "ether")
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(0, "ether"));
    });

    it('can transition to failed state', async () => {
        await util.sendTransactionWithGas(
            web3,
            {
                from: buyer1,
                to: PresalePool.options.address,
                value: web3.utils.toWei(5, "ether")
            }
        );
        await util.methodWithGas(PresalePool.methods.close(), creator);

        // can only be performed by creator
        await util.expectVMException(
            util.methodWithGas(PresalePool.methods.fail(), buyer2)
        );
        await util.methodWithGas(PresalePool.methods.fail(), creator);

        await util.expectVMException(
            util.sendTransactionWithGas(
                web3,
                {
                    from: buyer2,
                    to: PresalePool.options.address,
                    value: web3.utils.toWei(3, "ether")
                }
            )
        );

        let expectedBalances = {}
        expectedBalances[buyer1] = {
            remaining: web3.utils.toWei(0, "ether"),
            contribution: web3.utils.toWei(5, "ether")
        }
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(5, "ether"));

        await util.methodWithGas(
            PresalePool.methods.withdrawAll(),
            buyer1
        );
        expectedBalances[buyer1].contribution = web3.utils.toWei(0, "ether")
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(0, "ether"));
    });

});

