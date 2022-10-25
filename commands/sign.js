// command-route for signing with dids

const didJwt = require('did-jwt');
const crypto = require('crypto');
const sdk = require('algosdk');


const commandHelp = require('../help/command-help');
const validateFilename = require('../tools/validation').validateFilename;
const decryptWallet = require('../tools/cryptography/wallet-security').decryptWallet;
const loadWalletJson = require('../tools/wallet-storage').loadWalletJson;



// implements the "sign" command
const sign = function sign(command, args) {
    
    // command arguments validation
    if(args.length == 0) {
        commandHelp("You have to provide the name of the AlgoDID identity to sign with.", command);
        process.exit(1);
    } else if(args.length == 1) {
        commandHelp("You have to provide a binary string to sign.", command);
        process.exit(1);
    } else if(args.length > 2) {
        commandHelp("Too many arguments.", command);
        process.exit(1);
    }


    // getting the wallet's name
    const walletName = args[0];
    const binData = new TextEncoder().encode(args[1]);
    if(!validateFilename(walletName)) {
        console.error("Invalid file name.");
        process.exit(1);
    }

    // getting the encrypted wallet as a JSON object
    let encWallet = loadWalletJson(walletName);

    // retrieving the account data associated with the wallet
    const account = decryptWallet(encWallet);
    const key = Buffer.from(account.pk, 'base64');

    // signing the input bytes
    const signature = sdk.signBytes(binData, key);

    // output the signature to the console
    console.log("\nSignature created successfully.\nPrinting a base64-encoded dump of the signature...\n");
    console.log(Buffer.from(signature).toString('base64'));
}



function getSigner(key, keyType) {
    if(keyType == 'EdDSA') return EdDSASigner(key);
    else if(keyType == 'ES256K') return ES256KSigner(key);
    else return null;
}

/*
const did = (JSON.parse(data));
const issuer = did.document.id;
const keyDesc = did.document.verificationMethod[0].type;
const pk = did.document.verificationMethod[0].private;
const buffer = Buffer.from(pk, 'base64');
const hexKey = buffer.toString('hex');
const key = hexToByteArr(hexKey);
const alg = returnKeyType(keyDesc);
const signer = getSigner(key, alg);

const jwt = await createJWT(
    {string: "hello"},
    {issuer: issuer, signer},
    {alg: alg});

console.log(decodeJWT(jwt));
console.log(jwt);
*/

module.exports = sign;