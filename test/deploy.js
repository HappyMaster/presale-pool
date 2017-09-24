const chai = require('chai');

const server = require('./server');
const util = require('./util');

const expect = chai.expect;

describe('deploy', () => {
    let defaultPoolArgs = [0, 0, 0, []];
    let creator;
    let addresses;
    let web3;

    before(async () => {
        let result = await server.setUp();
        web3 = result.web3;
        creator = result.addresses[0].toLowerCase();
        addresses = result.addresses;
    });

    after(() => {
        server.tearDown();
    });

    it('can be deployed with multiple admins', async () => {
        let admins = [addresses[1].toLowerCase(), addresses[2].toLowerCase()]
        let nonAdmin = addresses[3].toLowerCase();
        let PresalePool = await util.deployContract(web3, "PresalePool", creator, [0, 0, 0, admins]);
        let poolBalance = await web3.eth.getBalance(
            PresalePool.options.address
        );

        await util.methodWithGas(PresalePool.methods.close(), creator);
        await util.methodWithGas(PresalePool.methods.open(), admins[0]);
        await util.methodWithGas(PresalePool.methods.close(), admins[1]);

        await util.expectVMException(
            util.methodWithGas(PresalePool.methods.open(), nonAdmin)
        );
    });

    it('can be deployed without balance', async () => {
        let PresalePool = await util.deployContract(web3, "PresalePool", creator, defaultPoolArgs);
        let poolBalance = await web3.eth.getBalance(
            PresalePool.options.address
        );
        expect(poolBalance).to.equal(web3.utils.toWei(0, "ether"));
        expect(await util.getBalances(PresalePool)).to.deep.equal({});
    });

    it('can be deployed with balance', async () => {
        let PresalePool = await util.deployContract(
            web3, "PresalePool", creator, defaultPoolArgs, web3.utils.toWei(5, "ether")
        );

        let expectedBalances = {}
        expectedBalances[creator] = {
            remaining: web3.utils.toWei(0, "ether"),
            contribution: web3.utils.toWei(5, "ether")
        }
        await util.verifyState(web3, PresalePool, expectedBalances, web3.utils.toWei(5, "ether"));
    });
});

