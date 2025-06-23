const { initDriver, getDriver, quitDriver } = require("../../../utils/helpers");
const { click,clickWithAutoScroll, typeInInput } = require("../../../utils/mainfunction");
const { clickContinue, clickBack } = require("../../../utils/commonfunction");
const { enablePlayStore, disablePlayStore } = require("../../../utils/ChangeCountry");
const path = require("path");
const { clickElement, waitForElement } = require("../../../utils/elementUtils");
const { remote } = require("webdriverio");
const appiumConfig = require(path.resolve(__dirname, "../../../../config/appium.config"));
const {testFullClickFlow} = require("../../../utils/checkSubjects");




const intro = require("../../elements/onboarding/intro");
const role = require("../../elements/onboarding/role");
const school = require("../../elements/onboarding/school");
const homepagebar = require("../../elements/home/bottomBar");
const filter = require("../../elements/home/filter");
const subject = require("../../elements/home/subjects");
const onboardingIntro = require(path.resolve(__dirname, "../../elements/onboarding/onboardingintro"));




async function home_bottom_bar_clicks() {
  const driver = await initDriver();
//  const driver = await remote({
//   ...appiumConfig.server,
//   capabilities: {
//     alwaysMatch: {
//       ...appiumConfig.capabilities,
//       "appium:noReset": true,
//       "appium:fullReset": false 
//     },
//     firstMatch: [{}],
//   },
// });

  try {
    await clickElement(driver, onboardingIntro.allow.path);
    await click(intro.letsgo, { print: true });
    await click(role.student, { print: true });
    clickContinue();
    await click(school.skip, { delay: 5000 });
    await click("LOWER PRIMARY SCHOOL");
    await click("4");
    clickContinue();
    await click("MATHEMATICS",{delay: 5000});
    clickContinue();
    driver.pause(5000);

    await click("Home", { print: true });
    await click("Scan", { print: true });
    await click("Assignments", { print: true });
    await click("Search", { print: true });
    await click("Bookmarks", { print: true });
    await click("Scan", { print: true });
    await click("Assignments", { print: true });
    await click("Search", { print: true });
    await click("Home", { print: true });

    driver.pause(5000);
    console.log("Test Started");

    await testFullClickFlow({
      maxSubjects: 4,
      maxChapters: 2,
      maxSections: 2,
      maxLessons: 2,
      language: "en",
      country: "IN",
      delay : 800 
    })




  } catch (error) {
    console.error(error);
  }
}

if (require.main === module) {
  (async () => {
    await home_bottom_bar_clicks();
  })();
}

module.exports = {
  home_bottom_bar_clicks,
};