import requests

x = requests.post('http://127.0.0.1:3000', json={'test':'123py'}, headers={'Content-Type':'application/json'})
#x = requests.get('http://127.0.0.1:3000');
print(x.json())

