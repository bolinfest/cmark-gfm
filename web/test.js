"use strict";

async function main() {
  const markdownToHtml = await createMarkdownToHtml();
  const markdownEl = document.getElementById("markdown");
  const htmlEl = document.getElementById("html");
  markdownEl.addEventListener("input", () => {
    htmlEl.value = markdownToHtml(markdownEl.value);
  });
}

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
  } = module;

  function cmark_markdown_to_html(markdown) {
    const bytes = intArrayFromString(markdown);
    const strPtr = allocate(bytes, ALLOC_NORMAL);
    // TODO(mbolin): Expose options from
    // https://github.com/github/cmark-gfm/blob/85d895289c5ab67f988ca659493a64abb5fec7b4/src/cmark-gfm.h#L673-L753
    const options = 0;
    const htmlPtr = _cmark_markdown_to_html(strPtr, bytes.length - 1, options);

    // How do we know if the string was longer? Check if next byte was \0?
    const html = UTF8ToString(htmlPtr, MAX_BYTES_TO_READ);

    _free(strPtr);
    _free(htmlPtr);

    return html;
  }

  return cmark_markdown_to_html;
}

main();
