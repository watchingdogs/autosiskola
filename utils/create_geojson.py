import edukretesz_to_geojson
import institute_extractor
import kepzoszervek_extractor
import requests
import os


PSApikey = os.environ["POSITIONSTACK_ACCESS_KEY"]
requests.get(f"http://api.positionstack.com/v1/forward?access_key={PSApikey}&limit=1&country=HU&query={loc}").content