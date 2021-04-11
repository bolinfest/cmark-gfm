#!/bin/bash

# I don't really know how to integrate with cmake, so I'll start here.

cd $(git rev-parse --show-toplevel)

set -x

# Note this requires a normal build to have been done first to generate the
# build/src directory.

# Note that scanners.re is included in LIBRARY_SOURCES in src/CMakeLists.txt,
# but it has to be excluded from the sources passed to emcc.

# Note that all of my attempts to specify to create a standalone .wasm file
# that I could pass directly to compileStreaming() using the
# `-s SIDE_MODULE=1 -o web/cmark-gfm.wasm` flags to emcc, but loading it
# resulted in this error:
#
#     wasm module="GOT.mem" error: module is not an object
#
# Perhaps it is not reasonable to construct the second argument to
# instantiateStreaming() myself and I have to rely on the generated .js
# bootstrap?

# https://emscripten.org/docs/getting_started/FAQ.html#how-can-i-tell-when-the-page-is-fully-loaded-and-it-is-safe-to-call-compiled-functions
# was helpful once I gave up on `-o web/cmark-gfm.wasm`.
emcc \
  -Isrc \
  -Ibuild/src \
  src/cmark-gfm.c \
  src/cmark.c \
  src/node.c \
  src/iterator.c \
  src/blocks.c \
  src/inlines.c \
  src/scanners.c \
  src/utf8.c \
  src/buffer.c \
  src/references.c \
  src/footnotes.c \
  src/map.c \
  src/render.c \
  src/man.c \
  src/xml.c \
  src/html.c \
  src/commonmark.c \
  src/plaintext.c \
  src/latex.c \
  src/houdini_href_e.c \
  src/houdini_html_e.c \
  src/houdini_html_u.c \
  src/cmark_ctype.c \
  src/arena.c \
  src/linked_list.c \
  src/syntax_extension.c \
  src/registry.c \
  src/plugin.c \
  -Oz \
  -s ERROR_ON_UNDEFINED_SYMBOLS=1 \
  -s WASM=1 \
  -s ENVIRONMENT=web \
  -s MODULARIZE=1 \
  -s 'EXPORT_NAME="createMarkdownModule"' \
  -s "EXPORTED_FUNCTIONS=['_cmark_markdown_to_html', '_malloc', '_free']" \
  -s EXTRA_EXPORTED_RUNTIME_METHODS="['UTF8ToString', 'allocate', 'ALLOC_NORMAL', 'ALLOC_STACK', 'intArrayFromString']" \
  -s FILESYSTEM=0 \
  -DCMARK_GFM_STATIC_DEFINE \
  -DCMARK_GFM_EXTENSIONS_STATIC_DEFINE \
  -s ASSERTIONS=1 \
  -o web/cmark-gfm.js
