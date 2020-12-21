---
title: 'Using IP Reputation list to alert for SolarWinds Sunburst activity in Security Onion'
excerpt: "Part 4 in the series about establishing a SOC Workstation using Security Onion to monitor your homelab. We're getting into IP Reputation in Suricata. And trying to get around docker and SaltStack to do so in Security Onion."
coverImage: '/images/cover-images/security-onion-proxmox-4.png'
date: '2020-12-20'
ogImage:
  url: '/images/cover-images/security-onion-proxmox-4.png'
---
### Intro
I'd like to start with an acknowledgement: It's almost a certainty that the attackers responsible for Sunburst have burned these C2s and moved on, and thusly adding these IPs to an IP Reputation list is kind of pointless. But I just want to demonstrate how to set up `IPREP` within Security Onion and I figured the Sunburst addition is topical.

### What is IP Reputation?
This is taken straight from Suricata's wiki:

The purpose of the IP reputation component is the ranking of IP Addresses within the Suricata Engine. It will collect, store, update and distribute reputation intelligence on IP Addresses.


### How will we use it?
We've got a list of low reputation IPs associated with Sunburst here: `https://github.com/bambenek/research/blob/main/sunburst/ipv4-addresses.txt` (see [Github Repo](https://github.com/bambenek/research/tree/main/sunburst) for more info).

And we want to enable and configure suricata (which runs in a docker container within Security Onion) to use an `IPREP` list to alert us if we have any activity to or from those ips.

### The Docker Problem
Many versions back, Security Onion dockerized many of the services. Now everything is managed by SaltStack.

Knowing which file to edit and which file to leave for salt to handle is not always easy. For example, changing configuration for `suricata.yaml` will be instead be done in `/opt/so/saltstack/local/pillar/minions/onion_eval.sls`. 

Note: `onion_eval` is a reflection of $SENSORNAME_$ROLE. So this file name will be different on your set up depending on your sensor name and role.

### Configs / Category & IP Lists
#### Adding IPREP to Suricata configs
Edit `/opt/so/saltstack/local/pillar/minions/onion_eval.sls`. And add this to the bottom of the file:
~~~YAML
suricata:
  config:
   reputation-categories-file: /etc/suricata/iprep/categorylist.txt
   default-reputation-path: /etc/suricata/iprep
   reputation-files:
     - sunburst.txt
     - testing.txt
~~~
Note: that the above paths are where I'll files will be put within the suricata docker

Let's create these file within our onion machine
~~~Shell
mkdir /opt/so/conf/suricata/iprep
cd /opt/so/conf/suricata/iprep
touch categorylist.txt
touch sunburst.txt
touch testing.txt
chown suricata: -R ./
~~~

