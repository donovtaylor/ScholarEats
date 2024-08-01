/*****************************************
* Description: Handling the "share" button in the individual recipes page
*****************************************/

const debug = true;

function debugMsg(input) { // Use this for debug messages, I got tired of doing a ton of if (debug) statements
    if (debug) {
        console.log(input);
    }
} // NOTE: For some reason console logs do not appear on event listeners. Debug using reserveRecipeButton_BE.js instead

function shareLink() {

    var link = window.location.href; // Link to be copied
    navigator.clipboard.writeText(link);

    alert('Successfully reserved recipe!');
    debugMsg(`Link copied`);
}
// SOURCE: https://www.w3schools.com/howto/howto_js_copy_clipboard.asp
