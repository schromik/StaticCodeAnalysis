module.exports = {
    meta: {
        messages: {
            noReturnTryCatch: 'Do not include a return statement inside a try or catch block if there is a return statement in the finally block ',
        },
    },
    create(context) {
        return {
            TryStatement(node) {
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


    /*console.log(node.handler.body.body[0].type);
    console.log(node.block.body[0].type);
    console.log(node.finalizer.body[0].type);*/

  
    for(statement of node.block.body){
    if (statement.type === 'ReturnStatement') {
        hasTryReturn = true;
    }}

    for(statement of node.handler.body.body){
    if (statement.type === 'ReturnStatement') {
        hasCatchReturn = true;
    }}

    for(statement of node.finalizer.body){
    if (statement.type === 'ReturnStatement') {
        hasFinallyReturn = true;
    }}
    

    if(hasFinallyReturn && hasTryReturn || hasFinallyReturn && hasCatchReturn){
        return true;
    }else{
        return false;
    }
}
  
