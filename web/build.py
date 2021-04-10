#!/usr/bin/env python3

import os.path
import subprocess

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


def create_export_arg(symbol_list):
    return ", ".join(map(lambda x: f"'{x}'", symbol_list))


def build_wasm():
    cwd = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    exported_functions = create_export_arg(
        [
            "_cmark_markdown_to_html",
            "_malloc",
            "_free",
        ]
    )
    exported_methods = create_export_arg(
        [
            "UTF8ToString",
            "allocate",
            "ALLOC_NORMAL",
            "ALLOC_STACK",
            "intArrayFromString",
        ],
    )

    flat_map = lambda f, xs: sum(map(f, xs), [])
    emcc_args = flat_map(
        lambda x: ["-s", x],
        [
            "ERROR_ON_UNDEFINED_SYMBOLS=1",
            "WASM=1",
            "ENVIRONMENT=web",
            "MODULARIZE=1",
            "EXPORT_NAME=createMarkdownModule",
            f"EXPORTED_FUNCTIONS=[{exported_functions}]",
            f"EXTRA_EXPORTED_RUNTIME_METHODS=[{exported_methods}]",
            "FILESYSTEM=0",
            "ASSERTIONS=1",
        ],
    )

    optimization_args = ["-Oz"]

    include_args = [
        "-Isrc",
        "-Ibuild/src",
    ]

    srcs_args = [
        "src/emscripten_exports.cpp",
        "src/cmark.c",
        "src/node.c",
        "src/iterator.c",
        "src/blocks.c",
        "src/inlines.c",
        "src/scanners.c",
        "src/utf8.c",
        "src/buffer.c",
        "src/references.c",
        "src/footnotes.c",
        "src/map.c",
        "src/render.c",
        "src/man.c",
        "src/xml.c",
        "src/html.c",
        "src/commonmark.c",
        "src/plaintext.c",
        "src/latex.c",
        "src/houdini_href_e.c",
        "src/houdini_html_e.c",
        "src/houdini_html_u.c",
        "src/cmark_ctype.c",
        "src/arena.c",
        "src/linked_list.c",
        "src/syntax_extension.c",
        "src/registry.c",
        "src/plugin.c",
    ]

    define_args_copied_from_cmake = [
        "-DCMARK_GFM_STATIC_DEFINE",
        "-DCMARK_GFM_EXTENSIONS_STATIC_DEFINE",
    ]

    output_args = ["-o", "web/cmark-gfm.js"]

    args = (
        # `emcc --bind`/Embind is used because that was the only way I could
        # figure out how to export const ints as opposed to functions.
        ["emcc", "--bind"]
        + emcc_args
        + optimization_args
        + include_args
        + srcs_args
        + define_args_copied_from_cmake
        + output_args
    )
    subprocess.run(args, cwd=cwd)


if __name__ == "__main__":
    build_wasm()
