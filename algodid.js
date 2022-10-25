const homedir = require('os').homedir();
const fs = require('fs');
const create = require('./commands/create');
const commandHelp= require('./help/command-help');


// ########## PRELIMINARY SETUP ##########

// setting up working directory if it doesn't exist
const dirpath = homedir+'/.algodid/';
if(!fs.existsSync(dirpath)) fs.mkdirSync(dirpath);


// ########## GLOBAL DATA ##########

const ALLOWED_COMMANDS = ["create"];


// ########## FUN DEF ##########

const parseCommand = function() {
    // checking if a command was issued
    if(process.argv.length < 3) {
        commandHelp("Command missing");
        process.exit(1);
    }

    // copying over the cli commands
    let args = process.argv.slice(2);
    let command = args[0];

    switch (command) {
        case "create":
            create(args.slice(1), command);
            break;
        
        case "help":
        case "-h":
            commandHelp();
            break;
        default:
            commandHelp("Command \""+command+"\" not recognized");
            process.exit(1);
    }
}



// ########## MAIN EXECUTION ##########
parseCommand();