// Global variables
var gNetwork;
var gCanvas;
var gOptions = {
  height:"400px",
//  configurePhysics:true
};
var gPrinting = false;
var gShowStepNames = true;
var gShowControls = true;
var gLineLength = 100;
var gData = {};

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
  draw();
};

// Draw the map
function draw () {

  journeysId = $("#journeys_select").val();
  $.post("php/store.php", { table: "journeys", action: "getNetworkString", id: journeysId }, function(data, status) {

    gData.dot = "digraph { node [shape=box fontSize=16 mass=3] edge [length=" + gLineLength + ", color=gray, fontColor=black] " + data + "}";

    if (gShowStepNames == false) {
      var stepsObject = {};
      stepsObject.keys = [];
      stepsObject.values = [];
      var asciiOrd = 65;
      var start = 0;
      var end = data.indexOf(" -");
      while (end != -1) {
        step_one = data.substring(start, end);
        if (stepsObject.keys.indexOf(step_one) == -1) {
          stepsObject.keys.push(step_one);
          stepsObject.values.push(String.fromCharCode(asciiOrd));
          asciiOrd++;
        }
        start = data.indexOf("> ", end) + 2;
        end = data.indexOf("[", start);
        step_two = data.substring(start, end);
        if (stepsObject.keys.indexOf(step_two) == -1) {
          stepsObject.keys.push(step_two);
          stepsObject.values.push(String.fromCharCode(asciiOrd));
          asciiOrd++;
        }
        start = data.indexOf(";", end) + 1;
        end = data.indexOf(" ->", start);
      }

      for (i=0; i< stepsObject.keys.length; i++) {
        regEx = new RegExp(stepsObject.keys[i], "g");
        gData.dot = gData.dot.replace(regEx, stepsObject.values[i]);
      }

      $("#table_area").css("visibility", "visible");
      $("#table_area").css("height", $("#canvas_height_slider").val() + "px");
      $("#table_area").css("width", "30%");
      $("#map_area").css("margin-left", "30%");
      $("#map_area").css("border-left-style", "solid");

      $("#symbol_table").empty();
      $('#symbol_table').append("<tr><th>Symbol</th><th>Replaces</th></tr>");
      for (i=0; i< stepsObject.keys.length; i++) {
        step = stepsObject.keys[i].substring(1, stepsObject.keys[i].length-1);
        $('#symbol_table').append("<tr><td>" + step + "</td><td>" + stepsObject.values[i] + "</td></tr>");
      }

    } else {
      $("#table_area").css("visibility", "hidden");
      $("#table_area").css("height", "0px");
      $("#map_area").css("margin-left", "0px");
      $("#map_area").css("border-left-style", "none");
    }

    try {
      gCanvas = $("#map")[0];
      gNetwork = new vis.Network(gCanvas, gData, gOptions);
      gNetwork.redraw();
    }
    catch (err) {
      console.log(err.toString());
    }
  
  });
  
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
    update_steps_select();
    $('#journeys_area :input').attr("disabled", true);
    update_journeys_select();
    $('#actions_area :input').attr("disabled", true);
    update_actions_select();
    $('#actions_area :input').attr("disabled", true);
  } else {
    $("#transaction_button").html("Update");
    $("#transaction_delete_button").attr("disabled", false);
    $("#transaction_input").val($("#transaction_select option:selected").text());
    $("#transaction_name").html($("#transaction_select option:selected").text());
    $("#steps_area :input").attr("disabled", false);
    update_steps_select();
    $("#journeys_area :input").attr("disabled", false);
    update_journeys_select();
    $('#actions_area :input').attr("disabled", false);
    update_actions_select();
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
    update_actions_select();
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

// Functions to handle journeys_area
function update_journeys_select() {
  transactionId = $("#transaction_select").val();
  $.post("php/store.php", { table: "journeys", action: "getByTransactionId", id: transactionId }, function(data, status) {
    $("#journeys_select").find("option").remove();
    $("#journeys_select").append("<option value='-1'>-> New <-</option>");
    journeysArray = JSON.parse(data);
    for (var i=0; i<journeysArray.length; i++) {
      $("#journeys_select").append("<option value=" + journeysArray[i].id + ">" + journeysArray[i].name + "</option>");
    }
    $("#journeys_select").val("-1");
    journeys_select_clicked();
  });
}

function journeys_select_clicked() {
  if ($("#journeys_select").val() == -1) {
    $("#journeys_input").val("");
    $("#journeys_button").html("Add");
    $("#journeys_delete_button").attr("disabled", true);
    $("#journey_name").html("None selected");
    $("#actions_to_show_select").find("option").remove();
    $("#actions_to_show_area").attr("disabled", true); 
  } else {
    $("#journeys_button").html("Update");
    $("#journeys_delete_button").attr("disabled", false);
    $("#journeys_input").val($("#journeys_select option:selected").text());
    $("#journey_name").html($("#journeys_select option:selected").text());
    $("#actions_to_show_area").attr("disabled", false);
    update_actions_to_show_select();
  }
}

function delete_journey() {
  journeysId = $("#journeys_select").val();
  $.post("php/store.php", { table: "journeys", action: "delete", id: journeysId }, function() {
    update_journeys_select();
  });
}

// Functions to handle actions_area
function update_actions_select() {
  transactionId = $("#transaction_select").val();
  $.post("php/store.php", { table: "actions", action: "getByTransactionId", id: transactionId }, function(data, status) {
    $("#actions_select").find("option").remove();
    $("#actions_select").append("<option value='-1'>-> New <-</option>");
    actionsArray = JSON.parse(data);
    for (var i=0; i<actionsArray.length; i++) {
      $("#actions_select").append("<option value=" + actionsArray[i].id + ">" + actionsArray[i].name + "</option>");
    }
    $("#actions_select").val("-1");

    $.post("php/store.php", { table: "steps", action: "getByTransactionId", id: transactionId }, function(data, status) {
      $("#actions_thing_one_select").find("option").remove();
      $("#actions_thing_two_select").find("option").remove();
      stepsArray = JSON.parse(data);
      for (var i=0; i<stepsArray.length; i++) {
        $("#actions_thing_one_select").append("<option value=" + stepsArray[i].id + ">" + stepsArray[i].name + "</option>");
        $("#actions_thing_two_select").append("<option value=" + stepsArray[i].id + ">" + stepsArray[i].name + "</option>");
      }
      if ($("#journeys_select").val() != -1) {
        update_actions_to_show_select();
      }
      actions_select_clicked();
    });

  });

}

function actions_select_clicked() {
  if ($("#actions_select").val() == -1) {
    $("#actions_input").val("");
    $("#actions_button").html("Add");
    $("#actions_delete_button").attr("disabled", true);
    $('select[id="actions_thing_one_select"] option:eq(0)').attr('selected', 'selected');
    $('select[id="actions_thing_two_select"] option:eq(0)').attr('selected', 'selected');
  } else {
    $("#actions_button").html("Update");
    $("#actions_delete_button").attr("disabled", false);
    $("#actions_input").val($("#actions_select option:selected").text());
    actionsId = $("#actions_select").val();
    $.post("php/store.php", { table: "actions", action: "getById", id: actionsId }, function(data, status) {
      stepsArray = JSON.parse(data);
      step_one_id = stepsArray[0].step_one_id;
      step_two_id = stepsArray[0].step_two_id;
      $("#actions_thing_one_select").val(step_one_id);
      $("#actions_thing_two_select").val(step_two_id);
    });
  }
}

function delete_action() {
  actionsId = $("#actions_select").val();
  $.post("php/store.php", { table: "actions", action: "delete", id: actionsId }, function() {
    update_actions_select();
  });
}

// Functions to handle actions_to_show_area
function update_actions_to_show_select() {
  transactionId = $("#transaction_select").val();
  $.post("php/store.php", { table: "actions", action: "getByTransactionId", id: transactionId }, function(data, status) {
    $("#actions_to_show_select").find("option").remove();
    actionsArray = JSON.parse(data);
    for (var i=0; i<actionsArray.length; i++) {
      $("#actions_to_show_select").append("<option value=" + actionsArray[i].id + ">" + actionsArray[i].name + "</option>");
    }

    journeyId = $("#journeys_select").val();
    $.post("php/store.php", { table: "journeys", action: "getById", id: journeyId }, function(data, status) {
      actionsToShowArray = JSON.parse(data);
      actionsToShow = actionsToShowArray[0].actions_to_show;
      selectedArray = JSON.parse("[" + actionsToShow + "]");
      for (var i=0; i<selectedArray.length; i++) {
        $("#actions_to_show_select option[value='" + selectedArray[i] + "']").prop("selected", true);
      }

      draw();

    });

  });

}

function actions_to_show_select_clicked() {
  journeyId = $("#journeys_select").val();
  actions = $("#actions_to_show_select").val().toString();
  $.post("php/store.php", { table: "journeys", action: "update", id: journeyId, actions_to_show: actions }, function(data, status) {
    draw();
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

  // Toggle showing full step names button
  $("#toggle_button").click(function() {
    if (gShowStepNames) {
      gShowStepNames = false;
    } else {
      gShowStepNames = true;
    }
    draw();
  });

  // Handle change in canvas height slider
  $("#canvas_height_slider").change(function() {
    var newHeight = $("#canvas_height_slider").val() + "px";
    gOptions.height = newHeight;
    draw();
  });
  
  // Handle change in line length slider
  $("#line_length_slider").change(function() {
    gLineLength = $("#line_length_slider").val();
    draw();
  });

  // Set up initial state of controls
  update_transaction_select();

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

  // journeys_area event handling
  $("#journeys_select").change(function () {
    journeys_select_clicked();
  });

  $("#journeys_button").click(function () {;
    buttonValue = $("#journeys_button").html();
    journeysName = $("#journeys_input").val();
    if (journeysName == "") { return; }
    transactionId = $("#transaction_select").val()[0];
    journeysId = $("#journeys_select").val();
    if (buttonValue == "Add") {
      $.post("php/store.php", { table: "journeys", action: "add", name: journeysName, transaction_id: transactionId, actions_to_show: "" }, function() {
        update_journeys_select();
      });
    } else {
      $.post("php/store.php", { table: "journeys", action: "update", id: journeysId, name: journeysName }, function() {
        update_journeys_select();
      });
    }
  });

  $("#journeys_delete_button").click(function () {
    delete_item("delete_journey");
  });

  // actions_area event handling
  $("#actions_select").change(function () {
    actions_select_clicked();
  });

  $("#actions_button").click(function () {;
    buttonValue = $("#actions_button").html();
    actionsName = $("#actions_input").val();
    if (actionsName == "") { return; }
    transactionId = $("#transaction_select").val()[0];
    actionsId = $("#actions_select").val();
    stepOneId = $("#actions_thing_one_select").val();
    stepTwoId = $("#actions_thing_two_select").val();
    if (buttonValue == "Add") {
      $.post("php/store.php", { table: "actions", action: "add", name: actionsName, transaction_id: transactionId, step_one_id: stepOneId, step_two_id: stepTwoId }, function() {
        update_actions_select();
      });
    } else {
      $.post("php/store.php", { table: "actions", action: "update", id: actionsId, name: actionsName, step_one_id: stepOneId, step_two_id: stepTwoId }, function() {
        update_actions_select();
      });
    }
  });

  $("#actions_delete_button").click(function () {
    delete_item("delete_action");
  });

  // actions_to_show_area event handling
  $("#actions_to_show_select").change(function () {
    actions_to_show_select_clicked();
  });

});
