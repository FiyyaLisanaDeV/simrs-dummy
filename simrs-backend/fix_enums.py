import re

with open('/home/gudang-data-kantor/simrs-web/simrs-backend/prisma/schema.prisma', 'r') as f:
    content = f.read()

# Replace commented enum values with VAL_ prefix
def replace_enum(match):
    lines = match.group(0).split('\n')
    new_lines = []
    for line in lines:
        if re.search(r'//\s*([0-9]+)\s+@map', line):
            line = re.sub(r'//\s*([0-9]+)(\s+@map)', r'VAL_\1\2', line)
        new_lines.append(line)
    return '\n'.join(new_lines)

content = re.sub(r'enum\s+[a-zA-Z0-9_]+\s+\{.*?\}', replace_enum, content, flags=re.DOTALL)

with open('/home/gudang-data-kantor/simrs-web/simrs-backend/prisma/schema.prisma', 'w') as f:
    f.write(content)

print("Enums fixed.")
