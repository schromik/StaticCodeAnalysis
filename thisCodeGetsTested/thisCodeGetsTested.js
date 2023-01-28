//Da die Standard Regel no-unsafe-finally generell ein return im finally block verbietet und somit mit unserer eigenen Regel im Konflikt steht,
//welche ja im finally block ein return erlaubt, mit der Bedingung das keines im try oder catch steht,
//kann sie mit dem folgenden Kommentar deaktiviert werden.

/* eslint no-unsafe-finally: 0 */

// Wird diese Funktion nicht auskommentiert und der Code gepushed, schlägt die Pipeline fehl, da im try sowie im finally ein return zufinden ist.
/*function testA(){
    try{
        console.log("try this!");
        return 1;
    }
    catch(err){
        console.log("try this!");
    }
    finally{
        return 1;
    }
}*/


// testB besteht den Test, da ein return NUR im finally block zu finden ist
function testB(){
    try{
        console.log("try this!");
    }
    catch(err){
        console.log("error catched!");
    }
    finally{
        console.log("finally do this!");
        return 1;
    }
}

// testC besteht den Test, da ein return NUR im try und/oder catch block zu finden ist
function testC(){
    try{
        console.log("try this!");
        return 1;
    }
    catch(err){
        console.log("error catched!");
        return 1;
    }
    finally{
        console.log("finally do this!");
    }
}

testA();
testB();
testC();