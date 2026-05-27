/**
 * adding an event listener to the 'Confirm Uninstall' button
 *  - when the button is clicked, send a message to the background script
 *  to uninstall the extension
 */

document.addEventListener('DOMContentLoaded', function() {
    const uninstallButtons = [
        document.getElementById('confirmUninstallBtn'),
        document.getElementById('end_install')
    ].filter(Boolean);

    uninstallButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            chrome.runtime.sendMessage({ action: "uninstallExtension" });
        });
    });
});
