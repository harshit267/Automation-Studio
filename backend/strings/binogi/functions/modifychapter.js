const fs = require('fs');
const path = require('path');

function buildMultilangStructure(data) {
  const result = {};

  data.forEach(subject => {
    const subjectTitles = subject.titles || {};
    const chapters = subject.chapters || [];
    const countries = subject.published_in || [];

    countries.forEach(country => {
      if (!result[country]) result[country] = [];
      
      const subjectEntry = {
        titles: subjectTitles,
        chapters: []
      };

      chapters.forEach(chapter => {
        const chapterEntry = {
          titles: chapter.titles || {},
          sections: []
        };

        chapter.sections?.forEach(section => {
          const sectionEntry = {
            titles: section.titles || {},
            lessons: []
          };

          section.lessons?.forEach(lesson => {
            sectionEntry.lessons.push({
              titles: lesson.titles || {}
            });
          });

          chapterEntry.sections.push(sectionEntry);
        });

        subjectEntry.chapters.push(chapterEntry);
      });

      result[country].push(subjectEntry);
    });
  });

  return result;
}

// Example usage
const filePath = path.join(__dirname, 'chapter_list.json');
const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const structuredData = buildMultilangStructure(jsonData);

fs.writeFileSync('multilang_countrywise_structure.json', JSON.stringify(structuredData, null, 2));
