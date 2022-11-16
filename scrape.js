// inspired from https://github.com/yuiseki/twiseki/blob/master/user.js
const puppeteer = require('puppeteer');
const yargs = require("yargs");
const fs = require("fs");

yargs
  .scriptName("twiseki")
  .usage("$0 <cmd> [args]")
  .command(
    "tweet url",
    "Download tweet",
    (yargs) => {},
    async (argv) => {
      const { url } = argv;
      const tweet = await getTweet(url);
      console.log(JSON.stringify(tweet));
    }
  ).argv;

async function getTweet(url) {
  let result = {};
  async function getTimelineRes(response){
    try {
      if (response.url().indexOf("TweetDetail") >= 0){
         const text = await response.text();
         const json = JSON.parse(text);
         json.data.threaded_conversation_with_injections_v2.instructions.forEach(instruction => {
           if (instruction.type == "TimelineAddEntries") {
             instruction.entries.forEach(entry => {
               if (!!entry.content.itemContent && !!entry.content.itemContent.tweet_results) {
                Object.assign(result, entry.content.itemContent.tweet_results.result.legacy);
               }
             })
          }
         })
      }
    } catch (error) {
    }
  }
  browser = await puppeteer.launch();
  const [page] = await browser.pages();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36"
  )
  try {
    if (fs.readFileSync("credentials/cookies.json")) {
      const cookies = JSON.parse(fs.readFileSync("credentials/cookies.json", 'utf-8'));
      for (let cookie of cookies) {
        await page.setCookie(cookie);
      }
    }

  } catch {
    const secret = JSON.parse(fs.readFileSync("credentials/idpass.json"))

    await page.goto('https://twitter.com/login');

    await page.waitForNavigation()

    await page.screenshot({ path: "login.png" })
    await page.waitForSelector('input[autocomplete="username"]', { timeout: 0 });
    await page.type('input[autocomplete="username"]', secret.username)
    await page.keyboard.press('Enter');
    await page.screenshot({path: "login-visible.png"})

    await page.waitForSelector('input[autocomplete="current-password"]');
    await page.type('input[autocomplete="current-password"]', secret.password)
    await page.click('div[tabindex="0"][role="button"][data-testid="LoginForm_Login_Button"]');
    const afterCookies = await page.cookies();
    await fs.writeFileSync("credentials/cookies.json", JSON.stringify(afterCookies));
  }

  page.on('response', getTimelineRes);
  await page.goto(url, {waitUntil: 'networkidle2'});
  await browser.close();
  return result;
}
