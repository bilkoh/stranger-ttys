---
title: 'SonarQube vs OWASP Top Ten'
excerpt: 'Feeding NodeGoat to SonarQube to see how much of the OWASP Top Ten is caught in this static analysis tool.'
coverImage: '/images/cover-images/sonarqube-vs-owasptopten.png'
date: '2020-05-23'
ogImage:
  url: '/images/cover-images/sonarqube-vs-owasptopten.png'
---
In an attempt to get more familiar with SAST (Static Application Security Testing), I installed **[SonarQube Community Edition](https://www.sonarqube.org/)**. I wanted to see how good or bad it was at detecting the OWASP Top Ten. I fed it the **[OWASP NodeGoat](https://github.com/OWASP/NodeGoat)** Project to check its performance.

OWASP itself, in it's own article on [Static Code Analysis](https://owasp.org/www-community/controls/Static_Code_Analysis), acknowledges these limitations:

>Many types of security vulnerabilities are very difficult to find automatically, such as authentication problems, access control issues, insecure use of cryptography, etc. The current state of the art only allows such tools to automatically find a relatively small percentage of application security flaws. Tools of this type are getting better, however.

### False Positives
- They flagged links with "target=_blank" as vectors for phishing attacks. Not what we're looking for at all.
![target blank](/images/sonarqube-vs-owasptopten/target-blank.png)

- It found an `exec` call in the Gruntfile. Nothing doing here. 
![exec call](/images/sonarqube-vs-owasptopten/exec.png)

- Flagged hard-coded passwords. These however were the `db-reset.js` which merely runs when setting up the project's nosql database.
![hard coded passwords](/images/sonarqube-vs-owasptopten/hard-coded.png)

- Another false positive was Math.random's psuedo-random generation, except for the fact that none of the psuedorandom data is used for encryption.
![Math.random](/images/sonarqube-vs-owasptopten/psuedo-random.png)

### Relevant Findings
- ReDOS stuff
![Regex DOS](/images/sonarqube-vs-owasptopten/redos.png)

- RCE `eval` (Serverside Injection)
![RCE eval](/images/sonarqube-vs-owasptopten/rce-eval.png)

### False Negatives
So NodeGoat's characterization of the OWASP Top Ten goes as follows:

1. Injection [ `Partially Detected by SonarQube` ]
2. Broken Auth [ `Undetected` ]
3. XSS [ `Undetected` ]
4. Insecure Direct Object References [ `Undetected` ]
5. Misconfig [ `Undetected` ]
6. Sensitive Data [ `Undetected` ]
7. Access Control [ `Undetected` ]
8. CSRF [ `Undetected` ]
9. Insecure Components [ `Undetected` ]
10. Redirects [ `Undetected` ]

So the only relevant Top Ten risks discovered by SonarQube were the eval statements that would qualify as 1 Injection, despite totally whiffing on the nosql injection in other parts of project. The ReDOS, although relevant and placed purposefully in NodeGoat, is outside of Top Ten, but good on SonarQube for finding it.


### Summary
So not a lot were found. I don't have enough experience with SAST to attribute this to a lack of configuration on my part in SonarQube itself, or because the source project is in Javascript, or something else. OWASP's own article on [Static Code Analysis](https://owasp.org/www-community/controls/Static_Code_Analysis) does say this class of tool is good with SQL injection detection. And I'm thinking the nosql injection vulnerabilities in NodeGoat evaded this analysis simply because it used mongodb.
