const fs = require("fs");
const chai = require('chai');
const solc = require('solc')

const expect = chai.expect;

async function deployContract(web3, contractName, creatorAddress, contractArgs, initialBalance) {
    let source = fs.readFileSync(`./contracts/${contractName}.sol`, 'utf8');
    let compiledContract = solc.compile(
        source, 1
    ).contracts[`:${contractName}`];
    let abi = compiledContract.interface;
    let bytecode = compiledContract.bytecode;
    let Contract = new web3.eth.Contract(JSON.parse(abi));
    let deploy = Contract.deploy({ data: bytecode, arguments: contractArgs });
    let gasEstimate = await deploy.estimateGas({ from: creatorAddress });

    let sendOptions = {
        from: creatorAddress,
        gas: 2*gasEstimate,
    };
    if (initialBalance) {
        sendOptions.value = initialBalance;
    }

    return deploy.send(sendOptions);
}

function expectVMException(prom) {
    return new Promise(
        function (resolve, reject) {
            prom.catch((e) => {
                expect(e.message).to.include("invalid opcode")
                resolve(e);
            });
        }
    );
}

async function sendTransactionWithGas(web3, txn) {
    txn.gas = 1000000;
    return await web3.eth.sendTransaction(txn);
}
async function methodWithGas(method, from, value) {
    let txn = { from: from, gas: 1000000 };
    if (value) {
        txn.value = value;
    }
    return await method.send(txn);
}

async function getBalances(PresalePool) {
    let participantBalances = await PresalePool.methods.getParticipantBalances().call();
    let addresses = participantBalances[0];
    let contribution = participantBalances[1];
    let remaining = participantBalances[2];
    let whitelisted = participantBalances[3];
    let exists = participantBalances[4];

    expect(addresses.length)
    .to.equal(contribution.length)
    .to.equal(remaining.length)
    .to.equal(whitelisted.length)
    .to.equal(exists.length);

    let balances = {};
    contribution.forEach((val, i) => {
        balances[addresses[i].toLowerCase()] = {
            contribution: contribution[i],
            remaining: remaining[i],
            whitelisted: whitelisted[i],
            exists: exists[i]
        };
    });
    return balances;
}

async function verifyState(web3, PresalePool, expectedBalances, expectedPoolBalance) {
    let balances = await getBalances(PresalePool);

    let totalContribution = 0;
    Object.values(balances).forEach((value) => {
        totalContribution += parseInt(value.contribution);
    });

    for (let [address, balance] of Object.entries(expectedBalances)) {
        expect(balances[address]).to.include(balance);
    }

    let poolBalance = await web3.eth.getBalance(
        PresalePool.options.address
    );
    expect(poolBalance).to.equal(expectedPoolBalance);

    expect(parseInt(await PresalePool.methods.poolTotal().call())).to.equal(totalContribution);
}

module.exports = {
    deployContract: deployContract,
    expectVMException: expectVMException,
    sendTransactionWithGas: sendTransactionWithGas,
    methodWithGas: methodWithGas,
    getBalances: getBalances,
    verifyState: verifyState,
}