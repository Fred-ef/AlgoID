// command-route for did creation

const sdk = require('algosdk');

const createDid = require('../tools/create_did');

const bytesToHex = function (byteArray) {
    return Array.from(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}

// implements the "create" command
const create = function(args, command) {

    // command option validation
    if(args.length == 0) {
        commandHelp("Too few arguments", command);
        process.exit(1);
    }

    // Algorand address validation
    const addr = args[0];
    if(!sdk.isValidAddress(addr)) {
        commandHelp("Invalid Algorand address", command);
        process.exit(1);
    }

    let did = createDid(addr);

    console.log(did);
}


module.exports = create;