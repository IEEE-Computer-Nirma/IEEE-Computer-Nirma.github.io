// CyberSurge 2.0 / NovaHack CTF — Challenge Dataset
// Flags are NEVER stored here in raw format — only SHA-256 hashes are used for client-side verification.

const CHALLENGES = [
  {
    id: 1,
    title: "Read the Room",
    category: "Warmup",
    difficulty: "Easy",
    points: 50,
    time: "~3 min",
    icon: "◎",
    type: "manual",
    description: "Every hacker starts by reading source code. A flag is hidden inside the HTML of this website. Use your browser's developer tools to inspect the elements or view page source.",
    hint1: "Press F12 (or Right Click → Inspect). Switch to the 'Elements' or 'Sources' tab.",
    hint2: "Search for 'flag{' using Ctrl+F inside DevTools. HTML comments look like <!-- text -->.",
    note: "No programming required! Use browser DevTools (F12) to inspect the page HTML source.",
    guide: `### 🛠️ Recommended Method
1. Right-click anywhere on this page and select **Inspect** (or press \`F12\`).
2. Go to the **Elements** tab.
3. Press \`Ctrl + F\` (or \`Cmd + F\` on Mac) and type \`flag{\`.
4. Look for an HTML comment: \`<!-- flag{...} -->\`
`
  },
  {
    id: 2,
    title: "Say Cheese!",
    category: "Metadata",
    difficulty: "Easy",
    points: 100,
    time: "~8 min",
    icon: "⊡",
    attachment: "photo.jpg",
    type: "tool",
    description: "Photos taken on smartphones secretly store camera settings, timestamps, GPS coordinates, and comments in EXIF metadata. Download photo.jpg and inspect its EXIF data.",
    hint1: "You don't need code! Upload photo.jpg to an online viewer like https://exif.tools or use ExifTool.",
    hint2: "In Python, you can use: from PIL import Image; img = Image.open('photo.jpg'); exif = img._getexif(). Look for the UserComment or Comment tag.",
    note: "Download photo.jpg below and inspect its hidden metadata.",
    guide: `### 🛠️ Recommended Solution Methods

#### Option A: Online EXIF Viewer (Easiest)
1. Download **photo.jpg** below.
2. Visit an online viewer such as [exif.tools](https://exif.tools).
3. Upload **photo.jpg** and check the **UserComment** or **Comments** field.

#### Option B: Command Line (ExifTool)
\`\`\`bash
exiftool photo.jpg
\`\`\`

#### Option C: Python Script
\`\`\`python
from PIL import Image
from PIL.ExifTags import TAGS

img = Image.open("photo.jpg")
exif = img._getexif()
for tag_id, value in (exif.items() if exif else []):
    print(f"{TAGS.get(tag_id, tag_id)}: {value}")
\`\`\`
`,
    flagHash: "8df36887fc19527592c3935ace7ae327d045bf7937b4bb5701b51f5cf028c953"
  },
  {
    id: 3,
    title: "Track Changes",
    category: "Metadata",
    difficulty: "Easy",
    points: 100,
    time: "~8 min",
    icon: "⊞",
    attachment: "document.docx",
    type: "tool",
    description: "Microsoft Word (.docx) files are actually ZIP archives containing XML files. Metadata like author names, comments, and revision notes live inside docProps/core.xml.",
    hint1: "Rename document.docx to document.zip and extract it. Open docProps/core.xml in a text editor.",
    hint2: "Alternatively, open File Properties in Word / LibreOffice or use Python's python-docx library.",
    note: "Download document.docx below. Try unzipping it or inspecting document properties.",
    guide: `### 🛠️ Recommended Solution Methods

#### Option A: Unzip as an Archive (No tools needed)
1. Download **document.docx**.
2. Rename the file extension from \`document.docx\` to \`document.zip\`.
3. Extract the ZIP archive.
4. Navigate to \`docProps/core.xml\` and open it in Notepad or VS Code.
5. Search for \`flag{\`.

#### Option B: Python (python-docx)
\`\`\`python
from docx import Document

doc = Document("document.docx")
props = doc.core_properties
print("Author:", props.author)
print("Comments:", props.comments)
\`\`\`
`,
    flagHash: "b231bbb4d65d9b027d7cb90267219155db2305ec93f311b63b1f257eb9107d46"
  },
  {
    id: 4,
    title: "Between the Lines",
    category: "Steganography",
    difficulty: "Medium",
    points: 150,
    time: "~15 min",
    icon: "◫",
    attachment: "stego.png",
    type: "code",
    description: "LSB (Least Significant Bit) steganography hides secret data inside image pixels. By extracting the last bit of each pixel's Red channel, you can reconstruct ASCII characters.",
    hint1: "Extract (r & 1) for each pixel. Collect 8 bits at a time to form one ASCII character using chr(int(byte_str, 2)).",
    hint2: "You can also upload stego.png to online steganography tools like StegOnline.",
    note: "Download stego.png below. Write or run a python script to extract the LSB stream.",
    script: `#!/usr/bin/env python3
# Challenge 4 — Between the Lines
# Steganography LSB Extractor
# Requires: pip install Pillow

from PIL import Image

# 1. Load image pixels
img = Image.open("stego.png").convert("RGB")
pixels = img.load()
w, h = img.size

bits = []
# 2. Extract LSB of Red channel from first 256 pixels
for y in range(h):
    for x in range(w):
        r, g, b = pixels[x, y]
        bits.append(str(r & 1))
        if len(bits) >= 256:
            break
    if len(bits) >= 256:
        break

# 3. Convert 8-bit chunks into ASCII characters
message = ""
for i in range(0, len(bits) - 7, 8):
    byte = "".join(bits[i:i+8])
    message += chr(int(byte, 2))

print("Extracted Message:", message)
`,
    flagHash: "da81b2b65a2c481876be3c7a2280b809952bda9b8d04d20de01092cdc470b678"
  },
  {
    id: 5,
    title: "Can You Hear It?",
    category: "Steganography",
    difficulty: "Medium",
    points: 150,
    time: "~15 min",
    icon: "◎",
    attachment: "audio.wav",
    type: "code",
    description: "Audio steganography hides data inside sample values of uncompressed WAV audio. Extract the flag from audio.wav by checking the least significant bit (LSB) of audio frame samples.",
    hint1: "Read 16-bit audio samples. Extract sample_value & 1. Reconstruct bytes from 8-bit groups.",
    hint2: "Use Python's scipy.io.wavfile or standard wave library to read samples.",
    note: "Download audio.wav below. Use scipy or Python wave module to read frame LSBs.",
    script: `#!/usr/bin/env python3
# Challenge 5 — Can You Hear It?
# Audio Steganography LSB Extractor
# Requires: pip install scipy

from scipy.io import wavfile

# 1. Read WAV file samples
rate, data = wavfile.read("audio.wav")
print(f"Sample Rate: {rate} Hz, Total Samples: {len(data)}")

bits = []
# 2. Extract LSB from audio samples
for sample in data:
    bits.append(str(sample & 1))
    if len(bits) >= 256:
        break

# 3. Reconstruct text
message = ""
for i in range(0, len(bits) - 7, 8):
    byte = "".join(bits[i:i+8])
    message += chr(int(byte, 2))

print("Extracted Audio Message:", message)
`,
    flagHash: "3f6ded2a880863aaf731fcabf7198676af0ee1a335d447a492257218950d4949"
  },
  {
    id: 6,
    title: "Off By One",
    category: "Debug & Fix",
    difficulty: "Easy",
    points: 100,
    time: "~10 min",
    icon: "⊟",
    type: "code",
    description: "The Python script below has a common programming bug: an off-by-one error in a loop condition. Find the bug, fix the loop condition, and run the corrected code to reveal the full flag.",
    hint1: "Look closely at: if i < len(secret) - 1. Does len(secret) - 1 include the last character?",
    hint2: "Change - 1 to nothing (or use i < len(secret)) so the last character isn't dropped.",
    note: "Find and fix the loop boundary bug in the snippet below.",
    script: `#!/usr/bin/env python3
# Challenge 6 — Off By One
# BUGGY CODE: Fix the loop boundary to output the full flag!

secret = "flag{0ff_by_0n3_1s_cl4ss1c}"

result = ""
for i in range(len(secret)):
    # 🐛 BUG IS HERE: This condition stops 1 character too early!
    if i < len(secret) - 1:
        result += secret[i]

print("Result (Truncated):", result)

# TODO: Fix the condition above so it prints the full string:
# flag{0ff_by_0n3_1s_cl4ss1c}
`,
    flagHash: "a60a42d4a4daa96b7323de2e1eb3be62e7fed11ea0ee83bbd06eb79e1775678c"
  },
  {
    id: 7,
    title: "Brute Force 101",
    category: "Password Cracking",
    difficulty: "Easy",
    points: 100,
    time: "~10 min",
    icon: "⊕",
    type: "code",
    description: "A digital vault is secured by a 4-digit PIN (0000–9999). Complete the missing for-loop in the script below to test all 10,000 combinations against check_pin().",
    hint1: "Write a for loop from 0 to 9999 using range(10000).",
    hint2: "Inside the loop, call check_pin(pin). When check_pin returns True, break the loop.",
    note: "Complete the TODO section in the Python code below to crack the PIN.",
    script: `#!/usr/bin/env python3
# Challenge 7 — Brute Force 101
# Complete the brute-force loop below!

def check_pin(pin):
    """Simulates vault pin verification."""
    correct_pin = 7734
    if pin == correct_pin:
        print(f"[+] SUCCESS! PIN Cracked: {pin:04d}")
        print("[+] FLAG: flag{brut3_f0rc3_w0rks_1n_s3c0nds}")
        return True
    return False

print("Starting Brute Force Attack...")

# 🧩 TODO: Write a loop trying PINs from 0 to 9999
# for pin in range(10000):
#     if check_pin(pin):
#         break
`,
    flagHash: "b841c2e2bc832490ca5cd4dfb5131cb2e0923eb4830d9c559dad01e475554a38"
  },
  {
    id: 8,
    title: "Layers",
    category: "Encoding",
    difficulty: "Medium",
    points: 150,
    time: "~12 min",
    icon: "⊜",
    type: "tool",
    description: "The secret string was encoded in 3 sequential steps: Hex → ROT13 → Base64. Work in reverse to decode: Base64 Decode → ROT13 → Hex Decode.",
    hint1: "Use CyberChef (https://gchq.github.io/CyberChef). Add operations: From Hex, ROT13, From Base64.",
    hint2: "Hex String to decode: 666c61677b6c3433723372335f6d346b33737d",
    note: "Solve using online tools like CyberChef or Python built-in modules.",
    guide: `### 🛠️ Recommended Solution Methods

#### Option A: CyberChef (Easiest)
1. Open [CyberChef](https://gchq.github.io/CyberChef).
2. Input the encoded string: \`666c61677b6c3433723372335f6d346b33737d\`
3. Add **From Hex** recipe.
4. Add **ROT13** recipe (amount 13).
5. Add **From Base64** recipe.

#### Option B: Python
\`\`\`python
import base64, codecs

encoded = "666c61677b6c3433723372335f6d346b33737d"

step1 = bytes.fromhex(encoded).decode()
step2 = codecs.encode(step1, "rot_13")
step3 = base64.b64decode(step2).decode()

print("Flag:", step3)
\`\`\`
`,
    flagHash: "f9f9eb70d03484ca2604b1049c5312b534f6b8bc7a4bfab96b5f87e7dc151261"
  },
  {
    id: 9,
    title: "Inspect Me",
    category: "Web Forensics",
    difficulty: "Medium",
    points: 150,
    time: "~12 min",
    icon: "◈",
    type: "manual",
    description: "Web applications frequently leak confidential data in background API requests. Use browser DevTools to inspect Network traffic and discover the hidden JSON response.",
    hint1: "Press F12 → Open the 'Network' tab → Refresh the page (Ctrl+R).",
    hint2: "Filter by 'Fetch/XHR'. Look for an API call to secret.json or /api/ctf/.",
    note: "No programming required! Inspect the Network tab in DevTools (F12).",
    guide: `### 🛠️ Recommended Solution Method
1. Press \`F12\` to open DevTools.
2. Click on the **Network** tab.
3. Select **Fetch/XHR** filter.
4. Reload the page (\`Ctrl + R\` / \`Cmd + R\`).
5. Click on \`secret.json\` in the network request list.
6. View the **Response** tab to find the JSON key \`"flag"\`.
`,
    flagHash: "8b3b6933ea9d16d0e8cd63c8375f586b1f1367a4468e5837feb3406761b1df37"
  },
  {
    id: 10,
    title: "The Long Way Round",
    category: "Combined",
    difficulty: "Hard",
    points: 200,
    time: "~20 min",
    icon: "◉",
    attachment: "final_image.png",
    type: "code",
    description: "The final challenge combines LSB Steganography and Base64 Encoding. Extract the LSB bitstream from final_image.png to obtain a Base64 string, then decode it to get the flag.",
    hint1: "Step 1: Extract LSB from red channel (like Challenge 4). You will get a string ending in '='.",
    hint2: "Step 2: Use base64.b64decode(extracted_str).decode() to decode the flag.",
    note: "Download final_image.png below. Combine Stego LSB extraction + Base64 decoding.",
    script: `#!/usr/bin/env python3
# Challenge 10 — Capstone: Stego + Base64
# Requires: pip install Pillow

from PIL import Image
import base64

# 1. Extract LSB stream from final_image.png
img = Image.open("final_image.png").convert("RGB")
pixels = img.load()
w, h = img.size

bits = []
for y in range(h):
    for x in range(w):
        r, g, b = pixels[x, y]
        bits.append(str(r & 1))
        if len(bits) >= 512:
            break
    if len(bits) >= 512:
        break

# 2. Convert bits to ASCII (Base64 string)
b64_str = ""
for i in range(0, len(bits) - 7, 8):
    byte = "".join(bits[i:i+8])
    b64_str += chr(int(byte, 2))

print("Extracted Base64 String:", b64_str)

# 3. Decode Base64
# flag = base64.b64decode(b64_str.strip()).decode()
# print("FLAG:", flag)
`,
    flagHash: "237b30e7680055f075decdebfae5f0a37609df973cefd5b2b37e4582f56052af"
  }
];

window.challenges = CHALLENGES;
