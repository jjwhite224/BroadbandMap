
let map;
let geoJsonLayer;

async function loadMap() {
    try {
        // Initialize Leaflet map
        map = L.map('map').setView([40.7128, -74.0060], 10); // Default to NYC

        // Load Tile Layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Load the merged GeoJSON with broadband, income, and race data
        const response = await fetch("updated_geojson_with_race.geojson");
        geoJsonLayer = await response.json();
        console.log(geoJsonLayer);

        // Define color scale for dominant race
        function getRaceColor(race) {
            const raceColors = {
                "White": "#FFEDA0",
                "Black": "#FEB24C",
                "Native American": "#FD8D3C",
                "Asian": "#E31A1C",
                "Pacific Islander": "#BD0026",
                "Other Race": "#800026",
                "Two or More Races": "#6a51a3",
                "Two (excluding Other)": "#8856a7",
                "Three or More Races": "#8c6bb1"
            };
            return raceColors[race] || "#CCCCCC"; // Default gray for missing data
        }

        // Create Broadband Layer
        let broadBandLayer = L.geoJson(geoJsonLayer, {
            style: feature => ({
                fillColor: getColor(feature.properties.AverageMbps),
                weight: 2,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.7
            }),
            onEachFeature: onEachFeature
        }).addTo(map);

        // Create Income Layer
        let incomeLayer = L.geoJson(geoJsonLayer, {
            style: feature => ({
                fillColor: getIncomeColor(feature.properties["Per Capita Income"]),
                weight: 2,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.7
            }),
            onEachFeature: function (feature, layer) {
                layer.bindPopup(`
                    <b>Zip Code:</b> ${feature.properties.zipcode}<br>
                    <b>Median Income:</b> $${feature.properties["Per Capita Income"]}
                `);
            }
        });

        // Create Race Layer
        let raceLayer = L.geoJson(geoJsonLayer, {
            style: feature => ({
                fillColor: getRaceColor(feature.properties["Dominant Race"]),
                weight: 2,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.7
            }),
            onEachFeature: function (feature, layer) {
                layer.bindPopup(`
                    <b>Zip Code:</b> ${feature.properties.zipcode}<br>
                    <b>Dominant Race:</b> ${feature.properties["Dominant Race"]}
                `);
            }
        });
       let baseMaps = {}; // Empty for base layers
        let overlayMaps = {
            "Broadband Speeds": broadBandLayer,
            "Income Levels": incomeLayer,
           "Dominant Race": raceLayer
        };
        L.control.layers(baseMaps, overlayMaps).addTo(map);
let incomeLegend = L.control({ position: "bottomright" });

incomeLegend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend"),
        grades = [0, 25000, 50000, 75000, 100000],
        labels = [];

    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getIncomeColor(grades[i] + 1) + '"></i> ' +
            "$" + grades[i].toLocaleString() + (grades[i + 1] ? " - $" + grades[i + 1].toLocaleString() + "<br>" : "+");
    }
    return div;
};

incomeLegend.addTo(map);
    } catch (error) {
        console.error("Error loading map data:", error);
    }


  
}
  

function getColor(speed) {
  return speed > 100 ? '#19FF00' :  // Green (Well-served)
         speed > 25  ? '#FFF900' :  // Yellow (Underserved)
                       '#FF0000' ;  // Red (Not served)
}
function getIncomeColor(income) {
    return income > 100000 ? '#00441b' :  // Dark green (High income)
           income > 75000  ? '#238b45' :  // Medium green
           income > 50000  ? '#66c2a4' :  // Light green
           income > 25000  ? '#b2e2e2' :  // Very light green
                             '#edf8fb';   // Lightest color (Low income)
}
  // Define color scale for dominant race
        function getRaceColor(race) {
            const raceColors = {
                "White": "#FFEDA0",
                "Black": "#FEB24C",
                "Native American": "#FD8D3C",
                "Asian": "#E31A1C",
                "Pacific Islander": "#BD0026",
                "Other Race": "#800026",
                "Two or More Races": "#6a51a3",
                "Two (excluding Other)": "#8856a7",
                "Three or More Races": "#8c6bb1"
            };
            return raceColors[race] || "#CCCCCC"; // Default gray for missing data
        }

