import subprocess, argparse
import fnmatch
import os, os.path as path

def isJPEG(f): 
  proc = subprocess.Popen( ("file -i " + f).split(), stdout = subprocess.PIPE)
  stdout = proc.communicate()[0]
  out = stdout.split()[1]
  return (out == 'image/jpeg;')
  
parser = argparse.ArgumentParser()
parser.add_argument("-n", "--nbins", help = "number of bins in histogram")
parser.add_argument("-d", "--dir", help = "compute histogram for all files in this directory")
parser.add_argument("-f", "--files", help = 
               "JPEG files whose histogram needs to be computed", nargs='+')
args = parser.parse_args()

cmd = "exiftool -d %s -datetimeoriginal "
nbins = 10
files = []
values = []

if args.nbins: nbins = args.nbins
if args.files: files = args.files
if args.dir:
  if not args.dir.endswith('/'): args.dir += '/'
  dirtemplate = args.dir + '%s'
  files += [dirtemplate % item for item in os.listdir(args.dir) if isJPEG(dirtemplate % item)]

print 'Extracting Timestamps...'
for _file in files:
  if path.exists(_file) == False: 
    print 'File:', _file, 'does not exist.'
    continue
  proc = subprocess.Popen( (cmd+_file).split(), stdout = subprocess.PIPE)
  (stdout, stderr) = proc.communicate()
  if len(stdout.split()) == 4:
    ts = int(stdout.split()[3])
    values.append ( (ts, _file) )
  
hist=[]
for i in xrange(nbins): hist.append(0)

values.sort()
_min = values[0][0]
_max = values[len(values)-1][0]

gap = (_max - _min)/nbins

for val in values: 
  x = float((val[0] - _min)/(gap+10))
  print val[0], x, val[1]
  hist[int(x)] += 1

print hist
_hmax = max(hist)
nhist = []
for h in hist: nhist.append(h/float(_hmax))

print 'Normalized Histogram:'
print nhist
