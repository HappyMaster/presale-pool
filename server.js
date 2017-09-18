const Koa = require('koa');
const app = new Koa();

const Router = require('koa-router');
const router = new Router();

const bodyParser = require('koa-bodyparser');

const render = require('koa-ejs');

const path = require('path');
const fs = require("fs");

const solc = require('solc')

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/"));

let compiledContract = solc.compile(
    fs.readFileSync(`./contracts/PresalePool.sol`, 'utf8'), 1
).contracts[`:PresalePool`];
let contractABI = JSON.parse(compiledContract.interface);
let PresalePool = new web3.eth.Contract(contractABI);

console.log("finished compiling");

function isFloat(value) {
    if (/^(\-|\+)?([0-9]+(\.[0-9]+)?)$/
      .test(value))
      return true;
  return false;
}

function valueOr(value, defaultValue) {
    return value ? value : defaultValue;
}

function toArray(value) {
    if (!value) {
        return [];
    }

    return value
    .split(/\r?\n/)
    .map((str) => str.replace(/^\s+|\s+$/g, ''))
    .filter((str) => str.length > 0 );
}

async function deployContract(contractName, myAddress, contractArgs, initialBalance) {
    initialBalance = valueOr(initialBalance, 0);
    let bytecode = "0x"+compiledContract.bytecode;
    let deploy = PresalePool.deploy({ data: bytecode, arguments: contractArgs });

    return {
        value: initialBalance,
        bytecode: deploy.encodeABI(),
        gas: await deploy.estimateGas({
            from: myAddress,
            value: web3.utils.toWei(initialBalance, "ether"),
        }),
        abi: contractABI
    };
}

async function method(methodName, contractAddress, myAddress, args) {
    PresalePool.options.address = contractAddress;
    let m = PresalePool.methods[methodName](...args);

    return {
        toAddress: contractAddress,
        value: 0,
        bytecode: m.encodeABI(),
        gas: await m.estimateGas({ from: myAddress })
    }
}

app.use(bodyParser());

render(app, {
    root: path.join(__dirname, 'view'),
    layout: false,
    viewExt: 'html',
    cache: false,
    debug: true
});

router.get('/deploy', async (ctx, next) => {
    await ctx.render('deploy');
});
router.post('/deploy', async (ctx, next) => {
    let address = ctx.request.body.address;
    let value = ctx.request.body.value;

    if (!address) {
        ctx.status = 400;
        ctx.body = "missing address";
        return;
    }

    for (let argName of ["minContribution", "maxContribution", "maxPoolTotal", "value"]) {
        let argValue = ctx.request.body[argName];
        if (argValue && !isFloat(argValue)) {
            ctx.status = 400;
            ctx.body = argName + " is not a number";
            return;
        }
    }

    let whitelist = toArray(ctx.request.body.whitelist);

    contractArgs = [];
    contractArgs.push(web3.utils.toWei(valueOr(ctx.request.body.minContribution, 0), "ether"));
    contractArgs.push(web3.utils.toWei(valueOr(ctx.request.body.maxContribution, 0), "ether"));
    contractArgs.push(web3.utils.toWei(valueOr(ctx.request.body.maxPoolTotal, 0), "ether"));
    contractArgs.push(whitelist.length == 0);
    contractArgs.push(whitelist);

    await ctx.render('deployResult',
        await deployContract("PresalePool", address, contractArgs, value)
    );
});

async function transtionRequestHandler(methodName, ctx) {
    let myAddress = ctx.request.body.myAddress;
    let contractAddress = ctx.request.body.contractAddress;

    if (!myAddress) {
        ctx.status = 400;
        ctx.body = "missing myAddress";
        return;
    }
    if (!contractAddress) {
        ctx.status = 400;
        ctx.body = "missing contractAddress";
        return;
    }

    await ctx.render('result',
        await method(methodName, contractAddress, myAddress, [])
    );
}

router.get('/close', async (ctx, next) => {
    await ctx.render('form', {
        method: "close",
        arguments: []
    });
});
router.post('/close', async (ctx, next) => {
    await transtionRequestHandler("close", ctx);
});

router.get('/open', async (ctx, next) => {
    await ctx.render('form', {
        method: "open",
        arguments: []
    });
});
router.post('/open', async (ctx, next) => {
    await transtionRequestHandler("open", ctx);
});

router.get('/fail', async (ctx, next) => {
    await ctx.render('form', {
        method: "fail",
        arguments: []
    });
});
router.post('/fail', async (ctx, next) => {
    await transtionRequestHandler("fail", ctx);
});


