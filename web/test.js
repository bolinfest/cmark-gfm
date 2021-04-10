"use strict";

async function main() {
  const markdownToHtml = await createMarkdownToHtml();
  const markdownEl = document.getElementById("markdown");
  const htmlEl = document.getElementById("html");
  const updateOutput = () => {
    htmlEl.value = markdownToHtml(markdownEl.value);
  };
  markdownEl.addEventListener("input", updateOutput);
  document.getElementById("options").addEventListener("change", updateOutput);
}

const OPTIONS = [
  "CMARK_OPT_SOURCEPOS",
  "CMARK_OPT_HARDBREAKS",
  "CMARK_OPT_NOBREAKS",
  "CMARK_OPT_VALIDATE_UTF8",
  "CMARK_OPT_SMART",
  "CMARK_OPT_GITHUB_PRE_LANG",
  "CMARK_OPT_LIBERAL_HTML_TAG",
  "CMARK_OPT_FOOTNOTES",
  "CMARK_OPT_STRIKETHROUGH_DOUBLE_TILDE",
  "CMARK_OPT_TABLE_PREFER_STYLE_ATTRIBUTES",
  "CMARK_OPT_FULL_INFO_STRING",
];

async function createMarkdownToHtml() {
  const module = await createMarkdownModule();

  const MAX_BYTES_TO_READ = 1_000_000;
  const {
    allocate,
    intArrayFromString,
    ALLOC_NORMAL,
    _cmark_markdown_to_html,
    UTF8ToString,
    _free,
    CMARK_OPT_DEFAULT,
  } = module;

  function getOptions() {
    let options = CMARK_OPT_DEFAULT;
    for (const option of OPTIONS) {
      const checkbox = document.getElementById(option);
      if (checkbox.checked) {
        const bitmask = module[option];
        options |= bitmask;
      }
    }
    return options;
  }

  function cmark_markdown_to_html(markdown) {
    const bytes = intArrayFromString(markdown);
    const strPtr = allocate(bytes, ALLOC_NORMAL);
    // TODO(mbolin): Expose options from
    // https://github.com/github/cmark-gfm/blob/85d895289c5ab67f988ca659493a64abb5fec7b4/src/cmark-gfm.h#L673-L753
    const options = CMARK_OPT_DEFAULT;
    const htmlPtr = _cmark_markdown_to_html(
      strPtr,
      bytes.length - 1,
      getOptions()
    );

    // How do we know if the string was longer? Check if next byte was \0?
    const html = UTF8ToString(htmlPtr, MAX_BYTES_TO_READ);

    _free(strPtr);
    _free(htmlPtr);

    return html;
  }

  return cmark_markdown_to_html;
}

main();
