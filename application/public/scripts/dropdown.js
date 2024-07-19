function dropdown(e) {
  var clicked_item = e.target;
  var prev_clicked_item;


  // we check if we clicked a dropdown button, 
  if (clicked_item.className == 'dropbtn') {
    // a dropdown button's name equals its dropdown content's id
    // this way, they are bound

    var this_dropdown = clicked_item.nextElementSibling;

    // this_dropdown = document.getElementById(clicked_item.name);
    this_dropdown.classList.toggle('show');

    //we make sure that if we click a new dropdown, all other dropdowns collapse
    if (clicked_item != prev_clicked_item) {
      collapseDropdowns(this_dropdown);
    }

    prev_clicked_item = clicked_item;

  } else if (clicked_item.className != 'dropdown_option') {
    // if clicked outside the dropdown, hide all dropdowns
    collapseDropdowns();
  }

  // also collapse autocomplete-suggestions on any click
  var autocomplete_suggestions = document.getElementById('autocomplete-suggestions');
  autocomplete_suggestions.classList.remove('show');

}

//loop through all dropdowns and collapse them
function collapseDropdowns() {
  var dropdowns = document.getElementsByClassName('dropdown_content');
  for (dropdown of dropdowns) {
    dropdown.classList.remove('show');
  }
}
// collapse all dropdowns except for "element"
function collapseDropdowns(element) {
  var dropdowns = document.getElementsByClassName('dropdown_content');
  for (dropdown of dropdowns) {
    if (dropdown != element)
      dropdown.classList.remove('show');
  }
}

document.addEventListener("click", dropdown);