// Section 1: Setup
// ===========================

var svgArea = d3.select("body").select("svg");
if (!svgArea.empty()) {
svgArea.remove();
}

// var svgWidth = 960;
// var svgHeight = 500;

// var margin = {
//     top: 20,
//     right: 40,
//     bottom: 80,
//     left: 100
//   };

// var width = svgWidth - margin.left - margin.right;
// var height = svgHeight - margin.top - margin.bottom;

// gather width of container
var width = parseInt(d3.select("#scatter").style("width"));
// gather height for graph
var height = width - width / 3.9;

var margin = 20;

// space for lables
var labelArea = 110;

// padding for the text below the x axis and to the left of the y axis
var tPadBot = 40;
var tPadLeft = 40;

// Create the actual canvas for the graph
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart");

// function to set circle radius 
var circRadius;
function crGet() {
  if (width <= 530) {
    circRadius = 5;
  }
  else {
    circRadius = 10;
  }
}
crGet();


// create our Axes
// create a section in the svg to enter the three different labels
svg.append("g").attr("class", "xText");
var xText = d3.select(".xText");


function xTextRefresh() {
    xText.attr(
      "transform",
      "translate(" +
        ((width - labelArea) / 2 + labelArea) +
        ", " +
        (height - margin - tPadBot) +
        ")"
    );
  }
  xTextRefresh();
  
  // Now we use xText to append three text SVG files, with y coordinates specified to space out the values.
  // 1. Poverty
  xText
    .append("text")
    .attr("y", -26)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class", "aText active x")
    .text("In Poverty (%)");
  // 2. Age
  xText
    .append("text")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x")
    .text("Age (Median)");
  // 3. Income
  xText
    .append("text")
    .attr("y", 26)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x")
    .text("Household Income (Median)");


// B) Left Axis
// ============
// We add a second label group, this time for the axis left of the chart.
svg.append("g").attr("class", "yText");
var yText = d3.select(".yText");

// Like before, we nest the group's transform attr in a function
// to make changing it on window change an easy operation.
function yTextRefresh() {
  yText.attr(
    "transform",
    "translate(" + (margin + tPadLeft) + ", " + ((height + labelArea) / 2 - labelArea) + ")rotate(-90)"
  );
}
yTextRefresh();

// Now we append the text.
// 1. Obesity
yText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "obesity")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Obese (%)");

// 2. Smokes
yText
  .append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");

// 3. Lacks Healthcare
yText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");


// 2. Import our .csv file.
// ========================

// d3.csv("assets/data/data.csv", function(err, healthData) {
// if (err) throw err;

// console.log(healthData);
// });
d3.csv("assets/data/data.csv").then(function(healthData) {
    // Visualize the data
    // visualize(data);
    console.log(healthData);
});

// function serves the purpose of creating the tooltip as well as creating functions and variables
// that make the udpates to our chart when a use specifies each axes.
function manipulate(data) {
    var currentX = "Poverty";
    var currentY = "Obesity";

    // We also save empty variables for our the min and max values of x and y.
    var xMin;
    var xMax;
    var yMin;
    var yMax;

    // This function allows us to set up tooltip rules (see d3-tip.js).
    var toolTip = d3
    .tip()
    .attr("class", "tooltip")
    .offset([40, -60])
    .html(function(d) {
        console.log(d)
        // x key
        var X;
        // collect state name.
        var theState = "<div>" + d.state + "</div>";
        // collect y key and value.
        var Y = "<div>" + currentY + ": " + d[currentY] + "%</div>";
        // If the x key is poverty
        if (currentX === "poverty") {
        // Grab the x key and formatted to show percentage
        X = "<div>" + currentX + ": " + d[currentX] + "%</div>";
        }
        else {
        // Grab the x key and include commas after every third digit.
        X = "<div>" + currentX + ": " + parseFloat(d[currentX]).toLocaleString("en") + "</div>";
        }

        return theState + X + Y;
    });
    // Call the toolTip function.
    svg.call(toolTip);

    // adding some functions to handle data changes

    // a. update the max and min for x values
    function xMinMax() {
        // minimum value from selected column
        xMin = d3.min(data, function(d) {
        return parseFloat(d[currentX]) * 0.90;
        });

        // maximum value from selected column
        xMax = d3.max(data, function(d) {
        return parseFloat(d[currentX]) * 1.10;
        });
    }

    // b. update the max and min for y values
    function yMinMax() {
        // minimum value from selected column
        yMin = d3.min(theData, function(d) {
        return parseFloat(d[currentY]) * 0.90;
        });

        // maximum value from selected column
        yMax = d3.max(theData, function(d) {
        return parseFloat(d[currentY]) * 1.10;
        });
    }

    // c. update the HTML classes of label text when clicked.
    function labelChange(axis, clickedText) {
        // Switch the currently active to inactive.
        d3
        .selectAll(".aText")
        .filter("." + axis)
        .filter(".active")
        .classed("active", false)
        .classed("inactive", true);

        // Switch the text just clicked to active.
        clickedText.classed("inactive", false).classed("active", true);
    }
}

// healthData.forEach(function(data) {
//     data.id = +data.id;
//     data.state = data.state;
//     data.abbr = data.abbr;
//     data.poverty = +data.poverty;
//     data.povertyMOE = +data.povertyMOE;
//     data.age = +data.age;
//     data.ageMOE = +data.ageMOE;
//     data.income = +data.income;
//     data.incomeMOE = +data.incomeMOE;
//     data.healthcare = +data.healthcare;
//     data.healthcareLow = +data.healthcareLow;
//     data.healthcareHigh = +data.HealthcareHigh;
//     data.obesity = +data.obesity;
//     data.obesityLow = +data.obesityLow;
//     data.obesityHigh = +data.obesityHigh;
//     data.smokes = +data.smokes;
//     data.smokesLow = +data.smokesLow;
//     data.smokesHigh = +data.smokesHigh;
// });

// // d3.select(window).on('resize', resize); 

// // function resize() {

//     var yLinearScale = d3.scaleLinear()
//         .domain([0, d3.max(healthData, data => +data.healthcare)])
//         .range([height, 0]);

//     var xLinearScale = d3.scaleLinear()
//         .domain([d3.min(healthData, data => +data.poverty), d3.max(healthData, data => +data.poverty)])
//         .range([0, width]);
    
//     var bottomAxis = d3.axisBottom(xLinearScale);
//     var leftAxis = d3.axisLeft(yLinearScale);