function styleIncome(feature) {
    return {
        fillColor: getIncomeColor(feature.properties["Per Capita Income"]),
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
}


function styleFeature(feature) {
  return {
    fillColor: getColor(feature.properties.AverageMbps), // Color by speed
    weight: 2,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}
function onEachFeature(feature, layer) {
  layer.on({
    click: function (e) {
      let props = feature.properties;
      layer.bindPopup(`
        <b>Zip Code:</b> ${props.zipcode}<br>
        <b>Avg Speed:</b> ${props.AverageMbps} Mbps<br>
        <b>Providers (25 Mbps+):</b> ${props.Wired25_3_2020}<br>
        <b>Providers (100 Mbps+):</b> ${props.Wired100_3_2020}<br>
        <b>Access to Broadband:</b> ${props['%Access to Terrestrial Broadband']}%
      `).openPopup();
    }
  });
}


function zoomToZip(zipInput) {
    let foundFeature = null; // Declare the variable outside
   zipInput = document.getElementById("zipInput").value.trim(); 
    //let cleanedZip = zipInput.trim(); 
   //console.log(cleandZip)
    geoJsonLayer.eachLayer(layer => {
        if (layer.feature && layer.feature.properties.zipcode.toString() && 
            layer.feature.properties.zipcode.toString() === zipInput) {
            foundFeature = layer;
           
        }
    });

    if (foundFeature) {
       console.log(foundFeature.feature.properties.zipcode)
        map.fitBounds(foundFeature.getBounds()); // Zoom to the ZIP code
        foundFeature.openPopup(); // Open the popup
    } else {
        alert("ZIP Code not found.");
    }
}
/*
window.onload = async function getBounds(){
  
import("/node_modules/@vanillaes/csv/index.js")
let location = prompt('Please enter your zipcode','ex. 10475');

    const response = await fetch("https://maps.googleapis.com/maps/api/geocode/json?address=USA "+location+"?&key=AIzaSyC9erufwduvSEHpPrn9yunNEKEW3WFSYs8");
    const jsonData = await response.json();
    console.log(jsonData);
    var corner1 = L.latLng(jsonData.results[0].geometry.bounds.northeast.lat, jsonData.results[0].geometry.bounds.northeast.lng),
corner2 = L.latLng(jsonData.results[0].geometry.bounds.southwest.lat,jsonData.results[0].geometry.bounds.southwest.lng),
bounds = L.latLngBounds(corner1, corner2);
const map = L.map('map', {
    center: bounds.getCenter(),
    
  });
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
  getBroadbandData(location).then(broadbandData => {
    let speed = broadbandData.AverageMbps;
    let numof25 = broadbandData.Wired25_3_2020;
    let numof100 = broadbandData.Wired100_3_2020;
    let percentacctoterrestialbb = broadbandData['%Access to Terrestrial Broadband']
    let lowestpricedplan = broadbandData["Lowest Priced Terrestrial Broadband Plan"]

    console.log(broadbandData)
    if (broadbandData.AverageMbps<25){
      var zipBox = L.rectangle(bounds,{color: "#EFFF00"}).addTo(map);
      zipBox.bindPopup("Average Download Speed(rolling yearly): "+speed.toString()+"Mbps"+"<br>Number of Wired Providers with at least 25Mbps: "+numof25.toString()+"<br>Number of Wired Providers with at least 100Mbps : "+numof100.toString()+"<br>Percent Acess to Terrestial Broadband: "+percentacctoterrestialbb+"<br>Lowest Priced Terrestial Broadband Plan : "+lowestpricedplan.toString())
      }
      if (broadbandData.AverageMbps>=25 && broadbandData.AverageMbps<= 100){
        var zipBox = L.rectangle(bounds,{color: "#FFF900"}).addTo(map);
        zipBox.bindPopup("Average Download Speed(rolling yearly): "+speed.toString()+"Mbps"+"<br>Number of Wired Providers with at least 25Mbps: "+numof25.toString()+"<br>Number of Wired Providers with at least 100Mbps : "+numof100.toString()+"<br>Percent Acess to Terrestial Broadband: "+percentacctoterrestialbb+"<br>Lowest Priced Terrestial Broadband Plan : "+lowestpricedplan.toString())
        }
        if (broadbandData.AverageMbps > 100){
          var zipBox = L.rectangle(bounds,{color: "#19FF00"}).addTo(map);
          zipBox.bindPopup("Average Download Speed(rolling yearly): "+speed.toString()+"Mbps"+"<br>Number of Wired Providers with at least 25Mbps: "+numof25.toString()+"<br>Number of Wired Providers with at least 100Mbps : "+numof100.toString()+"<br>Percent Acess to Terrestial Broadband: "+percentacctoterrestialbb+"<br>Lowest Priced Terrestial Broadband Plan : "+lowestpricedplan.toString())
        }

    
})
  
  map.fitBounds(bounds);
 

}
*/
// Load map on window load
window.onload = loadMap;
