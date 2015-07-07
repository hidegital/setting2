console.log('aaa');
console.log('sss');
console.log('ddd');


// Lexical this
var bob = {
    _name: "Bob",
    _friends: [],
    printFriends() {
    this._friends.forEach(f =>
    console.log(this._name + " knows " + f));
}


