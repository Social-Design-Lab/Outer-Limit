// injectedScript.js
window.alert = function alert(msg) {
    console.log('Hidden Alert: ' + msg);
};

window.confirm = function confirm(msg) {
    console.log("Hidden Confirm: " + msg);
    return true; // Simulate user clicking "Yes"
};