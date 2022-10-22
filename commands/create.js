// command-route for did creation

const sdk = require('algosdk');
const createDid = require('../tools/create_did');
const commandHelp = require('../help/command-help');

// implements the "create" command
const create = function(args, command) {

    // command option validation
    if(args.length == 0) {
        commandHelp("Too few arguments", command);
        process.exit(1);
    }

    // getting did's name
    const name = args[0];

    // generating a new Algorand address
    const account = sdk.generateAccount();
    const addr = account.addr;

    let did = createDid(addr);

    console.log("DID name: "+name);
    console.log("DID content:");
    console.log(did);
}


module.exports = create;