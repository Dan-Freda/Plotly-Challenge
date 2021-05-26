// Plotly - Belly Button Biodiversity (Dashboard with visualizations)

// Define color arrays that will be implemented in the Gauge Chart
var arrColorsG = ["black", "grey", "purple", "green", "blue", "yellow", "gold", "orange", "red", "white"];

// Function used to filter and generate html elements for new data
function buildMetadata(sample) {
    d3.json("samples.json").then((data) => {
        var metadata = data.metadata;
        var resultsArray = metadata.filter(sampleObject => sampleObject.id == sample);
        var result = resultsArray[0]
        var panel = d3.select("#sample-metadata");
        panel.html("");
        Object.entries(result).forEach(([key, value]) => {
            panel.append("h6").text(`${key.toUpperCase()}: ${value}`);
        });
    });
}

// Function used to build & populate our charts with the relevant OTU values, id's, and labels
function buildCharts(sample) {
    d3.json("samples.json").then((data) => {
        var samples = data.samples;
        var resultsArray = samples.filter(sampleObject => sampleObject.id == sample);
        var result = resultsArray[0]
        var sample_values = result.sample_values;
        var otu_ids = result.otu_ids;
        var otu_labels = result.otu_labels;
        
        // Create bar chart to display top 10 microbial human navel colonizers (OTUs) 
        // Slice data & reverse array to accomodate Plotly's defaults
        var barData = [{
            x: sample_values.slice(0, 10).reverse(),
            y: otu_ids.slice(0, 10).map(otuID => `OTU ${otuID}`).reverse(),
            text: otu_labels.slice(0, 10).reverse(),
            type: "bar",
            orientation: "h"
        }];

        var barLayout = {
            title: "Most Frequently Observed OTUs",
            margin: {t: 40, l: 110} 
        };

        // Render the plot to the div tag with id "bar"
        Plotly.newPlot("bar", barData, barLayout);

        // Create a trace for plotting the Bubble Chart
        var trace1 = {
            x: otu_ids,
            y: sample_values,
            text: otu_labels,
            mode: "markers",
            marker: {
                size: sample_values,
                color: otu_ids
            }
        };

        var bubbleData = [trace1];

        // Define layout for Bubble Chart
        var bubbleLayout = {
            xaxis: {title: "OTU ID"},
            hovermode: "closest",
            height: 600,
            width: 1200
        };

        // Create the Bubble Chart
        Plotly.newPlot("bubble", bubbleData, bubbleLayout);

    });
}

// Function used for building the Gauge Chart (**Advanced Challenge**)
function buildGaugeChart(sample) {
    console.log("sample", sample);
  
    d3.json("samples.json").then(data =>{
  
      var objs = data.metadata;
    
  
      var matchedSampleObj = objs.filter(sampleData => 
        sampleData["id"] === parseInt(sample));
      
  
      gaugeChart(matchedSampleObj[0]);
   });   
}

// Creating the Gauge Chart
function gaugeChart(data) {
    console.log("gaugeChart", data);
  
    if(data.wfreq === null){
      data.wfreq = 0;  
    }
  
    let degree = parseInt(data.wfreq) * (180/10);
  
    // Trig to calculate the meter point
    let degrees = 180 - degree;
    let radius = .5;
    let radians = degrees * Math.PI / 180;
    let x = radius * Math.cos(radians);
    let y = radius * Math.sin(radians);
  
    let mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    let path = mainPath.concat(pathX, space, pathY, pathEnd);
    
    let traceG = [{ type: "scatter",
       x: [0], y:[0],
        marker: {size: 50, color:"2F6497"},
        showlegend: false,
        name: "WASH FREQ",
        text: data.wfreq,
        hoverinfo: 'text+name'},
      { values: [1, 1, 1, 1, 1, 1, 1, 1, 1, 9],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1',''],
      textinfo: 'text',
      textposition:'inside',
      textfont:{
        size : 16,
        },
      marker: {colors:[...arrColorsG]},
      labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '2-1', '0-1',''],
      hoverinfo: 'text',
      hole: .5,
      type: "pie",
      showlegend: false
    }];

    // Set the layout that will be used when displaying the Gauge Chart
    let layout = {
        shapes: [{
            type: 'path',
            path: path,
            fillcolor: '#2F6497',
            line: {
              color: '#2F6497'
            }
        }],

        title: "<b>Belly Button Washing Frequency</b> <br> <b>Scrubs per Week</b>",
        height: 550,
        width: 550,
        xaxis: {zeroline: false, showticklabels: false, showgrid: false, range: [-1, 1]},
        yaxis: {zeroline: false, showticklabels: false, showgrid: false, range: [-1, 1]},
    };

    // Create/generate the Gauge Chart for display in dashboard
    Plotly.newPlot("gauge", traceG, layout, {responsive: true});
}

// Initialize the page with default sample data and dropdown menu
function init() {
    var dropdownMenu = d3.select("#selDataset");
    d3.json("samples.json").then((data) => {
        var sampleNames = data.names;
        sampleNames.forEach((sample) => {
          dropdownMenu
            .append("option")
            .text(sample)
            .property("value", sample);
        });
        var defaultSample = sampleNames[0];
        buildMetadata(defaultSample);
        buildCharts(defaultSample);
        buildGaugeChart(defaultSample);
        dropdownMenu.on("change", optionChanged);
    });
}

// Function to display data for new sample selection
function optionChanged() {
    var dropdownMenu = d3.select("#selDataset");
    var newSample = dropdownMenu.property("value")
    // Run metadata and function to build chart new sample selection
    buildMetadata(newSample);
    buildCharts(newSample);
    buildGaugeChart(newSample);
    console.log(newSample);
}

// Initialize the dashboard
init();