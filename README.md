# Palette Hacker

## Overview

It's often the case when browsing the web that the color palette of a site is not what is desired. Sometimes, it could be late and the website's bright background hurts the eyes, or the website uses some red and green tints that make it difficult for users with Deuteranomaly to utilize.

Whatever the reason may be, Palette Hacker is a Chrome extension that allows you to modify the colors used in the CSS of a webpage. Color palette adjustments stay with the user, even if they leave and come back to a page. Users also have the option to submit the palette's they've made so other users can use the palette's they've created.

## Data Model

The application will store Users, Websites, and Palettes.

* Users can have multiple Palettes (via references)
* Websites can have multiple Palettes (via references)
* Palettes can only belong to a single user and a single website (via references) and contain many Swaps (via embedding)
* Swaps (representing a single color change) are contained in Palettes

An Example User:

```javascript
{
  username: "westingben",
  salt: "ji23ojoighhff", // a password salt
  hash: "afu829rfids903rjaf0", // a password hash
  palettes: [ // an array of references to Palette documents
    ObjectId(1249008104),
    ObjectId(0514958129)
  ]
}
```

An Example Website:

```javascript
{
  domain: "google.com",
  palettes: [ // an array of references to Palette documents
    ObjectId(1452345612),
    ObjectId(0514958129),
    ObjectId(1057461037)
  ]
}
```

An Example Palette:

```javascript
{
  user: ObjectId(1037141147), // a reference to a User document
  website: ObjectId(0540159329), // a reference to a Website document
  name: "Dark Mode",
  swaps: [ // an array of embedded Swap documents
    {
      selector: ".panel",
      property: "background-color",
      color: "#a2f113"
    }
  ]
}
```

## [Link to Commented First Draft Schema](./src/db.ts)

## Wireframes

/ - page to modify the current palette

![index](./documentation/main.png)

/\<domain\> - page displaying all the palettes published for this domain

![palettes available for website](./documentation/website_palettes.png)

/login - page to log in

![login](./documentation/login.png)

/register - page to register a new user

![register](./documentation/register.png)

/ (logged in) - page to modify the current palette for currently logged in users

![index logged in](./documentation/main_registered.png)

/palettes - a page to view the currently logged in user's palettes

![your palettes](./documentation/your_palettes.png)

/palettes/\<palette_id\>/update - page to update the currently selected palette

![update palette](./documentation/update_palette.png)

## Site map

![site map](./documentation/sitemap.png)

## User Stories or Use Cases

1. As a user, I want to modify the color palette of the page I am currently on so that I can better interact with the site.
2. As a non-registered user, I want to keep the color palettes I have created before so that I don't have to make the same changes every time I come back to the site.
3. As a non-registered user, I want to see the color palettes that others have published so that I might not have to spend the time to create my own.
4. As a non-registered user, I want to create a new account so that I can publish my color palettes to other users.
5. As a registered user, I want to publish my palettes so that other users can use it on the same domain.
6. As a registered user, I want to view a list of my palettes so that I have quick access to the work I have created.
7. As a registered user, I want to edit my existing palettes so that other users can see an updated version of what I had created.
8. As a registered user, I want to delete my existing palettes so that palettes that I no longer want to use or have other people use do not polute the palettes available.

### Stretch Goals

1. As a user, I want to visualize the palette before pushing it onto the site so that I can view options before I commit to one.
2. As a user, I want to see which elements are affected by which CSS selector so that I know what elements I am changing before I start fiddling with the change.
3. As a user, I want to be able to search the palettes created for a webpage so that I can find one that matches the name or description of what I want.

## Research Topics

* (5 points) Chrome extensions
  * Ultimately, my web app will be a Google Chrome extension. This comes with its own API and a required Manifest doc to be written.
  * I have little to no experience in this area, and I expect it to be a bit of a learning curve.
* (4 points) React
  * I have some experience in React, but none in hooking up and deploying a React app with a Node back end.
  * Along with hooking it up in the extension, I suspect that this might be a little time consuming.
* (1 point) TypeScript
  * Using TypeScript to try my best to avoid `undefined` or `null` type errors.
  * I have some experience with TypeScript with React.

## [Link to Initial Main Project File](./src/app.ts)

## Considerations

### Should traversal through the DOM tree give uniquely identifying query selectors?

If we want uniquely identifying query selectors, we could just use `nth-child` for everything. However, semantically these selectors are meaningless (and also probably don't need to be stored explicitly as a query selector). This method means that any change in the ordering of the HTML of the page completely changes the way the palette affects the page.

If we instead use tags, classes, and ids in the query selector, we aren't guaranteed that the selectors are uniquely selecting (that is using `document.querySelectorAll` may potentitially give back more than one element). As such, we are also not guaranteed that the selectors themselves are unique (that is we may have more than one of the same query selector being stored). This takes up more than the necssary amount of time in the database, and can remedied by checking if the query selector already exists, though that operation would make DOM traversal take magnitudes longer.

In the end, we choose to go with non-unique tags, in order to prevent massive changes to how the palette affects the page if the page is changed at all. We will not worry about the non-unique query selectors being stored in the database since at most, the non-unique selectors are capped by the number DOM elements on the page which we were already expecting to store.

## Annotations / References Used

1. [How To Set Up a Node Project With Typescript - Digital Ocean](https://www.digitalocean.com/community/tutorials/setting-up-a-node-project-with-typescript)
2. [Reading time - Chrome Developers](https://developer.chrome.com/docs/extensions/mv3/getstarted/tut-reading-time/)
3. [Methods to get unique values from arrays in Javascript and their performance - Phi Bya](https://dev.to/phibya/methods-to-get-unique-values-from-arrays-in-javascript-and-their-performance-1da8)
