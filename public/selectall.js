function selectAll(county) {
    var element = document.getElementsByClassName(county + '-checkbox');
    for (var i = 0; i < element.length; i++) {
        if (element[i].type == 'checkbox')
            element[i].checked = true;
    }
}

function deSelectAll(county) {
    var element = document.getElementsByClassName(county + '-checkbox');
    for (var i = 0; i < element.length; i++) {
        if (element[i].type == 'checkbox')
            element[i].checked = false;

    }
}

function selectEverything() {
    var element = document.getElementsByClassName('form-check-input');
    for (var i = 0; i < element.length; i++) {
        if (element[i].type == 'checkbox')
            element[i].checked = true;
    }
}

function deSelectEverything() {
    var element = document.getElementsByClassName('form-check-input');
    for (var i = 0; i < element.length; i++) {
        if (element[i].type == 'checkbox')
            element[i].checked = false;
    }
}