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

(__TODO__: wireframes for all of the pages on your site; they can be as simple as photos of drawings or you can use a tool like Balsamiq, Omnigraffle, etc.)

/list/create - page for creating a new shopping list

![list create](documentation/list-create.png)

/list - page for showing all shopping lists

![list](documentation/list.png)

/list/slug - page for showing specific shopping list

![list](documentation/list-slug.png)

## Site map

(__TODO__: draw out a site map that shows how pages are related to each other)

Here's a [complex example from wikipedia](https://upload.wikimedia.org/wikipedia/commons/2/20/Sitemap_google.jpg), but you can create one without the screenshots, drop shadows, etc. ... just names of pages and where they flow to.

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

## [Link to Initial Main Project File](app.mjs) 

(__TODO__: create a skeleton Express application with a package.json, app.mjs, views folder, etc. ... and link to your initial app.mjs)

## Annotations / References Used

(__TODO__: list any tutorials/references/etc. that you've based your code off of)

1. [passport.js authentication docs](http://passportjs.org/docs) - (add link to source code that was based on this)
2. [tutorial on vue.js](https://vuejs.org/v2/guide/) - (add link to source code that was based on this)

