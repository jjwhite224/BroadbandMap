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

        // Load Zip Code Boundaries GeoJSON
        const zipResponse = await fetch("usazipcodes.json");
        geoJsonLayer = await zipResponse.json();

        // Load Broadband Data
        const broadbandResponse = await fetch("broadbandNow.json");
        const broadbandData = await broadbandResponse.json();

        // Merge broadband data into GeoJSON features
        geoJsonLayer.features.forEach(feature => {
            let zip = feature.properties.ZCTA5CE20 // Ensure correct property
            let broadbandInfo = broadbandData.find(entry => entry.Zip == zip);

            if (broadbandInfo) {
                feature.properties.AverageMbps = broadbandInfo.AverageMbps || 0;
                feature.properties.Wired25_3_2020 = broadbandInfo.Wired25_3_2020 || "N/A";
                feature.properties.Wired100_3_2020 = broadbandInfo.Wired100_3_2020 || "N/A";
                feature.properties["%Access to Terrestrial Broadband"] = broadbandInfo["%Access to Terrestrial Broadband"] || "N/A";
            } else {
                feature.properties.AverageMbps = 0; // Default if no data
            }
        });

 // console.log(searchCode)
 

// Load GeoJSON (Zip Code Boundaries)

  geoJsonLayer = L.geoJson(geoJsonLayer, {
            style: styleFeature,
            onEachFeature: onEachFeature
        }).addTo(map);

    } catch (error) {
        console.error("Error loading map data:", error);
    }

  
}
  

function getColor(speed) {
  return speed > 100 ? '#19FF00' :  // Green (Well-served)
         speed > 25  ? '#FFF900' :  // Yellow (Underserved)
                       '#EFFF00';   // Red (Not served)
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
        <b>Zip Code:</b> ${props.ZCTA5CE20}<br>
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
    //let cleanedZip = zipInput.trim();                                                                                                                                                                                                           
    geoJsonLayer.eachLayer(layer => {
        console.log(layer.feature.properties.ZCTA5CE20)
        if (layer.feature && layer.feature.properties.ZCTA5CE20.toString() && 
            layer.feature.properties.ZCTA5CE20.toString() === zipInput) {
            foundFeature = layer;
        }
    });

    if (foundFeature) {
       console.log(foundFeature.feature.properties.ZCTA5CE20)
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
