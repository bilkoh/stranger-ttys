---
title: 'Audit Log Dashboard'
excerpt: 'Very basic dashboard for auditd logs.'
date: '2020-04-22'
---
[Project repo is here](https://github.com/bilkoh/audit-log-dashboard)
# Audit Log Dashboard

### Use Case
After booting up a VPS for the first time, I noticed a bunch of activity on netstat. Apparently a bunch of ips in China were agressively testing my ssh security. So I spent 5 minutes hardening my system and I went to look at my auditd logs just in case. Well I realized how obtuse a mess of auditd logs could be and I decided to elasticsearch+kibana+auditbeats would be great to monitor these logs on a continual basis. It looked very fancy. But alas this very modest VPS only had 1gb of ram and the elasticsearch is a memory hog and wouldn't run. So I wrote this as a very basic solution for very basic auditd log viewing problem.

### How it works
Bash scripts, running on 5 minute intervals, comb thru logs and spit out json of relevant data. An express server reads them and puts them in filterable tables. Your browser auto refreshes every 5 minutes.

### Installation
- Clone this repo.
- `npm install`
- `sudo ./bin/crontab-setup.sh add`
    - This will add the appropriate bash scripts to your crontab. (Yes they need root).
    - Conversely `sudo ./bin/crontab-setup.sh remove` will remove them.
- See the `audit.rules` in repo's base dir? Add it to your `/etc/audit/rules.d/audit.rules` and run `sudo augenrules` and restart auditd.
- Run `npm run start` to run the express server on port 3000.
- Optional
    - Run `sudo ./bin/systemd-setup.sh add` to set this as an enabled systemd service.
    - Conversely `sudo ./bin/systemd-setup.sh remove` will remove it.
- Set your browser to `http://localhost:3000`
- To enable the optional authentication for express, uncomment lines 14-16 in app.js
~~~javascript
// Auth
app.use(basicAuth({
    challenge: true,
    users: { 'admin': 'supersecret' }
}))
~~~

### Screenshot
![audit-log-dashboard-screenshot](https://user-images.githubusercontent.com/43228593/80442437-bc73e900-88c1-11ea-8fc6-77e2596281c7.png)
