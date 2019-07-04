// 1: Setup
// ===========================

// var svgArea = d3.select("body").select("svg");
// if (!svgArea.empty()) {
// svgArea.remove();
// }

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
var circleRadius;
function crGet() {
  if (width <= 530) {
    circleRadius = 5;
  }
  else {
    circleRadius = 10;
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
    createScatter(healthData);
    console.log(healthData);
});

// function serves the purpose of creating the tooltip as well as creating functions and variables
// that make the udpates to our chart when a use specifies each axes.
function createScatter(data) {
    var currentX = "poverty";
    var currentY = "obesity";

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
        yMin = d3.min(data, function(d) {
            return parseFloat(d[currentY]) * 0.90;
        });

        // maximum value from selected column
        yMax = d3.max(data, function(d) {
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
// }

    // 3: Scatter Plot
    // ====================================
    // add initial chart
    
    // current min and max values
    xMinMax();
    yMinMax();

    // create our scales.
    // include margin and labelArea so chart appears in the correct position
    var xScale = d3
        .scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin]);
    var yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        // Height is inversed due to the way a webpage renders wtih the point (0, 0) being the top left pixel
        .range([height - margin - labelArea, margin]);

    // variables for our axes with scales
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);


    // calculate tickcounts with consdieration for smaller screens
    function tickCount() {
        if (width <= 500) {
          xAxis.ticks(5);
          yAxis.ticks(5);
        }
        else {
          xAxis.ticks(10);
          yAxis.ticks(10);
        }
      }
      tickCount();

    svg.append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
    svg.append("g")
        .call(yAxis)
        .attr("class", "yAxis")
        .attr("transform", "translate(" + (margin + labelArea) + ", 0)");


    
    var createCircles = svg.selectAll("g createCircles").data(data).enter();

    // We append the circles for each state
    createCircles
    .append("circle")
        // Circle attributes
        .attr("cx", function(d) {
            return xScale(d[currentX]);
        })
        .attr("cy", function(d) {
            return yScale(d[currentY]);
        })
        .attr("r", circleRadius)
        .attr("class", function(d) {
            return "stateCircle " + d.abbr;
        })
        // Hover rules/Display tooltip
        .on("mouseover", function(d) {
            toolTip.show(d, this);
            d3.select(this).style("stroke", "#323232");
        })
        .on("mouseout", function(d) {
            // Remove the tooltip
            toolTip.hide(d);
            // Remove highlight
            d3.select(this).style("stroke", "#e3e3e3");
        });

    // Adding labels to our circles
    createCircles
        .append("text")
        .text(function(d) {
            return d.abbr;
        })
        // Place the text using our scale.
        .attr("dx", function(d) {
            return xScale(d[currentX]);
        })
        .attr("dy", function(d) {
            // pushing text to center of cirlce
            return yScale(d[currentY]) + circleRadius / 2.5;
        })
        .attr("font-size", circleRadius)
        .attr("class", "stateText")
        // Hover Rules
        .on("mouseover", function(d) {
            // Show the tooltip
            toolTip.show(d);
            // Highlight the state circle's border
            d3.select("." + d.abbr).style("stroke", "#323232");
        })
        .on("mouseout", function(d) {
            // Remove tooltip
            toolTip.hide(d);
            // Remove highlight
            d3.select("." + d.abbr).style("stroke", "#e3e3e3");
        });


    // 4. Make graph interactive
    // ==========================

      // Select all axis text
    d3.selectAll(".aText").on("click", function() {
        // add variable for current click
        var self = d3.select(this);

        if (self.classed("inactive")) {
        // Grab the name and axis saved in label.
        var axis = self.attr("data-axis");
        var name = self.attr("data-name");

        // When x is the saved axis, execute this:
        if (axis === "x") {
            // Make currentX the same as the data-name.
            currentX = name;

            // Change the min and max
            xMinMax();

            // Update the domain of x.
            xScale.domain([xMin, xMax]);

            // adding a transition upon update.
            svg.select(".xAxis").transition().duration(300).call(xAxis);

            // Update scatter plot with new cirlces
            d3.selectAll("circle").each(function() {
            // adding a transiton for each cirlce
            d3
                .select(this)
                .transition()
                .attr("cx", function(d) {
                return xScale(d[currentX]);
                })
                .duration(300);
            });

            // Update location of text
            d3.selectAll(".stateText").each(function() {
            d3
                .select(this)
                .transition()
                .attr("dx", function(d) {
                return xScale(d[currentX]);
                })
                .duration(300);
            });

            // Change the classes of the last active label and the clicked label.
            labelChange(axis, self);
        }
        else {


            currentY = name;

            // Change the min and max of the y-axis.
            yMinMax();

            // Update the domain of y.
            yScale.domain([yMin, yMax]);

            // Updating y axis
            svg.select(".yAxis").transition().duration(300).call(yAxis);


            d3.selectAll("circle").each(function() {
            d3
                .select(this)
                .transition()
                .attr("cy", function(d) {
                return yScale(d[currentY]);
                })
                .duration(300);
            });

            // Update location of text
            d3.selectAll(".stateText").each(function() {
            d3
                .select(this)
                .transition()
                .attr("dy", function(d) {
                return yScale(d[currentY]) + circleRadius / 3;
                })
                .duration(300);
            });

            // Change the classes of the last active label and the clicked label.
            labelChange(axis, self);
        }
        }
    });



    // 5. Make responsive
    // ==================
    d3.select(window).on("resize", resize);

    function resize() {
        width = parseInt(d3.select("#scatter").style("width"));
        height = width - width / 3.9;
        leftTextY = (height + labelArea) / 2 - labelArea;

        // Apply the width and height to the svg canvas.
        svg.attr("width", width).attr("height", height);

        // Change the xScale and yScale ranges
        xScale.range([margin + labelArea, width - margin]);
        yScale.range([height - margin - labelArea, margin]);

        // With the scales changes, update the axes (and the height of the x-axis)
        svg
            .select(".xAxis")
            .call(xAxis)
            .attr("transform", "translate(0," + (height - margin - labelArea) + ")");

        svg.select(".yAxis").call(yAxis);

        // Update the ticks on each axis.
        tickCount();

        // Update the labels.
        xTextRefresh();
        yTextRefresh();

        // Update the radius of each dot.
        crGet();

        // With the axis changed, let's update the location and radius of the state circles.
        d3
        .selectAll("circle")
        .attr("cy", function(d) {
            return yScale(d[currentY]);
        })
        .attr("cx", function(d) {
            return xScale(d[currentX]);
        })
        .attr("r", function() {
            return circleRadius;
        });

        // We need change the location and size of the state texts, too.
        d3
        .selectAll(".stateText")
        .attr("dy", function(d) {
            return yScale(d[currentY]) + circleRadius / 3;
        })
        .attr("dx", function(d) {
            return xScale(d[currentX]);
        })
        .attr("r", circleRadius / 3);
    }
}




