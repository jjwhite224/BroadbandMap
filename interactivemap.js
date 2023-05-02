var broadbandData;
async function getBroadbandData(searchCode){
  const response = await fetch("/broadbandNow.json")
  const jsonData = await response.json();
 // console.log(searchCode)
  for (let i = 0; i < jsonData.length; i++) {
    if (jsonData[i].Zip == searchCode){
      console.log(jsonData[i].AverageMbps)
      
      return jsonData[i];
    }
  }
  
}
window.onload = async function getBounds(){
  
//import("/node_modules/@vanillaes/csv/index.js")
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