router.get('/send', async (ctx, next) => {
    await ctx.render('form', {
        method: "send",
        arguments: [{
            name: "value",
            description: "Amount in eth to send to presale pool",
            type: "number"
        }]
    });
});
router.post('/send', async (ctx, next) => {
    let myAddress = ctx.request.body.myAddress;
    let value = ctx.request.body.value;
    let contractAddress = ctx.request.body.contractAddress;

    if (!myAddress) {
        ctx.status = 400;
        ctx.body = "missing myAddress";
        return;
    }
    if (value && !isFloat(value)) {
        ctx.status = 400;
        ctx.body = "value is not a number";
        return;
    }
    if (!contractAddress) {
        ctx.status = 400;
        ctx.body = "missing contractAddress";
        return;
    }

    await ctx.render('result', {
        toAddress: contractAddress,
        bytecode: "",
        value: value,
        gas: await web3.eth.estimateGas({
            to: contractAddress,
            from: myAddress,
            value: web3.utils.toWei(value, "ether")
        })
    });
});

router.get('/setToken', async (ctx, next) => {
    await ctx.render('form', {
        method: "setToken",
        arguments: [{
            name: "tokenAddress",
            description: "ERC20 token contract address",
            type: "text"
        }]
    });
});
router.post('/setToken', async (ctx, next) => {
    let contractAddress = ctx.request.body.contractAddress;
    let tokenAddress = ctx.request.body.contractAddress;
    let myAddress = ctx.request.body.myAddress;

    if (!myAddress) {
        ctx.status = 400;
        ctx.body = "missing myAddress";
        return;
    }
    if (!tokenAddress) {
        ctx.status = 400;
        ctx.body = "missing tokenAddress";
        return;
    }
    if (!contractAddress) {
        ctx.status = 400;
        ctx.body = "missing contractAddress";
        return;
    }

    await ctx.render('result',
        await method("setToken", contractAddress, myAddress, [tokenAddress])
    );
});

router.get('/payout', async (ctx, next) => {
    await ctx.render('form', {
        method: "payout",
        arguments: [{
            name: "presaleAddress",
            description: "Pressale address",
            type: "text"
        }]
    });
});
router.post('/payout', async (ctx, next) => {
    let presaleAddress = ctx.request.body.presaleAddress;
    let contractAddress = ctx.request.body.contractAddress;
    let myAddress = ctx.request.body.myAddress;

    if (!myAddress) {
        ctx.status = 400;
        ctx.body = "missing myAddress";
        return;
    }
    if (!presaleAddress) {
        ctx.status = 400;
        ctx.body = "missing presaleAddress";
        return;
    }
    if (!contractAddress) {
        ctx.status = 400;
        ctx.body = "missing contractAddress";
        return;
    }

    await ctx.render('result',
        await method("payToPresale", contractAddress, myAddress, [presaleAddress])
    );
});

router.get('/withdraw', async (ctx, next) => {
    await ctx.render('form', {
        method: "withdraw",
        arguments: [{
            name: "amount",
            description: "Amount in eth to withdraw from your contribution",
            type: "number"
        }]
    });
});
router.post('/withdraw', async (ctx, next) => {
    let amount = ctx.request.body.amount;
    let contractAddress = ctx.request.body.contractAddress;
    let myAddress = ctx.request.body.myAddress;

    if (!myAddress) {
        ctx.status = 400;
        ctx.body = "missing myAddress";
        return;
    }
    if (amount && !isFloat(amount)) {
        ctx.status = 400;
        ctx.body = "amount is not a number";
        return;
    }
    if (!contractAddress) {
        ctx.status = 400;
        ctx.body = "missing contractAddress";
        return;
    }

    await ctx.render('result',
        await method("withdraw", contractAddress, myAddress, [web3.utils.toWei(amount, "ether")])
    );
});

router.get('/withdrawAll', async (ctx, next) => {
    await ctx.render('form', {
        method: "withdrawAll",
        arguments: []
    });
});
router.post('/withdrawAll', async (ctx, next) => {
    let contractAddress = ctx.request.body.contractAddress;
    let myAddress = ctx.request.body.myAddress;

    if (!myAddress) {
        ctx.status = 400;
        ctx.body = "missing myAddress";
        return;
    }
    if (!contractAddress) {
        ctx.status = 400;
        ctx.body = "missing contractAddress";
        return;
    }

    await ctx.render('result',
        await method("withdrawAll", contractAddress, myAddress, [])
    );
});

router.get('/transferMyTokens', async (ctx, next) => {
    await ctx.render('form', {
        method: "transferMyTokens",
        arguments: []
    });
});
router.post('/transferMyTokens', async (ctx, next) => {
    let contractAddress = ctx.request.body.contractAddress;
    let myAddress = ctx.request.body.myAddress;

    if (!myAddress) {
        ctx.status = 400;
        ctx.body = "missing myAddress";
        return;
    }
    if (!contractAddress) {
        ctx.status = 400;
        ctx.body = "missing contractAddress";
        return;
    }

    await ctx.render('result',
        await method("transferMyTokens", contractAddress, myAddress, [])
    );
});

