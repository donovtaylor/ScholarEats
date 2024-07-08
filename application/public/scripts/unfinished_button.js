function handleClick(e) {
  if (e.target.className == "unfinished_button") {
  warning.innerHTML = "unfinished button";
  warning.style.display = 'block';
  }
  setInterval(() => {
    warning.style.display = 'none';
  }, 5000);
}

const warning = document.getElementById("content_warning");
document.addEventListener("click", handleClick);