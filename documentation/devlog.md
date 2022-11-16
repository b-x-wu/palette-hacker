# Color Palette DevLog

## 11/15/2022

### 10:51 PM

Tackling the alpha value problem. Here's how I'm going to try to do it. The color codes that gets passed from `content.js`, `index.js`, and the database are going to be in `#RRGGBB` format exclusively. This means that when applying colors onto the page, we need to adapt the color to have the same alpha value as was already present in the node.

### 11:15 PM

Turns out that the alpha value in `rgba` is a float between zero and one, which will be a pain to encode in the `#RRGGBBAA` format. Maybe I should just be storing color as its own type with properties `red`, `green`, and `blue` which are all numbers from 0 to 255. That way, the web representation of the color can be done with `rgba` always and in base 10.

### 11:55 PM

I got the front-end color picker working again, now with support for alpha values. That is, picking a color doesn't automatically override the opacity to be full. I also modified the color representation in the front end to be an object with `red`, `green`, and `blue` properties. I feel very nervous about this, particularly because I have no type safety at all, especially in the front-end. Now I have to make sure that it works in the back-end.

### 12:02 AM

Everything is hooked up for opacity support, with the only real overhaul being the color representation in the database. This is better than storing it as a hex string. The typing is making me more an more nervous every day, but getting the front-end sorted with webpack is still definitely a stretch goal. I'm calling it a night. Commiting and pushing.

Next steps are logging in and subsequent session persistance and taking palettes from the database and applying them to pages.
