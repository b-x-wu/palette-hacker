<!-- markdownlint-disable MD029 -->
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

## 11/16/22

### 11:34 AM

Ok new day. I think I'm going to try to sort out taking palettes from the database that exist for a certain website and applying it. My biggest concern is how to match websites so that their palettes line up. For example, if the person made the palette on `https://google.com/search?=bat+signal` and somebody else goes to `https://google.com`, will they see the palette that the first person made? Here are the options.

1. Match entire url.
    - Pros: we're almost guaranteed that the components that existed on the page the palette was created on will exist on the page the palette will be applied on.
    - Cons: once we start factoring in query parameters, we're probably never going to get to the same page twice.
2. Match domain.
    - Pros: we will have a wide berth of palettes to try because there is a wider range of pages that map to a particular domain than to a particular url.
    - Cons: because different sites within a domain are structured differently, we probably won't get a lot of hits in terms of matching query selectors.
3. Match domain and path.
    - Pros: it's not as harsh and specific as matching the entire url (since we don't worry about query parameters or fragments) and it's more specific than matching the entire domain, so we have more of a guarantee that the DOM tree structure is similar, if not the same.
    - Cons: it might be the case that paths are designed hierarchically, and so the styles from the pages in the earlier parts of the path ought to be applied to the pages associated with the later parts of the path. I'm not super sure about this though.
        - As an example, `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split` has the same DOM structure and palette as `https://developer.mozilla.org/en-US/docs/Web`, but the two would not be matched if we match the entire path.

I'm going to try matching the domain and path first. This means matching everything up until the question mark or hash symbol, if they exist.

First things first though, I need to change what's being sent as the website property in the database. This means removing the user's ability to add the website in as their query and getting only the domain and path to save.

### 12:09 PM

The website stored in the db is now stripped of the fragment and the query parameter. But the more I look, the more I find examples of path matching not working out because child paths should be inheritting the styles ancestor paths. But there are also cases where this isn't true. For example, `https://nyu-software-engineering.github.io/course-materials/slides/what-is-software-engineering` should not be inheritting the styles of `https://nyu-software-engineering.github.io/course-materials`. For posterity:

4. Match ancestor path.
    - If the website of the palette in the db has the same path as the current website up to a certain point, then it's regarded as a match, and pulled as a palette option.
    - Pros: it's not as specific as matching the entire domain. Sometimes pages whose paths are more specific than another page should inherit the styles from the ancestor path pages, and this allows us to do that.
    - Cons: not all websites work like that. See the example above.

Maybe in the end I could pull from the db all the palettes whose websites match ancestor paths, and then sort them by how much of the path they agree with. Then I present in that order and call the palette more or less "relevant".

5. Match ancestor path and sort by amount matched.
    - Same as 4, but we sort by the length of path of the website of the palettes being pulled from the db. If the path is longer, it is more specific and agrees more with the path of the current website. If it's shorter, it's less likely to contain relevant style information or contain the same DOM structure.
    - Pros: we present options for both exact path matching and ancestor path matching, giving us the benefit of both.
    - Cons: users might be confused why some palettes work better than others.

I'm going to class now. I'll think about implementation later.

## 11/17/22

### 11:48 PM

Ok, before I work out the above issue, it turns out I forgot to configure all my Mongoose stuff with Typescript. I've now created types that correspond to my schema. At some point, I need to throw that into a `@types` directory, but I'm saying that that problem has the same priority as the "put the front-end in Webpack and Typescript" problem, which is to say, very likely out of scope.

### 12:36 AM

So it seems I really want to put off the whole path matching thing. I spent some time refactoring the front-end code to make it more functionally focused and easier to find stuff. I also implemented the naive whole-path matching schema, though it's not implemented in the front end yet. We're getting there.

### 1:07 AM

Turns out `$where` isn't allowed in the MongoDB free tier. I don't want this code to go to waste though, so here's what I had written before I found out:

```typescript
$where(() => {
    // return true if this.website contains the anscestor path of 
    // or is equal to req.query.website
    const dbPaths = ((this as unknown) as Palette).name.split('/');
    const currentWebsitePaths = (req.query.website as string).split('/');

    if (dbPaths.length > currentWebsitePaths.length) {
        return false;
    }

    for (let i = 0; i < dbPaths.length; i++) {
        if (dbPaths[i] !== currentWebsitePaths[i]) {
            return false;
        }
    }
    return true;
})
```

I will be writing a very strongly worded letter to MongoDB, believe you me.

### 1:38 AM

Good news is that I just repurposed the above code into a filter of the results that came back from the db. I put in some preliminary filtering by same url origin just to make sure that I'm not doing this on *every* conceivable palette. This is still not ideal since it's wildly inefficient and the response from the db could still be quite large. Maybe I should implement pagination?

We push on. Let's make a call from the front-end to process it.

## 11/18/22

### 12:13 PM

After a night of falling asleep in the library, I've written the code that brings in the palettes to the front-end. I have very little error checking going on right now, and I haven't set the error codes for failure responses from the back-end, I should do that. The next step is to present the palettes as actual palettes on the front end. This probably involves a little html cleanup which I've been putting off anyhow.
