var form = document.getElementById('display_options');
form.addEventListener("submit", submitFunction, false);

function submitFunction(event) {
  event.preventDefault();
  var boxes = document.getElementsByClassName('form-check-input');
  var checked = [];
  for (var i = 0; boxes[i]; i++) {
    if (boxes[i].type == 'checkbox' && boxes[i].checked) {
      checked.push(boxes[i].name);
    }
  }
  if (checked.length >= 1125) {
    var checkedStr = 'all';
  }
  else {
    var checkedStr = checked.join(",");
  }

  document.getElementById('checkbox_str').value = checkedStr;
  form.submit();

  return false;
}