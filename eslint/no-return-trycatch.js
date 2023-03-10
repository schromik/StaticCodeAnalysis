module.exports = {
    meta: {
        messages: {
            noReturnTryCatch: 'Do not include a return statement inside a try or catch block if there is a return statement in the finally block',
        },
    },
    create(context) {
        return {
            TryStatement(node) {
                //Funktion aufrufen und Node übergeben
                if (checkTryCatchFinallyForReturn(node)) {
                    context.report({ node: node, messageId: 'noReturnTryCatch'});
                }
            }
        }
    }
};



function checkTryCatchFinallyForReturn(node) {
    let hasTryReturn = false;
    let hasCatchReturn = false;
    let hasFinallyReturn = false;

    //try block iterieren und auf return statement prüfen
    for(statement of node.block.body){
    if (statement.type === 'ReturnStatement') {
        hasTryReturn = true;
    }}

    //catch block iterieren und auf return statement prüfen
    for(statement of node.handler.body.body){
    if (statement.type === 'ReturnStatement') {
        hasCatchReturn = true;
    }}
    
    //falls finally block existent -> iterieren und auf return statement prüfen
    if(node.finalizer !== null){
    for(statement of node.finalizer.body){
    if (statement.type === 'ReturnStatement') {
        hasFinallyReturn = true;
    }}
    }

    //Ist im finally block ein return statement, darf sich keins im try oder catch block befinden
    if(hasFinallyReturn && hasTryReturn || hasFinallyReturn && hasCatchReturn){
        return true;
    }else{
        return false;
    }
}
  
