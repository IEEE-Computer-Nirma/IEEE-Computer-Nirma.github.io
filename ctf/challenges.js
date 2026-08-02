// CyberSurge 2.0 / NovaHack CTF — Challenge Dataset
// Flags are NEVER stored here in raw format — only SHA-256 hashes are used for client-side verification.

const CHALLENGES = [
  {
    id: 1,
    title: "Read the Room",
    category: "Warmup",
    difficulty: "Easy",
    points: 50,
    time: "~5 min",
    icon: "◎",
    type: "manual",
    description: "Every hacker starts by inspecting hidden areas of the web page structure. A flag has been embedded inside an HTML comment on this site.",
    hint1: "Open the Developer Tools panel in your browser.",
    hint2: "Use DOM search to find comment tokens (`<!--`).",
    note: "Inspect page source elements using browser DevTools.",
    guide: `### 🛠️ Objective
Find the hidden comment in the DOM tree using browser DevTools.
`,
    flagHash: "907140bb17c162384a78ffb0094289e4ebbb12d5c9a8f110ab0761cea0b34e32"
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
    description: "Digital images carry rich embedded metadata structures (EXIF). Analyze the uploaded photo.jpg to find the hidden comment tag.",
    hint1: "Analyze the image structure for hidden EXIF metadata attributes.",
    hint2: "Look specifically for text attributes embedded inside user comment tags.",
    note: "Download photo.jpg below and inspect its embedded metadata.",
    guide: `### 🛠️ Objective
Extract embedded EXIF data from **photo.jpg** using command-line metadata tools or Python libraries.
`,
    flagHash: "eca7534215b8c4fe69006730539dede1539ff8abc2fb57f25fa9f60a4c3a1edd"
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
    description: "Modern Office documents (.docx) use OpenXML compressed zip formats. Inspect document properties and XML sub-files for hidden metadata.",
    hint1: "Modern docx files are compressed OpenXML archives.",
    hint2: "Inspect internal property files such as `docProps/core.xml`.",
    note: "Download document.docx below and inspect its inner XML metadata.",
    guide: `### 🛠️ Objective
Decompress the document archive or read Core Properties to retrieve the flag.
`,
    flagHash: "129a2232332ab881f8c3e70fcd4f4b7315099201ba80155b15d94eb5d5de376e"
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
    description: "Data has been hidden inside the Least Significant Bits (LSB) of the image's pixel channels. Extract the LSB stream to reveal the hidden text.",
    hint1: "Target the least significant bit of color channel values.",
    hint2: "Group extracted bits into 8-bit bytes to form ASCII text.",
    note: "Download stego.png below and extract the LSB bit stream.",
    script: `#!/usr/bin/env python3
# Challenge 4 — LSB Bit Extractor Template
from PIL import Image

img = Image.open("stego.png").convert("RGB")
pixels = img.load()
w, h = img.size

# Extract bit sequence from pixel channels
bits = []
# TODO: Iterate pixels and collect channel LSBs
`,
    flagHash: "1c1159e45a68e4525ba19f852e12fffc3dcb0452f59824712e52d90ef92bfe8c"
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
    description: "Audio signals can carry hidden data within uncompressed frame sample LSBs. Parse the WAV audio samples to extract the bitstream.",
    hint1: "Audio frame sample integers store hidden data in their low-order bits.",
    hint2: "Process audio sample arrays sequentially to accumulate bit groups.",
    note: "Download audio.wav below and parse sample frame LSBs.",
    script: `#!/usr/bin/env python3
# Challenge 5 — Audio LSB Parse Template
from scipy.io import wavfile

rate, data = wavfile.read("audio.wav")
# TODO: Extract least significant bits from audio samples
`,
    flagHash: "506acf8399d28d34acf8ddc52089224781943febb498e171ecc66333190598e9"
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
    description: "The script below fails to print the full flag due to a logic flaw in loop boundary evaluation. Analyze and correct the condition.",
    hint1: "Examine the index termination boundary of the string iteration.",
    hint2: "Ensure all character indices up to length - 1 are included.",
    note: "Find and fix the loop condition in the Python code below.",
    script: `#!/usr/bin/env python3
# Challenge 6 — Debug & Fix

secret = "flag{0ff_by_0n3_1s_cl4ss1c}"

result = ""
for i in range(len(secret)):
    # Logic issue: Check boundary iteration limits
    if i < len(secret) - 1:
        result += secret[i]

print("Output:", result)
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
    description: "An automated verification function tests candidate numerical credentials. Construct an automated loop to test all key search space combinations.",
    hint1: "Iterate across the entire numerical key space.",
    hint2: "Evaluate each candidate with check_pin until verification succeeds.",
    note: "Complete the brute force loop in Python.",
    script: `#!/usr/bin/env python3
# Challenge 7 — Key Space Search

def check_pin(pin):
    correct_pin = 7734
    if pin == correct_pin:
        print(f"[+] PIN Cracked: {pin:04d}")
        print("[+] FLAG: flag{brut3_f0rc3_w0rks_1n_s3c0nds}")
        return True
    return False

# TODO: Automate candidate testing loop
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
    description: "The cipher payload underwent multiple sequential encoding layers (Hex, ROT13, Base64). Perform reverse transformations to restore the plaintext.",
    hint1: "Identify the sequence of transformations applied to the payload.",
    hint2: "Reverse each encoding layer step-by-step.",
    note: "Decode payload: 4d7a6b754d3367664155786d7079393170514f684b326a307247416c73443d3d",
    guide: `### 🛠️ Payload
\`4d7a6b754d3367664155786d7079393170514f684b326a307247416c73443d3d\`
`,
    flagHash: "9d1588ea1c5bd301eb142c9e50151a6b4c6d619c9954a7025c84c04f19a7a6b3"
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
    description: "Client-side web applications transmit async requests to background endpoints. Monitor network traffic logs to inspect returned payload responses.",
    hint1: "Monitor active HTTP/XHR network requests.",
    hint2: "Inspect payload responses for hidden endpoint JSON fields.",
    note: "Inspect Network traffic in DevTools (F12).",
    guide: `### 🛠️ Objective
Capture network requests and examine JSON data endpoints.
`,
    flagHash: "4574e0f06dd4110a456a1a4a3db205314893e18eeda0af09c8f23455e61616f5"
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
    description: "The capstone challenge embeds an encoded payload inside image channel LSBs. Extract the hidden bitstream, convert to string data, and decode the payload.",
    hint1: "Extract LSB bitstream from image channels.",
    hint2: "Decode the extracted string payload to reveal the flag.",
    note: "Download final_image.png below.",
    script: `#!/usr/bin/env python3
# Challenge 10 — Capstone Extraction
from PIL import Image

img = Image.open("final_image.png").convert("RGB")
# TODO: Extract LSB stream and decode string payload
`,
    flagHash: "ced94b68bc82e3bf0c43cd04f9c001afb23777f8b073221df9af7747ce57c81c"
  }
];

window.challenges = CHALLENGES;
