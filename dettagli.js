const queryString=window.location.search
const urlParams=new URLSearchParams(queryString)
document.addEventListener("DOMContentLoaded",function(){
    document.getElementById("loader").style.display = "none"
    //const URLMeteo="https://api.open-meteo.com/v1/forecast?latitude="+urlParams.get("lat")+"&longitude="+urlParams.get("lon")+"&daily=temperature_2m_max,temperature_2m_min,rain_sum&current=wind_speed_10m,temperature_2m,precipitation&utm_source=chatgpt.com"
    const URLMeteo="https://api.open-meteo.com/v1/forecast?latitude="+urlParams.get("lat")+"&longitude="+urlParams.get("lon")+"&daily=weather_code,sunrise,sunset,temperature_2m_max,temperature_2m_min&hourly=relative_humidity_2m,weather_code,temperature_2m,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,wind_speed_10m,precipitation&current=relative_humidity_2m,weather_code,temperature_2m,wind_speed_10m,relative_humidity_2m,is_day,rain,cloud_cover,is_day&utm_source=chatgpt.com"
    fetch(URLMeteo)
        .then(response => response.json())
        .then(meteo =>{
            console.log(meteo)
            const nomeComune=document.getElementById("NomeComune")
            const temperaturaAttuale=document.getElementById("Temperatura")
            const indiceOra=meteo.hourly.time.indexOf(getFormattedDate());
            const icona=document.getElementById("icona")
            const tempMaxMinVento=document.getElementById("TempMaxMin")
            const orari=document.getElementsByClassName("orario")
            const temperature=document.getElementsByClassName("TemperaturaOra")
            const icone=document.getElementsByClassName("icone")
            const descrizioneMeteo=document.getElementById("descrizioneGenerale")
            const titolo=document.getElementById("titolo")
            const clock=document.getElementById("clock")
            const lastUpdate=document.getElementById("LastUpdate")
            let cloudiness
            let precipitation
            let isDay
            let day=0
            let weatherCode
            nomeComune.innerHTML=urlParams.get("comune")
            titolo.innerHTML="Meteo dettagliato - "+urlParams.get("comune")
            setInterval(function(){
                clock.innerHTML = new Date().toLocaleString();}
            , 1000);
            lastUpdate.innerHTML="Ultima Rilevazione: "+meteo.current.time

            
            if (meteo.current.time === getFormattedDate()){
                temperaturaAttuale.innerHTML=meteo.current.temperature_2m+"°C"
                weatherCode==meteo.current.weather_code
                //cloudiness=meteo.current.cloud_cover
                //precipitation=meteo.current.precipitation
                isDay=meteo.current.is_day
                tempMaxMinVento.innerHTML="Max: "+meteo.daily.temperature_2m_max[0]+"°C - Min: "+meteo.daily.temperature_2m_min[0]+"°C"+" - Vento: "+meteo.current.wind_speed_10m+" km/h<br>Umidità: "+meteo.current.relative_humidity_2m+"%"
            }
            else{
                temperaturaAttuale.innerHTML=meteo.hourly.temperature_2m[indiceOra]+"°C"
                weatherCode=meteo.hourly.weather_code[indiceOra]
                tempMaxMinVento.innerHTML="Max: "+meteo.daily.temperature_2m_max[0]+"°C - Min: "+meteo.daily.temperature_2m_min[0]+"°C"+" - Vento: "+meteo.hourly.wind_speed_10m[indiceOra]+" km/h<br>Umidità: "+meteo.hourly.relative_humidity_2m[indiceOra]+"%"
                //cloudiness=meteo.hourly.cloud_cover[indiceOra]
                //precipitation=meteo.hourly.precipitation[indiceOra] 
                while(meteo.daily.sunrise[day].substring(0,10)===getFormattedDate().substring(0,10)){
                    day++
                }
                if(getFormattedDate()>=meteo.daily.sunrise[day-1] && getFormattedDate()<meteo.daily.sunset[day-1]){
                    isDay=1
                }
                else{
                    isDay=0
                }
            }
            
            if(weatherCode===0){
                if(isDay==1)
                    icona.src="img/sereno.png"
                else
                    icona.src="img/serenoNot.png"
                descrizioneMeteo.innerHTML="Sereno"
            }
            else if(weatherCode===1 || weatherCode===2 || weatherCode===3){
                if(isDay==1)
                    icona.src="img/parzialmenteNuv.png"
                else
                    icona.src="img/parzialmenteNuvNot.png"
                descrizioneMeteo.innerHTML="Parzialmente nuvoloso"
            }
            else if(weatherCode>=45 && weatherCode<=48){
                    icona.src="img/nebbia.png"
                    descrizioneMeteo.innerHTML="Nebbia"
            }
            else if((weatherCode>=51 && weatherCode<=57) || (weatherCode>=61 && weatherCode<=67) || (weatherCode>=80 && weatherCode<=82)){
                icona.src="img/pioggia.png"
                descrizioneMeteo.innerHTML="Pioggia"
            }
            else if((weatherCode>=71 && weatherCode<=77) || (weatherCode>=85 && weatherCode<=86)){
                icona.src="img/neve.png"
                descrizioneMeteo.innerHTML="Neve"
            }
            else if(weatherCode>=95){
                icona.src="img/temporale.png"
                descrizioneMeteo.innerHTML="Temporale"
            }
            else{
                icona.src="img/nuvoloso.png"
                descrizioneMeteo.innerHTML="Nuvoloso"
            }
            /*
            if(precipitation>0){
                icona.src="img/pioggia.png"
                descrizioneMeteo.innerHTML="Pioggia"
            }
            else if(cloudiness<=20){
                if(isDay==1)
                    icona.src="img/sereno.png"
                else
                    icona.src="img/serenoNot.png"
                descrizioneMeteo.innerHTML="Sereno"
            }
            else if(cloudiness>20 && cloudiness<=50){
                if(isDay==1)
                    icona.src="img/parzialmenteNuv.png"
                else
                    icona.src="img/parzialmenteNuvNot.png"
                descrizioneMeteo.innerHTML="Parzialmente nuvoloso"
            }
            else if(cloudiness>50){
                icona.src="img/nuvoloso.png"
                descrizioneMeteo.innerHTML="Nuvoloso"
            }
            */
            
            console.log(getFormattedDate());
            
            console.log(indiceOra);
            
            //previsioni ore successive
            for(let i=0;i<orari.length;i++)
            {
                orari[i].innerHTML=meteo.hourly.time[indiceOra+1+i].substring(11,16)
                temperature[i].innerHTML=meteo.hourly.temperature_2m[indiceOra+1+i]+"°C"
                let idx=indiceOra+1+i
                let secondiAlba=(parseInt(meteo.daily.sunrise[day].substring(11,13))+1)*3600+meteo.daily.sunrise[day].substring(14,16)*60
                let secondiTramonto=(parseInt(meteo.daily.sunset[day].substring(11,13))+1)*3600+meteo.daily.sunset[day].substring(14,16)*60
                
                


                if(meteo.hourly.precipitation[idx]>0){
                    icone[i].src="img/pioggia.png"
                }
                else if(meteo.hourly.cloud_cover[idx]<=20){
                    console.log("ora"+idx)
                    console.log("sunrise"+meteo.daily.sunrise[day].substring(11,13))
                    console.log("sunset"+meteo.daily.sunset[day].substring(11,13))
                    if(idx*3600>secondiAlba && idx*3600<secondiTramonto)
                        icone[i].src="img/sereno.png"
                    else
                        icone[i].src="img/serenoNot.png"
                }
                else if(meteo.hourly.cloud_cover[idx]>20 && meteo.hourly.cloud_cover[idx]<=50){
                    if(idx*3600>secondiAlba && idx*3600<secondiTramonto)
                        icone[i].src="img/parzialmenteNuv.png"
                    else
                        icone[i].src="img/parzialmenteNuvNot.png"
                }
                else if(meteo.hourly.cloud_cover[idx]>50){
                    icone[i].src="img/nuvoloso.png"
                }
            }

            //previsioni giorni successivi
            const giorniSettimana=["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"]
            const currentDay=new Date().getDay();
            const giorniSuccessivi=document.getElementsByClassName("sinistraGiorni")
            for (let i=0;i<5;i++)
            {
                giorniSuccessivi[i].innerHTML=giorniSettimana[(currentDay+1+i)%7]
            }
            const tempGiorniSuccessivi=document.getElementsByClassName("destraGiorni");
            const iconeGiorniSuccessivi=document.querySelectorAll(".centroGiorni img");
            for(let i=0;i<5;i++)
            {
                tempGiorniSuccessivi[i].innerHTML=meteo.daily.temperature_2m_min[i+1]+"°C / "+meteo.daily.temperature_2m_max[i+1]+"°C"
                let weatherCode=meteo.daily.weather_code[i+1]
                console.log("Giorno "+(i+1)+" code: "+weatherCode)
                if(weatherCode===0){
                    iconeGiorniSuccessivi[i].src="img/sereno.png"
                }
                else if(weatherCode===1 || weatherCode===2 || weatherCode===3){
                    iconeGiorniSuccessivi[i].src="img/parzialmenteNuv.png"
                }
                else if(weatherCode>=45 && weatherCode<=48){
                    iconeGiorniSuccessivi[i].src="img/nebbia.png"
                }
                else if((weatherCode>=51 && weatherCode<=57) || (weatherCode>=61 && weatherCode<=67) || (weatherCode>=80 && weatherCode<=82)){
                    iconeGiorniSuccessivi[i].src="img/pioggia.png"
                }
                else if((weatherCode>=71 && weatherCode<=77) || (weatherCode>=85 && weatherCode<=86)){
                    iconeGiorniSuccessivi[i].src="img/neve.png"
                }
                else if(weatherCode>=95){
                    iconeGiorniSuccessivi[i].src="img/temporale.png"
                }
                else{
                    iconeGiorniSuccessivi[i].src="img/nuvoloso.png"
                }
            }
        })
        
        document.getElementById("content").style.display = "block"
    
})
/* ⛅ ☀️ ☁ 🌧 🌦 ❄ 🌩 🌙*/
function getFormattedDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:00`;
}


