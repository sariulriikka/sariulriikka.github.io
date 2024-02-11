// Function to fetch and process data from 'data.json'
async function fetchData() {
   try {
      const response = await fetch('data.json');
      const data = await response.json();
      return data;
   } catch (error) {
      console.error('Error fetching data:', error);
   }
}

// Function to fetch and process constants from 'constants.json'
async function fetchConstants() {
   try {
      const response = await fetch('constants.json');
      const data = await response.json();
      return data;
   } catch (error) {
      console.error('Error fetching data:', error);
   }
}

async function initialize() {

   const data = await fetchConstants();
   if (!data) return;

   const potTypeDropdown = document.getElementById("potType");
   const plantTypeDropdown = document.getElementById("plantType");
   const seasonDropdown = document.getElementById("season");

   let len = data.length;
   for (let i = 0; i < len; i++) {

      if (data[i].datatype === "pot") {

         var option = document.createElement("option");
         option.text = data[i].name;
         option.value = data[i].name;
         potTypeDropdown.add(option);

      } else if (data[i].datatype === "species") {

         var option = document.createElement("option");
         option.text = data[i].name;
         option.value = data[i].name;
         plantTypeDropdown.add(option);

      } else if (data[i].datatype === "season") {

         var option = document.createElement("option");
         option.text = data[i].name;
         option.value = data[i].name;
         seasonDropdown.add(option);

      }

   }

}

function calculatePotVolume(diameter, height) {
   const radius = diameter / 2;
   return Math.PI * Math.pow(radius, 2) * height;
}

//Function to calculate water and fertilizer recommendations
async function calculateRecommendations(potVolume, potType, season) {

   if (potVolume == 0) {
      document.getElementById('recommendedWater').textContent = `0 liters`;
      document.getElementById('recommendedFertilizer').textContent = `0 units`;
      return;
   }

   const data = await fetchConstants();
   if (!data) {
      return;
   }

   let potdata;
   let seasondata;

   let len = data.length;
   for (let i = 0; i < len; i++) {

      if (data[i].datatype === "pot" && data[i].name === potType) {
         potdata = data[i];
      }

      if (data[i].datatype === "season" && data[i].name === season) {
         seasondata = data[i];
      }

   }

   let water = potVolume * 0.0001 * potdata.datafield_1 * seasondata.datafield_1;
   let fertilizer = water * seasondata.datafield_2;

   document.getElementById('recommendedWater').textContent = `${water.toFixed(1)} liters`;
   document.getElementById('recommendedFertilizer').textContent = `${fertilizer.toFixed(2)} units`;
}

// Function to search recommendations data and calculate statistics based on it and user inputs
async function findStatistics(potVolume, potType, plantType, season) {
   const data = await fetchData();
   if (!data) {
      return;
   }

   let potVolumeMaxLimit = (potVolume * 1.1);
   let potVolumeMinLimit = (potVolume * 0.9);

   let similarCount = 0;

   let similarwaterCount = 0;
   let similarwaterGrowthSum = 0;
   let similarwaterYieldSum = 0;

   let lesswaterCount = 0;
   let lesswaterGrowthSum = 0;
   let lesswaterYieldSum = 0;

   let morewaterCount = 0;
   let morewaterGrowthSum = 0;
   let morewaterYieldSum = 0;


   // find similar cases
   if (potVolume != 0) {
      let len = data.length;
      for (let i = 0; i < len; i++) {

         if (data[i].pot_volume > potVolumeMinLimit
            && data[i].pot_volume < potVolumeMaxLimit
            && data[i].pot_type === potType
            && data[i].plant_type === plantType
            && data[i].time_of_year === season) {

            similarCount++;

            if (data[i].actual_water > (data[i].recommented_water * 0.9)
               && data[i].actual_water < (data[i].recommented_water * 1.1)) {

               similarwaterCount++;
               similarwaterGrowthSum = similarwaterGrowthSum + data[i].growth_rate;
               similarwaterYieldSum = similarwaterYieldSum + data[i].crop_yield;

            } else if (data[i].actual_water <= (data[i].recommented_water * 0.9)) {

               lesswaterCount++;
               lesswaterGrowthSum = lesswaterGrowthSum + data[i].growth_rate;
               lesswaterYieldSum = lesswaterYieldSum + data[i].crop_yield;

            } else {

               morewaterCount++;
               morewaterGrowthSum = morewaterGrowthSum + data[i].growth_rate;
               morewaterYieldSum = morewaterYieldSum + data[i].crop_yield;

            }

         }
      }
   }

   // print similar cases sums

   document.getElementById('similar').textContent = similarCount;

   document.getElementById('similarwaterCount').textContent = similarwaterCount;
   document.getElementById('similarwaterGrowthAverage').textContent = similarwaterCount ? (similarwaterGrowthSum / similarwaterCount).toFixed(1) : "-";
   document.getElementById('similarwaterYieldAverage').textContent = similarwaterCount ? (similarwaterYieldSum / similarwaterCount).toFixed(1) : "-";

   document.getElementById('lesswaterCount').textContent = lesswaterCount;
   document.getElementById('lesswaterGrowthAverage').textContent = lesswaterCount ? (lesswaterGrowthSum / lesswaterCount).toFixed(1) : "-";
   document.getElementById('lesswaterYieldAverage').textContent = lesswaterCount ? (lesswaterYieldSum / lesswaterCount).toFixed(1) : "-";

   document.getElementById('morewaterCount').textContent = morewaterCount;
   document.getElementById('morewaterGrowthAverage').textContent = morewaterCount ? (morewaterGrowthSum / morewaterCount).toFixed(1) : "-";
   document.getElementById('morewaterYieldAverage').textContent = morewaterCount ? (morewaterYieldSum / morewaterCount).toFixed(1) : "-";

   let outputSection = document.getElementById("outputSection");
   outputSection.style.display = "block";
}

// Event listener for the calculate button
document.getElementById('calculateButton').addEventListener('click', function () {

   // Validate input fields
   if (!document.forms.inputForm.checkValidity()) {
      return;
   }

   const potType = document.getElementById('potType').value;
   const potDiameter = parseFloat(document.getElementById('potDiameter').value);
   const potHeight = parseFloat(document.getElementById('potHeight').value);
   const plantType = document.getElementById('plantType').value;
   const season = document.getElementById('season').value;


   // Calculate pot volume (if needed in your logic)
   const potVolume = calculatePotVolume(potDiameter, potHeight);
   document.getElementById('potSize').textContent = (potVolume / 1000).toFixed(1);

   // Find and display recommendations and statistics
   calculateRecommendations(potVolume, potType, season)
   findStatistics(potVolume, potType, plantType, season);
});
