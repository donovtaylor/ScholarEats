
function handleClick(e) {
  if (e.target.className == "unfinished_button") {
    first = new Date();
    warning.innerHTML = "unfinished button";
    warning.style.display = 'block';
  }
  
  if (!timer1) {
    timer1 = setTimeout(() => {
      const second = new Date();
      console.log(second - first);
      console.log(timer1);
      warning.style.display = 'none';
    }, 3000);
    timer1 = null;
  }
}

var timer1 = null;
var first = null;

// target the warning banner in the navbar
const warning = document.getElementById("content_warning");

// add event listener to document in case there are multiple unfinished buttons
document.addEventListener("click", handleClick);