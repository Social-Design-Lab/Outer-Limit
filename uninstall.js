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