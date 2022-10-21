const sdk = require('algosdk');

// implements the "create" command
const create = function(args, command) {
    if(args.length == 0) {
        commandHelp("Too few arguments", command);
        process.exit(1);
    }

    const addr = args[0];
    if(!sdk.isValidAddress(addr)) {
        commandHelp("Invalid Algorand address", command);
        process.exit(1);
    }

    console.log(sdk.decodeAddress(addr));
}

module.exports = create;