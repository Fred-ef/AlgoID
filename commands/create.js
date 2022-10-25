// command-route for did creation

const sdk = require('algosdk');
const readLine = require('readline-sync');
const crypto = require('crypto');
const homedir = require('os').homedir();
const fs = require('fs');
const generateDid = require('../tools/generate_did');
const commandHelp = require('../help/command-help');

const aesEncrypt = require('../tools/security').aesEncrypt;
const aesDecrypt = require('../tools/security').aesDecrypt;
const hashSha256 = require('../tools/security').hashSha256;



// implements the "create" command
const create = function(args, command) {

    // ########## ACCOUNT GENERATION ##########

    // command option validation
    if(args.length == 0) {
        commandHelp("You have to provide a name to link to the new identity", command);
        process.exit(1);
    } else if(args.length > 1) {
        commandHelp("Too many arguments", command);
    }

    // getting did's name
    const name = args[0];

    // generating a new Algorand address
    const account = sdk.generateAccount();
    const addr = account.addr;
    const pk = account.sk;


    // ########## ACCOUNT ENCRYPTION ##########

    // generating the AES 128bit key and IV to encrypt the account's sensible data
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    // creating an encrypted object associated with the generated account
    const accountObject = JSON.stringify({
        address: addr,
        pk: pk.toString('base64')
    });
    const encAccount = aesEncrypt(accountObject, aesKey, iv);


    // ########## PASSPHRASE CREATION ##########

    // prompting the user to enter a passphrase
    console.log('\nAlgoDID identities require a passphrase for security reasons.\nYou will need it to access the created identity.\n');
    let passphrase = readLine.question('Please insert a passphrase.\n');

    // creating a new key generated from the passphrase to encrypt the (account, key, iv) triple
    const salt = crypto.randomBytes(16).toString('base64');
    const passphraseHash = crypto.pbkdf2Sync(passphrase, salt, 100000, 64, 'sha512');
    const walletKey = passphraseHash.subarray(0, 32);
    const keyTrace = passphraseHash.subarray(32, 64);
    const walletIv = crypto.randomBytes(16);

    // creating an encrypted object associated with the encrypted account and its cryptographic material
    const walletData = JSON.stringify({
        encAccount: encAccount,
        aesKey: aesKey.toString('base64'),
        iv: iv.toString('base64')
    });
    const encWalletData = aesEncrypt(walletData, walletKey, walletIv);


    // ########## WALLET ENCRYPTION ##########

    // generating the complete encrypted wallet object
    const wallet = JSON.stringify({
        encWalletData: encWalletData,
        salt: salt.toString('base64'),
        walletIv: walletIv.toString('base64'),
        keyTrace: hashSha256(keyTrace.toString('hex')).toString('base64')
    });


    // ########## SAVING WALLET IN LOCAL STORAGE ##########

    // generating the filepath and saving the encrypted wallet file
    const dirpath = homedir+'/.algodid/wallets/';
    const filepath = name+'.wallet';
    if(!fs.existsSync(dirpath)) fs.mkdirSync(dirpath);
    fs.writeFile(dirpath+filepath, wallet, {flag: 'wx'}, (err) => {
        if(err) {
            if(err.errno == -17) console.error(name+' already exists')
        }
        console.log('New identity "'+name+'" successfully created.');
        console.log('Your new AlgoDID identifier is: '+addr);
        console.log("Use the \"list\" command to show all existing AlgoDID identities");

        let did = generateDid(addr);

        console.log('\n'+name+" created!\n");
        console.log(did);

        // TEST
        let decWallet = JSON.parse(wallet);
        let password = readLine.question('type password\n');
        let passwordHash = crypto.pbkdf2Sync(password, decWallet.salt, 100000, 64, 'sha512');
        const decKey = passwordHash.subarray(0, 32);
        const decKeyTrace = hashSha256(passwordHash.subarray(32, 64).toString('hex'));

        if(decWallet.keyTrace == decKeyTrace) {
            const decWalletData = JSON.parse(aesDecrypt(decWallet.encWalletData, decKey, Buffer.from(walletIv, 'base64')).replace("^(?:\s*)(\w+)$"))
            console.log(decWalletData);

            const decAccount = aesDecrypt(decWalletData.encAccount, new Uint8Array(Buffer.from(decWalletData.aesKey, 'base64')), Buffer.from(decWalletData.iv, 'base64'));
            console.log(decAccount);
        }
        else console.error("The passphrase provided is invalid");
    });
}


module.exports = create;