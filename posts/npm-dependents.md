---
title: 'NPM Dependents - a bash script'
coverImage: '/images/cover-images/npm-dependents.jpg'
date: '2020-04-28'
excerpt: 'A script to list all packages which depend on a specific node package'
ogImage:
  url: '/images/cover-images/npm-dependents.jpg'
---

npm-dependents - A script to list all packages which depend on a specific node package

[[Github repo]](https://github.com/bilkoh/npm-dependents)

~~~bash
#!/bin/bash
# -----------------------------------------------------------------------------
# npm-depedents - A script to list all packages which depend on a specific node
# package, a la https://www.npmjs.com/browse/depended/express
# -----------------------------------------------------------------------------
# bil.koh.sec@gmail.com / @bilkohsec / https://github.com/bilkoh/npm-dependents

# This is what I use when looking to investigate the ramifications of a 
# vulnerable package in node.
# I couldn't figure out how to do so via `npm view`, so I wrote this.
# There's probably a better way, but whatever.
#
# Here's the usage for finding out which packages use mem, whose <4.0.0 version
# is vulnerable to DoS (see: https://cwe.mitre.org/data/definitions/400.html):
#
# ./npm-depdents.sh mem

offset=0
if [ -n "$2" ]; then
    offset=$2
fi

curl_content=`curl -s https://www.npmjs.com/browse/depended/$1?offset=$offset`
echo $curl_content | sed -r 's/\/package\//\n&/g' | awk '/\/package\// { print $1 }'| awk '/img$/ {print $0}' | sed -r 's/^\/package\/(.*)\"><img/\1/g'


# Check if we're done here. 
# If not, retrieve next page and recusively run ourself with a new offset
next_page_regex="Next Page"
if [[ $curl_content =~ $next_page_regex ]]; then 
    $0 $1 $((offset + 36))
fi
~~~