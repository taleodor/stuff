// BASED ON
// Unfollow everyone on twitter.com, by Jamie Mason (https://twitter.com/fold_left)
// https://gist.github.com/JamieMason/7580315
//
// 1. Go to https://twitter.com/YOUR_USER_NAME/following
// 2. Open the Developer Console. (COMMAND+ALT+I on Mac)
// 3. Paste this into the Developer Console and run it
//
// Last Updated: 09 April 2020
(() => {
  const $followButtons = '[data-testid$="-unfollow"]';
  const $confirmButton = '[data-testid="confirmationSheetConfirm"]';
  const $userCells = '[data-testid="UserCell"]';
  const $whiteList = ['taleodor'];

  const retry = {
    count: 0,
    limit: 9,
  };

  const scrollToTheBottom = () => window.scrollTo(0, document.body.scrollHeight);
  const retryLimitReached = () => retry.count >  retry.limit - 1;
  const addNewRetry = () => retry.count++;

  const sleep = ({ seconds }) =>
    new Promise((proceed) => {
      console.log('WAITING FOR ${seconds} SECONDS...');
      setTimeout(proceed, seconds * 1000);
    });

  const unfollowAll = async (followButtons) => {
    console.log('UNFOLLOWING ' + followButtons.length + ' USERS...');
    await Promise.all(
      followButtons.map(async (followButton) => {
        followButton && followButton.click();
        await sleep({ seconds: 1 });
        const confirmButton = document.querySelector($confirmButton);
        confirmButton && confirmButton.click();
      })
    );
  };

  const nextBatch = async () => {
    scrollToTheBottom();
    await sleep({ seconds: 1 });

    const userCells = Array.from(document.querySelectorAll($userCells));
    const nonFollowBackUsers = Array.from(userCells).filter(el => {
      matches = !el.textContent.includes('Follows you');
      if (matches) {
        $whiteList.forEach(c => {
          if (matches) {
            matches = !el.textContent.toLowerCase().includes(c);
          }
        })
      }
      return matches;
    })
    let followButtons = []
    nonFollowBackUsers.forEach(u => followButtons.push(u.querySelector($followButtons)));
    console.log(followButtons.length);
    //const followButtons = Array.from(document.querySelectorAll($followButtons));
    const followButtonsWereFound = followButtons.length > 0;

    if (retryLimitReached()) {
      console.log('max number of iterations reached = ' + retry.limit);
    } else if (followButtonsWereFound) {
      await unfollowAll(followButtons);
      await sleep({ seconds: 2 });
      addNewRetry();
      return nextBatch();
    } else {
      console.log(`NO ACCOUNTS FOUND, SO I THINK WE'RE DONE`);
      console.log(`RELOAD PAGE AND RE-RUN SCRIPT IF ANY WERE MISSED`);
    }
  };

  nextBatch();
})();
