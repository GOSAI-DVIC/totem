let goDefaultNextStep = false;
let firstRun = true;

export function __state__Show(sketch) {
    firstRun ? onEnter() : null

    //WRITE YOUR CODE HERE

    if (goDefaultNextStep == true) {
        onExit()
        return "__anotherState1__" //replace with the name of the next state
    }
    return "__state__" //replace with the name of the current state
}

function onEnter() {
    firstRun = false;
    // ON ENTER CODE HERE
}

function onExit() {
    firstRun = true;
    goDefaultNextStep = false;
    
}

export function __state__Reset() {
    onExit()
}