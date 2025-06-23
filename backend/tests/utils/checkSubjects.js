const { click, clickWithAutoScroll } = require("./mainfunction");
const { clickBack } = require("./commonfunction");
const fs = require("fs");
const path = require("path");

const subjectsData = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../../strings/binogi/functions/chapter_list.json"), "utf-8")
);


async function testFullClickFlow({
    maxSubjects = 5,
    maxChapters = 3,
    maxSections = 2,
    maxLessons = 2,
    language = "en",
    country = "IN"
}) {
    const filteredSubjects = subjectsData.filter(subject =>
        subject.published_in.includes(country)
    );

    for (let si = 0; si < Math.min(filteredSubjects.length, maxSubjects); si++) {
        const subject = filteredSubjects[si];
        const subjectTitle = subject.titles?.[language] || subject.titles?.en;
        if (!subjectTitle || !subject.chapters?.length) continue;

        for (let ci = 0; ci < Math.min(subject.chapters.length, maxChapters); ci++) {
            const chapter = subject.chapters[ci];
            const chapterTitle = chapter.titles?.[language] || chapter.titles?.en;
            if (!chapterTitle) continue;

            const sections = chapter.sections || [];
            const hasSections = sections.length > 0;

            if (hasSections) {
                for (let secIdx = 0; secIdx < Math.min(sections.length, maxSections); secIdx++) {
                    const section = sections[secIdx];
                    const sectionTitle = section.titles?.[language] || section.titles?.en;
                    if (!sectionTitle || !section.lessons?.length) continue;

                    const lessons = section.lessons;
                    for (let li = 0; li < Math.min(lessons.length, maxLessons); li++) {
                        const lesson = lessons[li];
                        const lessonTitle = lesson.titles?.[language] || lesson.titles?.en;
                        if (!lessonTitle) continue;

                        // 🧭 Navigate: subject > chapter > section > lesson
                        console.log(`➡️ Subject: ${subjectTitle} → Chapter: ${chapterTitle} → Section: ${sectionTitle} → Lesson: ${lessonTitle}`);
                        await clickWithAutoScroll(subjectTitle, { language, print: true });
                        await clickWithAutoScroll(chapterTitle, { language, print: true });
                        try {
                            await clickWithAutoScroll(sectionTitle, { language, print: true});
                            await clickWithAutoScroll(lessonTitle, { language, print: true ,maxScrolls:1 });
                        }
                        catch (err) {
                            try {
                                await clickWithAutoScroll(sectionTitle, { language, print: true });
                                await clickWithAutoScroll(lessonTitle, { language, print: true });
                            }
                            catch (finalerr) {
                                continue;
                            }
                        }

                            // 👈 Go back to subject list
                            await click("Home", { delay: 2000, print: true });
                        
                    }
                }
                } else {
                    // Handle direct lessons under chapter
                    const lessons = (chapter.lessons || []).filter(l => l.free_in.includes(country));
                    for (let li = 0; li < Math.min(lessons.length, maxLessons); li++) {
                        const lesson = lessons[li];
                        const lessonTitle = lesson.titles?.[language] || lesson.titles?.en;
                        if (!lessonTitle) continue;

                        // 🧭 Navigate: subject > chapter > lesson
                        console.log(`➡️ Subject: ${subjectTitle} → Chapter: ${chapterTitle} → Lesson: ${lessonTitle}`);
                        await clickWithAutoScroll(subjectTitle, { language, print: true });
                        await clickWithAutoScroll(chapterTitle, { language, print: true });
                        await clickWithAutoScroll(lessonTitle, { language, print: true });

                        // 👈 Go back to subject list
                        await click("Home", { delay: 2000, print: true });
                    }
                }
            }
        }
    }


    // async function testFullClickFlow({
    //   maxSubjects = 5,
    //   maxChapters = 3,
    //   maxSections = 2,
    //   maxLessons = 2,
    //   language = "en",
    //   country = "IN",
    //   delay = 500 
    // }) {
    //   const filteredSubjects = subjectsData.filter(subject =>
    //     subject.published_in.includes(country)
    //   );

    //   for (let si = 0; si < Math.min(filteredSubjects.length, maxSubjects); si++) {
    //     const subject = filteredSubjects[si];
    //     const subjectTitle = subject.titles?.[language] || subject.titles?.en;
    //     if (!subjectTitle || !subject.chapters?.length) continue;

    //     for (let ci = 0; ci < Math.min(subject.chapters.length, maxChapters); ci++) {
    //       const chapter = subject.chapters[ci];
    //       const chapterTitle = chapter.titles?.[language] || chapter.titles?.en;
    //       if (!chapterTitle) continue;

    //       const sections = chapter.sections || [];
    //       const hasSections = sections.length > 0;

    //       if (hasSections) {
    //         for (let secIdx = 0; secIdx < Math.min(sections.length, maxSections); secIdx++) {
    //           const section = sections[secIdx];
    //           const sectionTitle = section.titles?.[language] || section.titles?.en;
    //           if (!sectionTitle || !section.lessons?.length) continue;

    //           const lessons = section.lessons.filter(l => l.free_in.includes(country));
    //           for (let li = 0; li < Math.min(lessons.length, maxLessons); li++) {
    //             const lesson = lessons[li];
    //             const lessonTitle = lesson.titles?.[language] || lesson.titles?.en;
    //             if (!lessonTitle) continue;

    //             console.log(`➡️ Subject: ${subjectTitle} → Chapter: ${chapterTitle} → Section: ${sectionTitle} → Lesson: ${lessonTitle}`);

    //             try {
    //               await clickWithAutoScroll(subjectTitle, { language, print: true , delay });
    //               await clickWithAutoScroll(chapterTitle, { language, print: true , delay });
    //               await clickWithAutoScroll(sectionTitle, { language, print: true , delay });
    //               await clickWithAutoScroll(lessonTitle, { language, print: true , delay });

    //               await click("Home", { delay: 2000, print: true });
    //             } catch (err) {
    //               console.warn(`❌ Skipped due to error: ${err.message}`);
    //               await click("Home", { delay: 2000 }); // recover if stuck
    //               continue;
    //             }
    //           }
    //         }
    //       } else {
    //         const lessons = (chapter.lessons || []).filter(l => l.free_in.includes(country));
    //         for (let li = 0; li < Math.min(lessons.length, maxLessons); li++) {
    //           const lesson = lessons[li];
    //           const lessonTitle = lesson.titles?.[language] || lesson.titles?.en;
    //           if (!lessonTitle) continue;

    //           console.log(`➡️ Subject: ${subjectTitle} → Chapter: ${chapterTitle} → Lesson: ${lessonTitle}`);

    //           try {
    //             await clickWithAutoScroll(subjectTitle, { language, print: true , delay });
    //             await clickWithAutoScroll(chapterTitle, { language, print: true , delay });
    //             await clickWithAutoScroll(lessonTitle, { language, print: true , delay });

    //             await click("Home", { delay: 2000, print: true });
    //           } catch (err) {
    //             console.warn(`❌ Skipped due to error: ${err.message}`);
    //             await click("Home", { delay: 2000 });
    //             continue;
    //           }
    //         }
    //       }
    //     }
    //   }
    // }

    module.exports = {
        testFullClickFlow,
    };




























