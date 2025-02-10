async function loadMap() {
var broadbandData;
function getBroadbandData(searchCode){
  const response = await fetch("./broadbandNow.json")
  const jsonData = await response.json();
 // console.log(searchCode)
  for (let i = 0; i < jsonData.length; i++) {
    if (jsonData[i].Zip == searchCode){
      console.log(jsonData[i].AverageMbps)
      
      return jsonData[i];
    }
  }
  // Initialize Leaflet map
const map = L.map('map').setView([40.7128, -74.0060], 10); // Default to NYC

// Load Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load GeoJSON (Zip Code Boundaries)
fetch("nyczipcodes.geojson")
  .then(response => response.json())
  .then(data => {
    L.geoJson(data, {
      style: styleFeature, // Apply color based on broadband speed
      onEachFeature: onEachFeature // Enable popups on click
    }).addTo(map);
  });
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
        <b>Zip Code:</b> ${props.Zip}<br>
        <b>Avg Speed:</b> ${props.AverageMbps} Mbps<br>
        <b>Providers (25 Mbps+):</b> ${props.Wired25_3_2020}<br>
        <b>Providers (100 Mbps+):</b> ${props.Wired100_3_2020}<br>
        <b>Access to Broadband:</b> ${props['%Access to Terrestrial Broadband']}%
      `).openPopup();
    }
  });
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
