/**
 * Script to reorder the "classBox" elements based on the use selection
 */

/*
 * reorder the boxes and put the selected box on top.
 */
function reorder() {
    var selected = document.getElementById("navlist").value;
    var boxes = document.getElementsByClassName("classBox");
    for (var i = 0; i < boxes.length; i++) {
        if (boxes[i].id == selected) {
            boxes[i].style.order = 1;
        } else {
            boxes[i].style.order = i + 2;
        }
    }
}

// add the listener
var list = document.getElementById("navlist");
list.addEventListener("change", reorder, false);
