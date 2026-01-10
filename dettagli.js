const queryString=window.location.search
const urlParams=new URLSearchParams(queryString)
document.addEventListener("DOMContentLoaded",function(){
    //const URLMeteo="https://api.open-meteo.com/v1/forecast?latitude="+urlParams.get("lat")+"&longitude="+urlParams.get("lon")+"&daily=temperature_2m_max,temperature_2m_min,rain_sum&current=wind_speed_10m,temperature_2m,precipitation&utm_source=chatgpt.com"
    const URLMeteo="https://api.open-meteo.com/v1/forecast?latitude="+urlParams.get("lat")+"&longitude="+urlParams.get("lon")+"&daily=temperature_2m_max,temperature_2m_min&hourly=temperature_2m,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,wind_speed_10m,precipitation&current=temperature_2m,wind_speed_10m,relative_humidity_2m,is_day,rain,cloud_cover&utm_source=chatgpt.com"
    fetch(URLMeteo)
        .then(response => response.json())
        .then(meteo =>{
            console.log(meteo)
            const nomeComune=document.getElementById("NomeComune")
            nomeComune.innerHTML=urlParams.get("comune")
            const temperaturaAttuale=document.getElementById("Temperatura")
            temperaturaAttuale.innerHTML=meteo.current.temperature_2m+"°C"
            const icona=document.getElementById("icona")
            icona.innerHTML="☀️"
            const tempMaxMin=document.getElementById("TempMaxMin")
            tempMaxMin.innerHTML="Max: "+meteo.daily.temperature_2m_max[0]+"°C- Min: "+meteo.daily.temperature_2m_min[0]+"°C"
        })
})
/* ⛅ ☀️ ☁ 🌧 🌦 ❄ 🌩 🌙*/
