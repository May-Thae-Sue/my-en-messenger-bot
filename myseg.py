#!/usr/bin/python
### by Chenchen Ding, @ NICT, 2019/04
### for python 2.x: tested with python 2.6 and 2.7
### for python 3.x: unichr -> chr, using the "python 3.x" lines

### usage:
### 	myseg.py < MY-ORIGINAL > MY-UNIT 

import sys, os, codecs
### for python 2.x
sys.stdin  = codecs.getreader('utf-8')(sys.stdin)
sys.stdout = codecs.getwriter('utf-8')(sys.stdout)
sys.stderr = codecs.getwriter('utf-8')(sys.stderr)
### for python 3.x
### sys.stdin  = codecs.getreader('utf-8')(sys.stdin.buffer)
### sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer)
### sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer)

X, T, STACK = unichr (0x103a), unichr (0x1037), unichr (0x1039)
TX, XT = T + X, X + T

DEP = set ([unichr (0x102b+x) for x in range (8)])
DEP|= set ([unichr (0x1036+x) for x in range (3)])
DEP|= set ([unichr (0x103b+x) for x in range (4)])
DEP.add (X)

def seg (m) :
	m = m.replace (unichr (0x200c), ' ')
	m = m.replace (TX, XT)
	m = list (''.join (m.lower ().strip ().split ()))
	### generate basic units
	m.reverse ()
	for i in range (len (m)-1) : 
		if m [i][0] in DEP : m [i+1] += m [i]; m [i] = ''
	m.reverse ()
	### attach asat units (len < 4 to avoid au)
	m = ' '.join (m).split ()
	for i in range (1, len (m)) :
		if X in m [i] and len (m [i]) < 4 : m [i-1] += m [i]; m [i] = ''
	### glue stacked units
	m = ' '.join (m).split ()
	m = ' '.join (m).replace (' '+STACK+' ', STACK)
	return m

def main () :
	try :
		for m in sys.stdin : sys.stdout.write (seg (m) + "\n")
	except : pass

if __name__ == "__main__" : main ()
