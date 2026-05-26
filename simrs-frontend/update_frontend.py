import os
import glob

files = glob.glob('/home/gudang-data-kantor/simrs-web/simrs-frontend/src/pages/*.tsx')

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    if 'Login.tsx' in file:
        content = content.replace("localStorage.setItem('access_token'", "localStorage.setItem('token'")
        with open(file, 'w') as f:
            f.write(content)
        continue

    if 'apiFetch' in content:
        continue
        
    if 'fetch(' in content or 'fetch ' in content or 'fetch`' in content:
        content = content.replace('fetch(', 'apiFetch(')
        content = content.replace('fetch`', 'apiFetch`')
        
        content = "import { apiFetch } from '../lib/api';\n" + content
        
        with open(file, 'w') as f:
            f.write(content)

print("Frontend fetches updated.")
