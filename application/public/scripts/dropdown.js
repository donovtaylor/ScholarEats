function dropdown(e) {
  var clicked_item = e.target;
  var prev_clicked_item;

  //we make sure that if we click a new dropdown, all other dropdowns collapse
  if (clicked_item != prev_clicked_item && clicked_item.className != 'dropdown_option') {
    // if clicked outside the dropdown, hide all dropdowns
    var dropdowns = document.getElementsByClassName('dropdown_content');
    for (dropdown of dropdowns) {
      dropdown.classList.remove('show');
    }
    // also collapse autocomplete-suggestions
    var autocomplete_suggestions = document.getElementById('autocomplete-suggestions');
    autocomplete_suggestions.classList.remove('show');
  }
  // we check if we clicked a dropdown button, 
  if (clicked_item.className == 'dropbtn' || clicked_item == prev_clicked_item) {
    // a dropdown button's name equals its dropdown content's id
    // this way, they are bound
    this_dropdown = document.getElementById(clicked_item.name);
    this_dropdown.classList.toggle('show');
    prev_clicked_item = clicked_item;
  }
}

document.addEventListener("click", dropdown);