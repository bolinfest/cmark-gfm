#include "cmark-gfm.h"

// Values are declared with const rather than #define so they are proper symbols
// that can be exported via Emscripten.

const unsigned int CMARK_OPT_DEFAULT = 0;
const unsigned int CMARK_OPT_SOURCEPOS = (1 << 1);
const unsigned int CMARK_OPT_HARDBREAKS = (1 << 2);
const unsigned int CMARK_OPT_SAFE = (1 << 3);
const unsigned int CMARK_OPT_UNSAFE = (1 << 17);
const unsigned int CMARK_OPT_NOBREAKS = (1 << 4);
const unsigned int CMARK_OPT_NORMALIZE = (1 << 8);
const unsigned int CMARK_OPT_VALIDATE_UTF8 = (1 << 9);
const unsigned int CMARK_OPT_SMART = (1 << 10);
const unsigned int CMARK_OPT_GITHUB_PRE_LANG = (1 << 11);
const unsigned int CMARK_OPT_LIBERAL_HTML_TAG = (1 << 12);
const unsigned int CMARK_OPT_FOOTNOTES = (1 << 13);
const unsigned int CMARK_OPT_STRIKETHROUGH_DOUBLE_TILDE = (1 << 14);
const unsigned int CMARK_OPT_TABLE_PREFER_STYLE_ATTRIBUTES = (1 << 15);
const unsigned int CMARK_OPT_FULL_INFO_STRING = (1 << 16);