// const { click, clickWithAutoScroll } = require("./mainfunction");
// const { clickBack } = require("./commonfunction");
// const fs = require("fs");
// const path = require("path");

// const subjectsData = JSON.parse(
//   fs.readFileSync(path.resolve(__dirname, "../../strings/binogi/functions/chapter_list.json"), "utf-8")
// );

// async function testFullClickFlow({
//   maxSubjects = 5,
//   maxChapters = 3,
//   maxSections = 2,
//   maxLessons = 2,
//   language = "en",
//   country = "IN"
// }) {
//   const filteredSubjects = subjectsData.filter(subject =>
//     subject.published_in.includes(country)
//   );

//   for (let si = 0; si < Math.min(filteredSubjects.length, maxSubjects); si++) {
//     const subject = filteredSubjects[si];
//     const subjectTitle = subject.titles?.[language] || subject.titles?.en;
//     if (!subjectTitle || !subject.chapters?.length) continue;

//     for (let ci = 0; ci < Math.min(subject.chapters.length, maxChapters); ci++) {
//       const chapter = subject.chapters[ci];
//       const chapterTitle = chapter.titles?.[language] || chapter.titles?.en;
//       if (!chapterTitle) continue;

//       const sections = chapter.sections || [];
//       const hasSections = sections.length > 0;

//       if (hasSections) {
//         for (let secIdx = 0; secIdx < Math.min(sections.length, maxSections); secIdx++) {
//           const section = sections[secIdx];
//           const sectionTitle = section.titles?.[language] || section.titles?.en;
//           if (!sectionTitle || !section.lessons?.length) continue;

//           const lessons = section.lessons.filter(l => l.free_in.includes(country));
//           for (let li = 0; li < Math.min(lessons.length, maxLessons); li++) {
//             const lesson = lessons[li];
//             const lessonTitle = lesson.titles?.[language] || lesson.titles?.en;
//             if (!lessonTitle) continue;

//             // 🧭 Navigate: subject > chapter > section > lesson
//             console.log(`➡️ Subject: ${subjectTitle} → Chapter: ${chapterTitle} → Section: ${sectionTitle} → Lesson: ${lessonTitle}`);
//             await clickWithAutoScroll(subjectTitle, { language, print: true });
//             await clickWithAutoScroll(chapterTitle, { language, print: true });
//             await clickWithAutoScroll(sectionTitle, { language, print: true });
//             await clickWithAutoScroll(lessonTitle, { language, print: true });