router.get('/transferAllTokens', async (ctx, next) => {
    await ctx.render('form', {
        method: "transferAllTokens",
        arguments: []
    });
});
router.post('/transferAllTokens', async (ctx, next) => {
    let contractAddress = ctx.request.body.contractAddress;
    let myAddress = ctx.request.body.myAddress;

    if (!myAddress) {
        ctx.status = 400;
        ctx.body = "missing myAddress";
        return;
    }
    if (!contractAddress) {
        ctx.status = 400;
        ctx.body = "missing contractAddress";
        return;
    }

    await ctx.render('result',
        await method("transferAllTokens", contractAddress, myAddress, [])
    );
});

router.get('/removeWhitelist', async (ctx, next) => {
    await ctx.render('form', {
        method: "transferAllTokens",
        arguments: []
    });
});
router.post('/removeWhitelist', async (ctx, next) => {
    let contractAddress = ctx.request.body.contractAddress;
    let myAddress = ctx.request.body.myAddress;

    if (!myAddress) {
        ctx.status = 400;
        ctx.body = "missing myAddress";
        return;
    }
    if (!contractAddress) {
        ctx.status = 400;
        ctx.body = "missing contractAddress";
        return;
    }

    await ctx.render('result',
        await method("removeWhitelist", contractAddress, myAddress, [])
    );
});


router.get('/setContributionSettings', async (ctx, next) => {
    await ctx.render('form', {
        method: "setContributionSettings",
        arguments: [
            {
                name: "minContribution",
                description: "Minimum individual contribution in eth",
                type: "number"
            },
            {
                name: "maxContribution",
                description: "Maximum individual contribution in eth",
                type: "number"
            },
            {
                name: "maxPoolTotal",
                description: "Maximum total pool contribution in eth",
                type: "number"
            },
        ]
    });
});
router.post('/setContributionSettings', async (ctx, next) => {
    let contractAddress = ctx.request.body.contractAddress;
    let myAddress = ctx.request.body.myAddress;

    if (!myAddress) {
        ctx.status = 400;
        ctx.body = "missing myAddress";
        return;
    }

    for (let argName of ["minContribution", "maxContribution", "maxPoolTotal"]) {
        let argValue = ctx.request.body[argName];
        if (argValue && !isFloat(argValue)) {
            ctx.status = 400;
            ctx.body = argName + " is not a number";
            return;
        }
    }

    if (!contractAddress) {
        ctx.status = 400;
        ctx.body = "missing contractAddress";
        return;
    }

    let contractArgs = [];
    contractArgs.push(web3.utils.toWei(valueOr(ctx.request.body.minContribution, 0), "ether"));
    contractArgs.push(web3.utils.toWei(valueOr(ctx.request.body.maxContribution, 0), "ether"));
    contractArgs.push(web3.utils.toWei(valueOr(ctx.request.body.maxPoolTotal, 0), "ether"));

    await ctx.render('result',
        await method(
            "setContributionSettings", contractAddress, myAddress, contractArgs
        )
    );
});

router.get('/modifyWhitelist', async (ctx, next) => {
    await ctx.render('modifyWhitelist');
});
router.post('/modifyWhitelist', async (ctx, next) => {
    let contractAddress = ctx.request.body.contractAddress;
    let myAddress = ctx.request.body.myAddress;

    if (!myAddress) {
        ctx.status = 400;
        ctx.body = "missing myAddress";
        return;
    }
    if (!contractAddress) {
        ctx.status = 400;
        ctx.body = "missing contractAddress";
        return;
    }

    await ctx.render('result',
        await method("modifyWhitelist", contractAddress, myAddress, [
            toArray(ctx.request.body.toInclude),
            toArray(ctx.request.body.toExclude),
        ])
    );
});


router.get('/balances', async (ctx, next) => {
    await ctx.render('form', {
        method: "balances",
        arguments: []
    });
});
router.post('/balances', async (ctx, next) => {
    let contractAddress = ctx.request.body.contractAddress;
    let myAddress = ctx.request.body.myAddress;

    if (!myAddress) {
        ctx.status = 400;
        ctx.body = "missing myAddress";
        return;
    }
    if (!contractAddress) {
        ctx.status = 400;
        ctx.body = "missing contractAddress";
        return;
    }

    PresalePool.options.address = contractAddress;
    let participantBalances = await PresalePool.methods.getParticipantBalances().call();
    let addresses = participantBalances[0];
    let contribution = participantBalances[1];
    let remaining = participantBalances[2];
    let whitelisted = participantBalances[3];

    let balances = addresses.map((address, i) => {
        return {
            address: address,
            contribution: web3.utils.fromWei(contribution[i], "ether"),
            remaining: web3.utils.fromWei(remaining[i], "ether"),
            whitelisted: whitelisted[i]
        };
    });

    await ctx.render('balances', {balances: balances});
});

router.get('/', async (ctx, next) => {
    await ctx.render('index');
});

app.use(router.routes());

app.listen(process.env.PORT || 5000);