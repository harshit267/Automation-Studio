const fs = require('fs');
const path = require('path');


const subjectsJson = require('../getallsubjects.json'); 

function groupSubjectsByCountry(subjectsJson) {
  const countrySubjectsMap = {};

  for (const subject of subjectsJson) {
    const countries = subject.published_in || [];
    for (const country of countries) {
      if (!countrySubjectsMap[country]) {
        countrySubjectsMap[country] = [];
      }
      countrySubjectsMap[country].push({
        id: subject.id,
        code: subject.code,
        titles: subject.titles
      });
    }
  }

  return countrySubjectsMap;
}


const groupedData = groupSubjectsByCountry(subjectsJson);


const outputPath = path.join(__dirname, 'subjects_by_country.json');
fs.writeFileSync(outputPath, JSON.stringify(groupedData, null, 2), 'utf8');

console.log('✅ Data saved to subjects_by_country.json');
