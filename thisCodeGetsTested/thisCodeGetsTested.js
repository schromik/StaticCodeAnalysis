// Wird diese Funktion nicht auskommentiert und der Code gepushed, schlägt die Pipeline fehl
/*function testA(){
    try{
        return 1;
    }
    catch(err){
    }
    finally{
        return 1;  
    }
}*/


// passed
function testB(){
    try{
        return 1;
    }
    catch(err){
        return 1;   
    }
    finally{

    }
}
