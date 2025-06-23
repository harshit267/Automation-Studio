const { initDriver, getDriver, quitDriver } = require("../../../utils/helpers");
const { click,clickWithAutoScroll, typeInInput } = require("../../../utils/mainfunction");
const { clickContinue, clickBack } = require("../../../utils/commonfunction");
const { enablePlayStore, disablePlayStore } = require("../../../utils/ChangeCountry");
const path = require("path");
const { clickElement, waitForElement } = require("../../../utils/elementUtils");
const { remote } = require("webdriverio");
const appiumConfig = require(path.resolve(__dirname, "../../../../config/appium.config"));
const {testFullClickFlow} = require("../../../utils/checkSubjects");


async function login() {
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
    await click("log in", { print: true });
    await click("log in with Google", { print: true });
    await click("gmail.com", { print: true });
  }
  catch (error) {
    console.error("An error occurred during the test:", error);
  }
};