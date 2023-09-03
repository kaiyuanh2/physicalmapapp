var form = document.getElementById('custom_map_upload');
form.addEventListener("submit", submitForm;

function submitForm(event) {
  event.preventDefault();
  const name = document.getElementById('mapName');
  if(name.value.length == 0) {
    console.log('no name error');
    return
  }
  const file = document.getElementById('dataSet');
  const formData = new FormData();
  formData.append("name", name.value)
  formData.append("file", file)
  console.log(formData)
  form.submit();

  return false;
}