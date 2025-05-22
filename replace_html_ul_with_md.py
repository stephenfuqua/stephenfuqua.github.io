import os
import re

# Walk through all .md files in the directory tree
def find_md_files(root_dir):
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith(".md"):
                yield os.path.join(dirpath, filename)

def html_ul_to_md(text):
    # Pattern to match <ul>...</ul> blocks
    ul_pattern = re.compile(r"<ol>(.*?)</ol>", re.DOTALL | re.IGNORECASE)
    # Pattern to match <li>...</li> items
    li_pattern = re.compile(r"<li>(.*?)</li>", re.DOTALL | re.IGNORECASE)

    def ul_replacer(match):
        ul_content = match.group(1)
        items = li_pattern.findall(ul_content)
        # Clean up whitespace and convert to markdown numbers
        md_list = ["1. " + re.sub(r"\s+", " ", item.strip()) for item in items]
        return "\n".join(md_list)

    # Replace all <ul>...</ul> with markdown lists
    return ul_pattern.sub(ul_replacer, text)

def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    new_content = html_ul_to_md(content)
    if new_content != content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

if __name__ == "__main__":
    root = os.path.dirname(os.path.abspath(__file__))
    for md_file in find_md_files(root):
        process_file(md_file)
