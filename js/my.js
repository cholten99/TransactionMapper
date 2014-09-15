// Global variables
var gNetwork;
var gCanvas;
var gOptions = { height:"400px" };
var gPrinting = false;
var gShowControls = true;

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

// Delete confirmation utility function
function delete_item(functionName) {
  $("#dialog_confirm").data("delete_function", functionName);

  $("#dialog_confirm").dialog({
    resizable: false,
    modal: true,
    buttons: {
      "Delete": function() {
        $(this).dialog("close");
        functionName = $("#dialog_confirm").data("delete_function");
        window[functionName]();
      },
      Cancel: function() {
        $(this).dialog("close");
      }
    }
  });
}

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

// Functions to handle transactions_area
function update_transaction_select() {
  $.post("php/store.php", { table: "transactions", action: "getAll" }, function(data, status) {
    $("#transaction_select").find("option").remove();
    $("#transaction_select").append("<option value='-1'>-> New <-</option>");
    transactionsArray = JSON.parse(data);
    for (var i=0; i<transactionsArray.length; i++) {
      $("#transaction_select").append("<option value=" + transactionsArray[i].id + ">" + transactionsArray[i].name + "</option>");
    }
    $("#transaction_select").val("-1");
    transaction_select_clicked();
  });
}

function transaction_select_clicked() {
  if ($("#transaction_select").val() == -1) {
    $("#transaction_input").val("");
    $("#transaction_name").html("None selected");
    $("#transaction_button").html("Add");
    $("#transaction_delete_button").attr("disabled", true);
    $('#steps_area :input').attr("disabled", true);
    $('#actions_area :input').attr("disabled", true);
    $('#journeys_area :input').attr("disabled", true);
    $('#actions_selected_area :input').attr("disabled", true);
  } else {
    $("#transaction_button").html("Update");
    $("#transaction_delete_button").attr("disabled", false);
    $("#transaction_input").val($("#transaction_select option:selected").text());
    $("#transaction_name").html($("#transaction_select option:selected").text());
    $("#steps_area :input").attr("disabled", false);
    update_steps_select();
    $("#journeys_area :input").attr("disabled", false);
  }
}

function delete_transaction() {
  transactionId = $("#transaction_select").val();
  $.post("php/store.php", { table: "transactions", action: "delete", id: transactionId }, function() {
    update_transaction_select();
  });
}

// Functions to handle steps_area
function update_steps_select() {
  transactionId = $("#transaction_select").val();
  $.post("php/store.php", { table: "steps", action: "getByTransactionId", id: transactionId }, function(data, status) {
    $("#steps_select").find("option").remove();
    $("#steps_select").append("<option value='-1'>-> New <-</option>");
    stepsArray = JSON.parse(data);
    for (var i=0; i<stepsArray.length; i++) {
      $("#steps_select").append("<option value=" + stepsArray[i].id + ">" + stepsArray[i].name + "</option>");
    }
    $("#steps_select").val("-1");
    steps_select_clicked();
  });
}

function steps_select_clicked() {
  if ($("#steps_select").val() == -1) {
    $("#steps_input").val("");
    $("#steps_button").html("Add");
    $("#steps_delete_button").attr("disabled", true);
  } else {
    $("#steps_button").html("Update");
    $("#steps_delete_button").attr("disabled", false);
    $("#steps_input").val($("#steps_select option:selected").text());
  }
}

function delete_step() {
  stepsId = $("#steps_select").val();
  $.post("php/store.php", { table: "steps", action: "delete", id: stepsId }, function() {
    update_steps_select();
  });
}

// Onload function
$(function() {

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
  update_transaction_select();

  // Initial drawing of network
  draw();
  
  // transaction_area event handling
  $("#transaction_select").change(function () {
    transaction_select_clicked();
  });

  $("#transaction_button").click(function () {
    buttonValue = $("#transaction_button").html();
    transactionName = $("#transaction_input").val();
    if (transactionName == "") { return; }
    transactionId = $("#transaction_select").val();
    if (buttonValue == "Add") {
      $.post("php/store.php", { table: "transactions", action: "add", name: transactionName }, function() {
        update_transaction_select();
      });
    } else {
      $.post("php/store.php", { table: "transactions", action: "update", id: transactionId, name: transactionName }, function() {
        update_transaction_select();
      });
    }
  });

  $("#transaction_delete_button").click(function () {
    delete_item("delete_transaction");
  });

  // steps_area event handling
  $("#steps_select").change(function () {
    steps_select_clicked();
  });

  $("#steps_button").click(function () {;
    buttonValue = $("#steps_button").html();
    stepsName = $("#steps_input").val();
    if (stepsName == "") { return; }
    transactionId = $("#transaction_select").val()[0];
    stepsId = $("#steps_select").val();
    if (buttonValue == "Add") {
      $.post("php/store.php", { table: "steps", action: "add", name: stepsName, transaction_id: transactionId }, function() {
        update_steps_select();
      });
    } else {
      $.post("php/store.php", { table: "steps", action: "update", id: stepsId, name: stepsName }, function() {
        update_steps_select();
      });
    }
  });

  $("#steps_delete_button").click(function () {
    delete_item("delete_step");
  });

});
