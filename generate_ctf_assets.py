import os
import hashlib
import wave
import struct
import base64
import codecs
from PIL import Image
import zipfile
import shutil

def sha256(text):
    return hashlib.sha256(text.encode()).hexdigest()

flags = {
    1: 'flag{n0_s3cr3ts_1n_html}',
    2: 'flag{3x1f_m3t4d4t4_m4g1c}',
    3: 'flag{0p3n_xml_1s_just_4_z1p}',
    4: 'flag{h1dd3n_1n_th3_p1x3ls}',
    5: 'flag{c4n_y0u_h34r_th3_d4t4}',
    6: 'flag{0ff_by_0n3_1s_cl4ss1c}',
    7: 'flag{brut3_f0rc3_w0rks_1n_s3c0nds}',
    8: 'flag{l4y3r_up0n_l4y3r}',
    9: 'flag{n3tw0rk_1nsp3ct10n}',
    10: 'flag{m4st3r_0f_th3_c7f}'
}

# 1. Update hashes array
print("Updated Hashes:")
for k, v in flags.items():
    print(f"Ch {k}: {sha256(v)}")

# 2. photo.jpg (Exif)
img = Image.new('RGB', (100, 100), color='red')
img.save('assets/challenges/photo.jpg')
# Simple way: just append the flag at the end of the JPG file, or insert an EXIF marker manually
with open('assets/challenges/photo.jpg', 'ab') as f:
    f.write(b'EXIF UserComment: ' + flags[2].encode())

# 3. document.docx (Zip)
# Create a valid minimal zip file that acts as a docx
with zipfile.ZipFile('assets/challenges/document.docx', 'w') as zf:
    zf.writestr('docProps/core.xml', f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:description>{flags[3]}</dc:description></cp:coreProperties>')
    zf.writestr('word/document.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Nothing to see here...</w:t></w:r></w:p></w:body></w:document>')

# 4. stego.png (LSB)
def hide_lsb(text, outfile):
    img = Image.new('RGB', (200, 200), color='blue')
    pixels = img.load()
    binary = ''.join([format(ord(c), '08b') for c in text]) + '00000000'
    idx = 0
    for y in range(img.size[1]):
        for x in range(img.size[0]):
            r, g, b = pixels[x, y]
            if idx < len(binary):
                r = (r & ~1) | int(binary[idx])
                idx += 1
            if idx < len(binary):
                g = (g & ~1) | int(binary[idx])
                idx += 1
            if idx < len(binary):
                b = (b & ~1) | int(binary[idx])
                idx += 1
            pixels[x, y] = (r, g, b)
    img.save(outfile)

hide_lsb(flags[4], 'assets/challenges/stego.png')
hide_lsb(flags[10], 'assets/challenges/final_image.png')

# 5. audio.wav (LSB)
sample_rate = 44100
n_samples = 44100 * 2
with wave.open('assets/challenges/audio.wav', 'w') as f:
    f.setnchannels(1)
    f.setsampwidth(2)
    f.setframerate(sample_rate)
    
    binary = ''.join([format(ord(c), '08b') for c in flags[5]]) + '00000000'
    idx = 0
    for _ in range(n_samples):
        val = 0
        if idx < len(binary):
            val = (val & ~1) | int(binary[idx])
            idx += 1
        f.writeframes(struct.pack('h', val))

# 8. Layers Payload
b64 = base64.b64encode(flags[8].encode()).decode()
rot13 = codecs.encode(b64, 'rot_13')
hex_payload = rot13.encode().hex()
print(f"Ch 8 Payload: {hex_payload}")

print("Assets Generated Successfully!")
