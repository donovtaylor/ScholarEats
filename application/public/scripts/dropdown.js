function dropdown(e) {
  clicked_item = e.target;
  if (clicked_item.className == 'dropbtn') {
    this_dropdown = document.getElementById(clicked_item.name);
    this_dropdown.classList.toggle('show');
  } else {
    var dropdowns = document.getElementsByClassName('dropdown_content');
    for (dropdown of dropdowns) {
      dropdown.classList.remove('show');
    }
  }
}

document.addEventListener("click", dropdown);