import requests

resp = requests.get('https://webserver/flag', verify=False)
print(resp.text)
