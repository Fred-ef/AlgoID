const fs = require('fs');

const create = require('./commands/create');



// ########## GLOBAL DATA ##########

const HELP_PATH = './help/';
const HELP_EXT = '.txt';
const ALLOWED_COMMANDS = ["create"];
const TEST_ADDR = 'VCMJKWOY5P5P7SKMZFFOCEROPJCZOTIJMNIYNUCKH7LRO45JMJP6UYBIJA';     // TODO REMOVE

// ########## FUN DEF ##########

// helper function that prints a guide on how to use the issued command
const commandHelp = function(msg, command='general') {
    // reads the correct helper file and returns
    // a textual guide on how to use the given command

    if(msg) console.error("\nError: "+msg);     // printig error message

    let filePath = HELP_PATH+command+HELP_EXT;
    let res = "";


    switch (command) {
        case "create":
            res = fs.readFileSync(filePath, {encoding:'utf8', flag:'r'});
            console.error(res);
            break;
    
        default:
            res = fs.readFileSync(filePath, {encoding:'utf8', flag:'r'});
            console.error(res);
            break;
    }
}


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
            commandHelp("Command not recognized");
            process.exit(1);
    }
}



// ########## MAIN EXECUTION ##########
parseCommand();