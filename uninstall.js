/**
 * adding an event listener to the 'Confirm Uninstall' button
 *  - when the button is clicked, send a message to the background script
 *  to uninstall the extension
 */

document.addEventListener('DOMContentLoaded', function() {
    let confirmUninstallButton = document.getElementById('confirmUninstallBtn');

    if(confirmUninstallButton) {
        confirmUninstallButton.addEventListener('click', function() {
            chrome.runtime.sendMessage({ action: "uninstallExtension" });
        });
    } else {
        console.error("Couldn't find 'Confirm Uninstall' button");
    }
});


document.addEventListener('DOMContentLoaded', function() {
    let confirmUninstallButton = document.getElementById('end_install');

    if(confirmUninstallButton) {
        confirmUninstallButton.addEventListener('click', function() {
            chrome.runtime.sendMessage({ action: "uninstallExtension" });
        });
    } else {
        console.error("Couldn't find 'Confirm Uninstall' button");
    }
});