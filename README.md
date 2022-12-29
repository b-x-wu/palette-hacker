# Palette Hacker

This project originated as the final project for the Applied Internet Technology class at NYU with [Joe Versoza](https://cs.nyu.edu/~jversoza/).

## Overview

It's often the case when browsing the web that the color palette of a site is not what is desired. Sometimes, it could be late and the website's bright background hurts the eyes, or the website uses some red and green tints that make it difficult for users with Deuteranomaly to utilize.

Whatever the reason may be, Palette Hacker is a Chrome extension that allows you to modify the colors used in the CSS of a webpage. Color palette adjustments stay with the user, even if they leave and come back to a page. Users also have the option to submit the palette's they've made so other users can use the palette's they've created.

## Runbook

While this extension is not available on the Chrome Web store, the only way to run it is to deploy it locally to your own Chrome browser. Here are in the instructions to do so. You will still have accesses to the public database and endpoints as those are fully deployed.

1. `git clone` this project.
2. Navigate to [chrome://extensions/](chrome://extensions/) in Google Chrome
3. Click the 'Load Unpacked' button in the top left corner.
4. Navigate to the project's 'client' folder and select it.
5. Be sure that the extension is pinned in your extension manager in the top right corner of your broswer.

## Annotations / References Used

1. [How To Set Up a Node Project With Typescript - Digital Ocean](https://www.digitalocean.com/community/tutorials/setting-up-a-node-project-with-typescript)
2. [Reading time - Chrome Developers](https://developer.chrome.com/docs/extensions/mv3/getstarted/tut-reading-time/)
3. [Methods to get unique values from arrays in Javascript and their performance - Phi Bya](https://dev.to/phibya/methods-to-get-unique-values-from-arrays-in-javascript-and-their-performance-1da8)
4. [Getting Unique ClientId from Chrome Extension - Rob W](https://stackoverflow.com/questions/23822170/getting-unique-clientid-from-chrome-extension)
