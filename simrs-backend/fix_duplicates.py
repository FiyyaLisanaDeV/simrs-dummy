import re

with open("prisma/schema.prisma", "r") as f:
    content = f.read()

# We need to remove duplicates of models and enums. 
# It's better to parse models and enums into a dictionary to keep only the first occurrence.

blocks = re.split(r'\n(?=model |enum )', content)

seen_names = set()
new_blocks = []

for block in blocks:
    if not block.strip():
        continue
    
    match = re.search(r'^(model|enum)\s+(\w+)\s*\{', block)
    if match:
        name = match.group(2)
        if name not in seen_names:
            seen_names.add(name)
            new_blocks.append(block)
    else:
        new_blocks.append(block)

with open("prisma/schema.prisma", "w") as f:
    f.write("\n".join(new_blocks))

print("Duplicates removed.")
