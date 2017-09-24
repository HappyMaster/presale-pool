const chai = require('chai');

const server = require('./server');
const util = require('./util');

const expect = chai.expect;

describe('whitelist', () => {
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

    it('can be modified', async () => {
        let PresalePool = await util.deployContract(
            web3, "PresalePool", creator, defaultPoolArgs
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

        let expectedBalances = {}
        expectedBalances[buyer1] = {
            remaining: web3.utils.toWei(0, "ether"),
            contribution: web3.utils.toWei(5, "ether"),
        }
        expectedBalances[buyer2] = {
            remaining: web3.utils.toWei(0, "ether"),
            contribution: web3.utils.toWei(1, "ether"),
        }
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(6, "ether"));

        // can only be modified by creator
        await util.expectVMException(
            util.methodWithGas(
                PresalePool.methods.modifyWhitelist([buyer1], []),
                buyer1
            )
        );

        await util.methodWithGas(
            PresalePool.methods.modifyWhitelist([buyer1], []),
            creator
        );
        expectedBalances[buyer2].whitelisted = false
        expectedBalances[buyer2].contribution = web3.utils.toWei(0, "ether")
        expectedBalances[buyer2].remaining = web3.utils.toWei(1, "ether")
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(6, "ether"));

        await util.sendTransactionWithGas(
            web3,
            {
                from: buyer1,
                to: PresalePool.options.address,
                value: web3.utils.toWei(5, "ether")
            }
        );
        await util.expectVMException(
            util.sendTransactionWithGas(
                web3,
                {
                    from: buyer2,
                    to: PresalePool.options.address,
                    value: web3.utils.toWei(1, "ether")
                }
            )
        );

        expectedBalances[buyer1].contribution = web3.utils.toWei(10, "ether");
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(11, "ether"));

        await util.methodWithGas(
            PresalePool.methods.withdrawAll(),
            buyer2
        );
        expectedBalances[buyer2].remaining = web3.utils.toWei(0, "ether")
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(10, "ether"));

        // can only be called by creator
        await util.expectVMException(
            util.methodWithGas(
                PresalePool.methods.removeWhitelist(),
                buyer1
            )
        );

        util.methodWithGas(
            PresalePool.methods.removeWhitelist(),
            creator
        );
        await util.sendTransactionWithGas(
            web3,
            {
                from: buyer2,
                to: PresalePool.options.address,
                value: web3.utils.toWei(1, "ether")
            }
        );
        expectedBalances[buyer2].contribution = web3.utils.toWei(1, "ether")
        expectedBalances[buyer2].whitelisted = true;
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(11, "ether"));
    });
});

