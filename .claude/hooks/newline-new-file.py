#!/usr/bin/env python3
"""Make every newly created file end with a newline.

PostToolUse (Write): when the Write call created the file (tool_response.type == "create"),
append "\n" if the last byte is not one. Edits to existing files are left alone.
Its own errors never block.
"""
import json
import os
import sys


def main():
    data = json.load(sys.stdin)
    if data.get("tool_name") != "Write":
        return
    resp = data.get("tool_response")
    if not isinstance(resp, dict) or resp.get("type") != "create":
        return
    path = (data.get("tool_input") or {}).get("file_path")
    if not path or not os.path.isfile(path) or os.path.getsize(path) == 0:
        return
    with open(path, "rb+") as f:
        f.seek(-1, os.SEEK_END)
        if f.read(1) != b"\n":
            f.write(b"\n")


try:
    main()
except Exception:
    pass
sys.exit(0)
