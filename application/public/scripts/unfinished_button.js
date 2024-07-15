
function handleClick(e) {
  if (e.target.className == "unfinished_button") {
    warning.innerHTML = "unfinished button";
    warning.style.display = 'block';
    const timer = setTimeout(() => {
      warning.style.display = 'none';
      console.log("timer " + timer + " has died");
    }, 3000);
    console.log(timer);
  }
}
// target the warning banner in the navbar
const warning = document.getElementById("content_warning");

// add event listener to document in case there are multiple unfinished buttons
document.addEventListener("click", handleClick);