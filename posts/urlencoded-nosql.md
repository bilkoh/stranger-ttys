---
title: 'NoSQL and urlencoded'
coverImage: '/images/cover-images/urlencoded-nosql.gif'
date: '2020-04-30'
ogImage:
  url: '/images/cover-images/urlencoded-nosql.gif'
---

**[OWASP NodeGoat](https://github.com/OWASP/NodeGoat)** is vulnerable express app, an environment meant to demonstrate OWASP Top 10 in the node context. It's great. You can deploy it in heroku and have at it. There's a tutorial illustrating each attack and also methods of securing against the attacks.

So I gave it a spin and was playing nosql injection in the allocation page, demonstrating the typical `1';return 1=='1` injection you would input to an unsanitized $where query. And it worked to my satisfaction. I wondered about the login form, and if it was suspectible to injection, despite not being explicitly mentioned. It used a findOne method that should have been suspectible to $gt or $ne injection. But I was having no luck. Totally ineffective. I logged the variables to console from the app and it was clearly being parsed all wrong. I turned `app.use(bodyParser.urlencoded({ extended: false }));` from false to true. And that enabled injection just like that.

### How and Why?
Taking a look at body-parser and its extended option, I found:
~~~javascript
  var queryparse = extended
    ? extendedparser(opts)
    : simpleparser(opts)
~~~

The difference between `extended` being tue and false is the simply difference between using two packages: the `qs package` (true) and `querystring` (false).

The refinement of qs allows for parsing more complex querystrings with arrays and objects. It provides parsing and stringify with "some added security". Though in this case, it was what enabled me to inject $ne injection into the OWASP NodeGoat app. While querystring is an older and simpler package, its inability to parse objects prevented my attack.

To demonstrate, querystring stymied the string `userName[$ne]=` by parsed to an object like `{ 'userName[$ne]': '' }` wherby creating a req.body.userName is undefined and instead req.body['userName[$ne]'] is defined instead. The qs package will deliver what we want. Eg: `userName[$ne]=` is parsed to an object like `{ 'userName[$ne]': '' }`.

At any rate, if anyone is having trouble test nosql injection in an express app, and having problems, check the body-parser, urlencoded, and its extended option.