// Get the belly button endpoint
const bbDataURL = 'https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json';
var bbData;

// optionChanged is called when subject is selected from the drop down menu
function optionChanged (value) {
  let subject = value;
  console.log('My subject is: ', subject);
  let index = bbData.names.indexOf(subject);
  console.log('The index of my subject is: ', index);
  drawDashboard(index);
}

// Fetch the JSON data and console log it
d3.json(bbDataURL).then(function (data) {
  console.log(data);
  bbData = data;

  // create a drop-down menu of the test subjects in the HTML
  let dropDown = d3.select('#selDataset');
  let options = dropDown.selectAll('option').data(data.names).enter().append('option');
  options.text(function (d) {
    return d;
  }).attr('value', function (d) {
    return d;
  });
  drawDashboard(0);
});

// draw the bar chart of OTUs for test subject at index subjectIndex in bbData
function drawBarChart (subjectIndex) {
  console.log('Drawing barchart for index: ', subjectIndex, bbData.names[subjectIndex]);
  // reformat data so that otu_ids, otu_labels and sample_values are in the
  // same record and sort together
  let subjectData = bbData.samples[subjectIndex];
  let subjectSamples = [];
  let noData = false;
  if (subjectData.sample_values.length === 0) { noData = true; }
  for (let i = 0; i < subjectData.sample_values.length; i++) {
    subjectSamples.push({
      otu_id: subjectData.otu_ids[i],
      otu_label: subjectData.otu_labels[i],
      sample_value: subjectData.sample_values[i]
    });
  }

  // sort in ascending order for the horizontal bar chart
  subjectSamples.sort((a, b) => a.sample_value - b.sample_value);

  // grab the 10 highest values
  let valueSlice = subjectSamples.slice(-10).map(a => a.sample_value);
  let idSlice = subjectSamples.slice(-10).map(a => 'OTU ' + a.otu_id);

  let plotData = [{
    x: valueSlice,
    y: idSlice,
    type: 'bar',
    orientation: 'h'
  }];
  var layout;
  if (noData) {
    layout = {
      title: `<b>No Sample Data for Test Subject ${bbData.names[subjectIndex]}</b>`
    };
  } else {
    layout = {
      title: `<b>Top 10 OTUs for Test Subject ${bbData.names[subjectIndex]}</b>`
    };
  }

  Plotly.newPlot('bar', plotData, layout);
}

// draw the demographic data box for test subject at index subjectIndex in bbData
function drawDemoData (subjectIndex) {
  // prepare the data to put in the panel
  console.log('Drawing panel for meta data: ', subjectIndex, bbData.metadata[subjectIndex]);
  let meta = bbData.metadata[subjectIndex];
  let data = [];
  for (const [key, value] of Object.entries(meta)) {
    data.push(`${key}: ${value}`);
  }
  console.log('metadata: ', data);

  let panel = d3.select('#sample-metadata');
  // remove any existing data in the panel
  panel.selectAll('p').remove();
  // put the data in the panel
  let paragraphs = panel.selectAll('p').data(data).enter().append('p');
  paragraphs.text(function (d) {
    return d;
  });
}

// generate a random hex color
// function credit to https://www.educative.io/answers/how-to-generate-a-random-color-in-javascript
function generateRandomColor () {
  let maxVal = 0xFFFFFF; // 16777215
  let randomNumber = Math.random() * maxVal;
  randomNumber = Math.floor(randomNumber);
  randomNumber = randomNumber.toString(16);
  let randColor = randomNumber.padStart(6, 0);
  return `#${randColor.toUpperCase()}`;
}

// draw a bubble chart of bacteria samples for test subject at index subjectIndex in bbData
function drawBubbleChart (subjectIndex) {
  let subjectData = bbData.samples[subjectIndex];
  let colors = [];
  let noData = false;
  if (subjectData.sample_values.length === 0) { noData = true; }

  // generate a random color for each sample bubble
  for (let i = 0; i < subjectData.otu_ids.length; i++) {
    colors.push(generateRandomColor());
  }

  let plotData = [{
    x: subjectData.otu_ids,
    y: subjectData.sample_values,
    text: subjectData.otu_labels,
    mode: 'markers',
    marker: {
      size: subjectData.sample_values,
      color: colors
    }
  }];

  var layout;
  if (noData) {
    layout = {
      title: `<b>No Sample Data for Test Subject ${bbData.names[subjectIndex]}</b>`
    };
  } else {
    layout = {
      title: `<b>Bacteria Samples for Test Subject ${bbData.names[subjectIndex]}</b>`
    };
  }

  Plotly.newPlot('bubble', plotData, layout);
}

// draw a gauge of washing frequency for test subject at index subjectIndex in bbData
function drawGauge (subjectIndex) {
  let scrubs = bbData.metadata[subjectIndex].wfreq;
  let subject = bbData.metadata[subjectIndex].id;
  var data = [
    {
      domain: { x: [0, 1], y: [0, 1] },
      value: scrubs,
      title: `<b>Belly Button Washing Frequency</b><br> For Test Subject ${subject}<br> (Scrubs Per Week)`,
      type: 'indicator',
      mode: 'gauge+number',
      gauge: { axis: { range: [null, 10] } }
    }
  ];
  var layout = { width: 600, height: 400};
  Plotly.newPlot('gauge', data, layout);
}

// draw the dashboard by calling each element
function drawDashboard (i) {
  drawDemoData(i);
  drawBarChart(i);
  drawBubbleChart(i);
  drawGauge(i);
}
