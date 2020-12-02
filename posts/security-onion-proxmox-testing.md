---
title: 'Security Onion + Proxmox Testing: Will it sniff?'
excerpt: "Part 2 in the series about establishing a SOC Workstation using Security Onion to monitor your homelab. In this post is dedicated to make sure Security Onion is working in a Proxmox homelab environment."
coverImage: '/images/cover-images/security-onion-proxmox-2.png'
date: '2020-12-01'
ogImage:
  url: '/images/cover-images/security-onion-proxmox-2.png'
---
### But is it all really working?
This is the second post on a series (check out the first post [here](/posts/security-onion-proxmox-open-vswitch)) and it's dedicated to make sure Security Onion is working in a Proxmox homelab environment. I had hard time confirming this. In fact, I spent about two days pulling my hair out wondering why alerts weren't popping up, and if they were why they were delayed up to an hour. I finally checked in w/ the community at [https://github.com/Security-Onion-Solutions/securityonion/discussions](https://github.com/Security-Onion-Solutions/securityonion/discussions) and they promptly gave me the answer. Version 2.3.2 had a timezone bugged, which was solved in 2.3.10.


### TCPDUMP
We set up our span device with Open vSwitch. But does it work. First let's do a simple test with tcpdump. The results of `tcpdump -vv -i eth1` you should be capturing packets. Here you can see the packets captures from the very ssh session I launch the command from:
~~~Shell
05:36:50.821537 IP (tos 0x0, ttl 127, id 25346, offset 0, flags [DF], proto TCP (6), length 104)
    10.11.1.3.57393 > onion.ssh: Flags [P.], cksum 0xc661 (correct), seq 4801:4865, ack 1193088, win 8212, length 64
05:36:50.821620 IP (tos 0x0, ttl 127, id 25347, offset 0, flags [DF], proto TCP (6), length 40)^C
    10.11.1.3.57393 > onion.ssh: Flags [.], cksum 0x717a (correct), seq 4865, ack 1193664, win 8210, length 0

4557 packets captured
4560 packets received by filter
0 packets dropped by kernel
~~~

Remember that we want to sniff on the our monitoring, not our management nic.


### tmNIDS
Now that we've confirmed that we're capturing correctly, we'll need to test if Security Onion will raise alerts. tmNIDS for is a framework, really a script, for testing network intrusion detection systems. It replays pcaps that'll trigger alerts in Security Onion. Here's the project's github repo: [https://github.com/0xtf/testmynids.org](https://github.com/0xtf/testmynids.org)

Use this one liner to run this script (or download and save the shellscript):
~~~Shell
curl -sSL https://raw.githubusercontent.com/0xtf/testmynids.org/master/tmNIDS -o /tmp/tmNIDS && chmod +x /tmp/tmNIDS && /tmp/tmNIDS
~~~

So run the script, and launch all the test:
~~~Shell
 _             _   _ _____ _____   _____
| |           | \ | |_   _|  __ \ / ____|
| |_ _ __ ___ |  \| | | | | |  | | (___
| __|  _   _ \| .   | | | | |  | |\___ \
| |_| | | | | | |\  |_| |_| |__| |____) |
 \__|_| |_| |_|_| \_|_____|_____/|_____/

tmNIDS - NIDS detection tester - @0xtf
Project: https://github.com/0xtf/testmynids.org

Choose which test you'd like to run:

 1) Linux UID
 2) HTTP Basic Authentication
 3) HTTP Malware User-Agent
 4) Bad Certificate Authorities
 5) Tor .onion DNS response and known IPs connection
 6) EXE or DLL download over HTTP
 7) PDF download with Embedded File
 8) Simulate SSH Outbound Scan
 9) Miscellaneous domains (TLD's, Sinkhole, DDNS, etc)
10) MD5 in TLS Certificate Signature
11) CHAOS! RUN ALL!
12) Quit!
#? 11
~~~

Give it a minute and then check your alerts page in Security Onion. You should see results like the following:
![tmnids results](/images/security-onion-proxmox-open-vswitch/tmnids-alerts.png)


### What's next?
In the next post, I'll go over setting up reporting agents on our endpoints because Host Intrusion Detection System (HIDS) we'll give us additional data to raise alerts. I'll also go over how I set up my firewall rules to protect my home network from the upcoming threat lab VLAN.