//             // 👈 Go back to subject list
//             await click("Home", { delay: 2000, print: true });
//           }
//         }
//       } else {
//         // Handle direct lessons under chapter
//         const lessons = (chapter.lessons || []).filter(l => l.free_in.includes(country));
//         for (let li = 0; li < Math.min(lessons.length, maxLessons); li++) {
//           const lesson = lessons[li];
//           const lessonTitle = lesson.titles?.[language] || lesson.titles?.en;
//           if (!lessonTitle) continue;

//           // 🧭 Navigate: subject > chapter > lesson
//           console.log(`➡️ Subject: ${subjectTitle} → Chapter: ${chapterTitle} → Lesson: ${lessonTitle}`);
//           await clickWithAutoScroll(subjectTitle, { language, print: true });
//           await clickWithAutoScroll(chapterTitle, { language, print: true });
//           await clickWithAutoScroll(lessonTitle, { language, print: true });

//           // 👈 Go back to subject list
//           await click("Home", { delay: 2000, print: true });
//         }
//       }
//     }
//   }
// }





























// const { click, clickWithAutoScroll } = require("./mainfunction");
// const { clickBack } = require("./commonfunction");
// const fs = require("fs");
// const path = require("path");

// const subjectsData = JSON.parse(
//     fs.readFileSync(path.resolve(__dirname, "../../strings/binogi/functions/chapter_list.json"), "utf-8")
// );

// async function testFullClickFlow({
//     maxSubjects = 5,
//     maxChapters = 3,
//     maxSections = 2,
//     maxLessons = 2,
//     language = "en",
//     country = "IN"
// }) {
//     let subjectIndex = 0;

//     const filteredSubjects = subjectsData.filter(subject =>
//         subject.published_in.includes(country)
//     );

//     for (const subject of filteredSubjects) {
//         if (subjectIndex++ >= maxSubjects) break;

//         const subjectTitle = subject.titles?.[language] || subject.titles?.en;
//         if (!subjectTitle) continue;

//         try {
//             console.log(`➡️ Clicking subject: ${subjectTitle}`);
//             await clickWithAutoScroll(subjectTitle, { language, print: true });

//             if (!subject.chapters || subject.chapters.length === 0) {
//                 console.warn(`⚠️ Subject "${subjectTitle}" has no chapters.`);
//                 await clickBack();
//                 continue;
//             }

//             for (let i = 0; i < Math.min(subject.chapters.length, maxChapters); i++) {
//                 const chapter = subject.chapters[i];
//                 const chapterTitle = chapter.titles?.[language] || chapter.titles?.en;
//                 if (!chapterTitle) continue;

//                 console.log(`📘 Clicking chapter: ${chapterTitle}`);
//                 await clickWithAutoScroll(chapterTitle, { language, print: true });

//                 const sections = chapter.sections || [];

//                 if (sections.length > 0) {
//                     for (let s = 0; s < Math.min(sections.length, maxSections); s++) {
//                         const section = sections[s];
//                         const sectionTitle = section.titles?.[language] || section.titles?.en;
//                         if (!sectionTitle) continue;

//                         console.log(`📂 Clicking section: ${sectionTitle}`);
//                         await clickWithAutoScroll(sectionTitle, { language, print: true });

//                         const lessons = (section.lessons || []).filter(l => l.free_in.includes(country));
//                         for (let l = 0; l < Math.min(lessons.length, maxLessons); l++) {
//                             const lesson = lessons[l];
//                             const lessonTitle = lesson.titles?.[language] || lesson.titles?.en;
//                             if (!lessonTitle) continue;

//                             console.log(`🎯 Clicking lesson: ${lessonTitle}`);
//                             await clickWithAutoScroll(lessonTitle, { language, print: true });

//                             // await clickBack(); 
//                             await click("Home", {delay:2000 ,print: true });

//                         }

//                         // await clickBack(); 
//                     }
//                 } else {
//                     // Handle lessons directly under chapter (no sections)
//                     const lessons = (chapter.lessons || []).filter(l => l.free_in.includes(country));
//                     for (let l = 0; l < Math.min(lessons.length, maxLessons); l++) {
//                         const lesson = lessons[l];
//                         const lessonTitle = lesson.titles?.[language] || lesson.titles?.en;
//                         if (!lessonTitle) continue;

//                         console.log(`🎯 Clicking lesson: ${lessonTitle}`);
//                         await clickWithAutoScroll(lessonTitle, { language, print: true });

//                         // await clickBack();
//                         await click("Home", {delay:2000 , print: true });

//                     }
//                 }

//                 // await clickBack();
//             }

//             // await clickBack();
//         } catch (err) {
//             console.error(`❌ Error while navigating subject "${subjectTitle}":`, err.message);
//         }
//     }
// }
