import os

file_path = r'c:\Users\perez\Documents\tastafe.css'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Look for the broken part
# Line 12292:     text-align: left;
# Line 12293: }
# Line 12294: .portlet_taskstatistics_content div.trend,

new_lines = []
broken_found = False
for i, line in enumerate(lines):
    if 'text-align: left;' in line and i + 1 < len(lines) and lines[i+1].strip() == '}':
        if i + 2 < len(lines) and '.portlet_taskstatistics_content div.trend,' in lines[i+2]:
            # This is the broken part!
            new_lines.append(line)
            new_lines.append(lines[i+1])
            new_lines.append('\n')
            new_lines.append('.portlet_taskstatistics_content .controlcontainer {\n')
            new_lines.append('    padding: 16px;\n')
            new_lines.append('}\n')
            new_lines.append('\n')
            new_lines.append('.portlet_taskstatistics_content .statscontrols {\n')
            new_lines.append('    position: relative;\n')
            new_lines.append('}\n')
            new_lines.append('\n')
            broken_found = True
            continue # I'll skip the next two lines because I'll add them normally or handle them
    
    # If we just inserted the block, we skip the next two lines of the original (the current 12293 and 12294)
    # Actually, simpler:
    new_lines.append(line)

# Let's try again with a simpler string replace on the whole content
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_block = '''    text-align: left;
}
.portlet_taskstatistics_content div.trend,'''

new_block = '''    text-align: left;
}

.portlet_taskstatistics_content .controlcontainer {
    padding: 16px;
}

.portlet_taskstatistics_content .statscontrols {
    position: relative;
}

.portlet_taskstatistics_content div.trend,'''

if old_block in content:
    content = content.replace(old_block, new_block)
    print("Fixed mid-file corruption.")
else:
    # Try with CRLF just in case
    old_block_crlf = old_block.replace('\n', '\r\n')
    new_block_crlf = new_block.replace('\n', '\r\n')
    if old_block_crlf in content:
        content = content.replace(old_block_crlf, new_block_crlf)
        print("Fixed mid-file corruption (CRLF).")
    else:
        print("Could not find mid-file corruption.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("File updated successfully.")
