#Histogram Extraction

## Preliminaries

To use this script, you will need to install EXIFTOOL, a Perl library
to extract EXIF metadata from JPEG photos. On Ubuntu, use the apt-get command to install it:

```sudo apt-get install libimage-exiftool-perl```

Alternatively, the latest stable package can be found and installed
from their homepage:

http://www.sno.phy.queensu.ca/~phil/exiftool/

##Usage:

To display help message: 

```python histogram.py -h```

To construct a histogram of N bins from a set of photos:

```python histogram.py -n NBINS -f DSC_0001.JPG DSC_0002.JPG```

To construct a histogram of N bins from all photos in a directory:

```python histogram.py -n NBINS -d ../relative_path_to_photos``` 
OR
```python histogram.py -n NBINS -d /absolute/path/to/photos``` 
