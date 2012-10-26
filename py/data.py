import os, json
import uuid, subprocess

#ROOT_DIR = '/home/arjun/Sandbox/python/picatrix/'
ROOT_DIR = '/media/BC4AC07A4AC032C6/Picatrix-Data/'

ec=0
pc=0

eventjs = open('events.js', 'w')
photojs = open('photo.js', 'w')

def getUUIDFilename():
  return str(uuid.uuid1().hex)
  
def getEventName(dirname):
  return dirname[len(ROOT_DIR): len(dirname)]

def createEvent(dirname, writer):
  data = {}
  global ec
  ec += 1
  data['path'] = getEventName(dirname)
  data['uid'] = ec
  writer.write(json.dumps(data) + "\n")
  
def createPhoto(dirname, photoFile, writer):
  pl = photoFile.lower()
  if len(photoFile) != 34: return
  #if ('.jpg' not in pl) and ('.jpeg' not in pl): return
  data = {}
  global pc
  pc += 1
  uname = os.path.join(dirname, getUUIDFilename() + '.j')
  oldname = os.path.join(dirname, photoFile)
  os.rename(oldname, uname)
  data['path'] = uname
  data['parent'] = getEventName(dirname)
  data['uid'] = pc
  writer.write(json.dumps(data) + "\n")
  
def walk():   
  for current, subdirs, files in os.walk(ROOT_DIR): 
    print "Processing:", current
    createEvent(current, eventjs)
    for picname in files: createPhoto(current, picname, photojs)

def getTS(exout):
  ix = exout.find(":")
  val = 0
  try:
    val = int(exout[ix+1: len(exout)])
  except: 
    print 'something went wrong'
    return 0
  return val

def getEXIF(path):
  cmd = 'exiftool -d %s -datetimeoriginal'
  args = cmd.split();
  args.append('' + path + '')
  proc = subprocess.Popen(args, stdin=subprocess.PIPE, \
            stdout=subprocess.PIPE)
  (out, err) = proc.communicate()
  if err: 
    print path, err
    return 0
  return getTS(out)

def collectEXIF():
  writer = open('data/exif.js', 'w')
  for line in open('data/photo.js', 'r'):
    data = {}
    pic = json.loads(line)
    data['uid'] = pic['uid']
    data['ts'] = getEXIF(pic['path'])
    writer.write(json.dumps(data) + "\n");
    writer.flush()
  writer.close()
  
if __name__ == "__main__": 
  try:
    collectEXIF()
    #walk()
    #eventjs.close()
    #photojs.close()
  except:
    'something went wrong'
  
  