#### categorylist.txt
~~~Shell
1,sunburst,Known Sunburst IP
2,test,Testing IPREP
~~~
Follows format: `<id>,<short name>,<description>`
([Suricata docs](https://suricata.readthedocs.io/en/suricata-4.1.4/reputation/ipreputation/ip-reputation-format.html#categories-file))

#### testing.txt
~~~Shell
192.168.1.71,2,10
~~~
Follows format: `<ip>,<category>,<reputation score>`
([Suricata docs](https://suricata.readthedocs.io/en/suricata-4.1.4/reputation/ipreputation/ip-reputation-format.html#reputation-file))

##### sunburst.txt:
Use this one-liner to add category id and reputation score to flat ip list we got from [bambenek's sunburst research](https://github.com/bambenek/research/tree/main/sunburst).
~~~Shell
curl https://raw.githubusercontent.com/bambenek/research/main/sunburst/ipv4-addresses.txt | sed 's/$/,1,10/' > sunburst.txt
~~~
I also appended another machine on my network to test `sunburst.txt`.

### Adding Rules 
Edit `/opt/so/saltstack/local/salt/idstools/local.rules` to add our iprep rules ([iprep keyword docs](https://suricata.readthedocs.io/en/suricata-4.1.4/rules/ip-reputation-rules.html))
~~~Shell
# Custom Suricata rules go in this file
alert ip any any -> any any (msg:"IPREP LOW - Sunburst"; iprep:src,sunburst,<,11; sid:1996611; rev:1;)
alert ip any any -> any any (msg:"IPREP LOW - Sunburst"; iprep:dst,sunburst,<,11; sid:1996612; rev:1;)
alert ip any any -> any any (msg:"IPREP HIGH - Testing"; iprep:src,test,<,11; sid:1996621; rev:1;)
alert ip any any -> any any (msg:"IPREP HIGH - Testing"; iprep:dst,test,<,11; sid:1996622; rev:1;)
~~~
`iprep` is the important keyword, which takes 4 arguments:
- 1st argument for `src` or `dst`
- next is the category short name we described in `categorylist.txt`
- next is the operator, either >, or <, or =
- last is the value evaluated by the operator

So the above rules will raise alerts on any of the ips in our `sunburst` or `test` category, either as src or dst, if those ips had a reputation under 11.

### Back to Docker
Though we've saved these files in our onion machine, none of them are actually in the suricata docker container. In order to get them there we need to bind the files we created earlier to the suricata container.

We'll have to open `/opt/so/saltstack/default/salt/suricata/init.sls`. In the `so-suricata` section look for a list of `binds`. It'll be under a format like `[path1]:[path2]:[ro|rw]`.

We add the following binds:
~~~YAML
      - /opt/so/conf/suricata/iprep/categorylist.txt:/etc/suricata/iprep/categorylist.txt:ro
      - /opt/so/conf/suricata/iprep/sunburst.txt:/etc/suricata/iprep/sunburst.txt:ro
      - /opt/so/conf/suricata/iprep/testing.txt:/etc/suricata/iprep/testing.txt:ro
~~~

To give you an idea, this is what it looks likes for me:
~~~YAML
so-suricata:
  docker_container.running:
    - image: {{ MANAGER }}:5000/{{ IMAGEREPO }}/so-suricata:{{ VERSION }}
    - start: {{ START }}
    - privileged: True
    - environment:
      - INTERFACE={{ interface }}
    - binds:
      - /opt/so/conf/suricata/suricata.yaml:/etc/suricata/suricata.yaml:ro
      - /opt/so/conf/suricata/threshold.conf:/etc/suricata/threshold.conf:ro
      - /opt/so/conf/suricata/rules:/etc/suricata/rules:ro
      - /opt/so/log/suricata/:/var/log/suricata/:rw
      - /nsm/suricata/:/nsm/:rw
      - /opt/so/conf/suricata/bpf:/etc/suricata/bpf:ro
      - /opt/so/conf/suricata/iprep/categorylist.txt:/etc/suricata/iprep/categorylist.txt:ro
      - /opt/so/conf/suricata/iprep/sunburst.txt:/etc/suricata/iprep/sunburst.txt:ro
      - /opt/so/conf/suricata/iprep/testing.txt:/etc/suricata/iprep/testing.txt:ro
    - network_mode: host
    - watch:
      - file: /opt/so/conf/suricata/suricata.yaml
      - file: surithresholding
      - file: /opt/so/conf/suricata/rules/
      - file: /opt/so/conf/suricata/bpf
~~~

We run the following to initiate reloading changes restart suricata:
~~~Shell
salt-call state.highstate; so-rule-update; salt onion_eval state.apply suricata; so-suricata-restart
~~~

Run `docker exec so-suricata find /etc/suricata` in your onion machine to check if the `iprep` has been bound correctly.

You should see the iprep directory added:
~~~Shell
[root@onion iprep]# docker exec so-suricata find /etc/suricata
/etc/suricata
/etc/suricata/classification.config
/etc/suricata/reference.config
/etc/suricata/suricata.yaml
/etc/suricata/threshold.config
/etc/suricata/threshold.conf
/etc/suricata/bpf
/etc/suricata/rules
/etc/suricata/rules/all.rules
/etc/suricata/rules/local.rules
/etc/suricata/iprep
/etc/suricata/iprep/categorylist.txt
/etc/suricata/iprep/testing.txt
/etc/suricata/iprep/sunburst.txt
~~~

### Testing
I pinged between two host within my network. One that was added to our sunburst iprep list, and the other to the testing iprep list. And this is what my alerts page looks like:
![test iprep alerts](/images/security-onion-proxmox-open-vswitch/4-iprep-alerts.png)

### Leveraging Threat Intel
There are Threat Intel databases like, [CINS Score](http://cinsscore.com/), that use their resources to develop ip lists of bad actors and publish them for free. See: `http://cinsscore.com/list/ci-badguys.txt`

So I urge you to add more reputation lists and alerts, as we did above, to keep your networks safe and improve visability.

### What's next?
Not sure. Just writing as I go along. Will update soon.

### Reference:
#### Versions used:
Security Onion 2.3.10

Proxmox: 6.2-15/48bd51b6 (running kernel: 5.4.65-1-pve)

pfSense: 2.4.5-RELEASE-p1
