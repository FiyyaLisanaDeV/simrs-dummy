import os
import glob

controllers = glob.glob('/home/gudang-data-kantor/simrs-web/simrs-backend/src/**/*.controller.ts', recursive=True)

for file in controllers:
    if 'auth.controller.ts' in file or 'app.controller.ts' in file:
        continue
    
    with open(file, 'r') as f:
        content = f.read()
    
    if 'JwtAuthGuard' in content:
        continue
        
    # Tambahkan import
    if "import { UseGuards }" not in content:
        content = content.replace("import { Controller,", "import { Controller, UseGuards,")
        if "import { Controller " in content:
            content = content.replace("import { Controller ", "import { Controller, UseGuards ")
            
    content = "import { JwtAuthGuard } from '../auth/jwt-auth.guard';\n" + content
    
    # Tambahkan decorator
    content = content.replace("@Controller(", "@UseGuards(JwtAuthGuard)\n@Controller(")
    
    with open(file, 'w') as f:
        f.write(content)
        
print("Controllers updated.")
