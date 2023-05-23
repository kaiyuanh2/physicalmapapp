var map = NULL;
fs.readFile('./entities.json', 'utf8', (err, jsonString) => {
  if (err) {
      console.log("Error reading JSON:", err);
  }
  try {
      map = new Map(Object.entries(JSON.parse(jsonString)));
      console.log(map);
  } catch (err) {
      console.log('Error parsing JSON string:', err);
  }
});

var form = document.getElementById('display_options');
form.addEventListener("submit", submitFunction, false);

function submitFunction(event) {
  event.preventDefault();
  var boxes = document.getElementsByClassName('form-check-input');
  var checked = [];
  for (var i = 0; boxes[i]; ++i) {
    if (boxes[i].checked) {
      checked.push(boxes[i].name);
    }
  }

  var checkedStr = checked.join(",");

  document.getElementById('checkbox_str').value = checkedStr;
  form.submit();

  return false;
}