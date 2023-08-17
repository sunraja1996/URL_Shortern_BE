const URLgenerate = () => {
    var ranRes = "";
    var Char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    var CharLen = Char.length;

    for(var i=0; i < 5; i++){
        ranRes += Char.charAt(
            Math.floor(Math.random()*CharLen)
        );
    }
    return ranRes;
}


module.exports = {URLgenerate}