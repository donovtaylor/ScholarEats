function dropdown(e) {
  if (e.target.className == 'dropbtn') {
    document.getElementById(e.target.name).classList.toggle('show');
  }
}
document.addEventListener("click", dropdown);