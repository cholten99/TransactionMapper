// Global variables
var gNetwork;

// TEST DATA FOR NOW!
var gData = {
  dot: "digraph {\
node [shape=circle fontSize=16]\
edge [length=100, color=gray, fontColor=black]\
A -> B;\
B -> C;\
C -> A;\
  }"
};

var gCanvas;
var gOptions = { height:"400px" };
var gPrinting = false;
var gShowControls = true;

// Resize the map when window resizes
window.onresize = function () {
  gNetwork.redraw()
};

// Draw the map
function draw () {
  try {
    // create a network
    gCanvas = $("#map")[0];
    gNetwork = new vis.Network(gCanvas, gData, gOptions);
    gNetwork.redraw();
  }
  catch (err) {
    console.log(err.toString());
  }
}

// Faking it for now!
function getNetworkData() {
  return("A -> B;B -> C;C -> A;");
}

$(function() {

  // Handle transaction control select change
  $("#transaction_select").change(function() {
console.log("Here");
  });

  // Show controls button
  $("#toggle_controls_button").click(function() {
    if (gShowControls == true) {
      gShowControls = false;
      $("#crud_wrapper").hide();
    } else {
      gShowControls = true;
      $("#crud_wrapper").show();
    }
  });

  // Download PNG of network button
  $("#download_button").click(function() {
    html2canvas($("#map_area"), {
      onrendered: function(canvas) {
        Canvas2Image.saveAsPNG(canvas); 
      }
    });
  });

  // Print network button
  $("#print_button").click(function() {
    html2canvas($("#map_area"), {
      onrendered: function(canvas) {
        gPrinting = true;
        var image = Canvas2Image.saveAsPNG(canvas, true); 
        $("#print_area").html(image);
        $("#print_area").printElement();
      }
    });
  });

  // Focus event used to catch print window closing - puts things back as they were before printing
  $(window).focus(function() {
    if (gPrinting) {
      $("#print_area").html("");
      gPrinting = false;
    }
  });

  // Handle change in canvas height slider
  $("#canvas_height_slider").change(function() {
    var newHeight = $("#canvas_height_slider").val() + "px";
    gOptions.height = newHeight;
    draw();
  });
  
  // Handle change in line length slider
  $("#line_length_slider").change(function() {
    gData.dot = "digraph {node [shape=circle fontSize=16] edge [length=" + $("#line_length_slider").val() + ", color=gray, fontColor=black]" + getNetworkData() + "}";
    draw();
  });

  // Set up initial state of controls
  $("#transaction_select").val("new");
  $("#transaction_delete_button").attr("disabled", true);
  $('#steps_area :input').attr("disabled", true);
  $('#actions_area :input').attr("disabled", true);
  $('#journeys_area :input').attr("disabled", true);
  $('#actions_selected_area :input').attr("disabled", true);

  // Initial drawing of network
  draw();

});
