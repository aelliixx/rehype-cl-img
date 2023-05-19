# Rehype plugin for Contentlayer image processing

This rehype plugin simply copies images from Contentlayer documents to the Nextjs public folder.

## Typical usecase

Say you have a folder full of `.md` or `.mdx` files. You wish to use images in the body of those
documents. Problem is, Contentlayer only supports images defined in the frontmatter. Images defined
in the body will be searched for in the public folder. But if you want to keep your images in the same
folder structure as your markdown files (say you have a git submodule for all of your content), that is
not an option.

This plugin solves that by finding all of the images defined in your markdown body and copying them over
to the public folder.

## Usage
In your `contentlayer.config.js` include this:

```ts
export default makeSource({
    mdx: {
        rehypePlugins: [[rehypeClImg, {resourceDir: "/<subdirectory in public folder>", excludeDir: "<subdir to ignore>"}]]
    }
});
```

`rehypeClImg` accepts the following options:

`publicDir?: string`: is the name of your public directory. By default this is `public`.

`resourceDir: string`: is the desired subdirectory within the public folder where the images will be copied to.

`excludeDir?: string`: will be removed from the target directory path. For example, if you keep your images in an `*/images/*`
but don't want it to appear in the public directory (e.g. `/public/**/images/*`), you can add it to `excludeDir`.

### Example

Say you have the following file structure

```
├── app
├── public
└── contentlayer-pages
    └── documentation
        └── foobar
            ├── images
            │   └── foo.png
            └── bar.mdx
```

`foo.png` is referenced in `bar.mdx` as follows:

```md
![some alt text](images/foo.png)
```

With the following plugin settings:

```ts
rehypePlugins: [[rehypeClImg, {resourceDir: "docs", excludeDir: "images"}]]
```

the plugin will copy foo.png to the public folder and preserve its folder structure:

```
├── app
├── public
│   └── docs                    // This comes from 'resourceDir' setting
│       └── documentation
│           └── foobar          // 'images' subdirectory is ignored due to 'excludeDir' setting
│               └──foo.png
└── contentlayer-pages
    └── documentation
        └── foobar
            ├── images          // this subdirectory is ignored
            │   └── foo.png
            └── bar.mdx

```

Finally, the compiled html will look like this:

```html
<img alt="some alt text" loading="lazy" width="658" height="112" decoding="async" data-nimg="1" style="color:transparent" src="/docs/documentation/foobar/foo.png">
```

The `src="/docs/documentation/foobar/foo.png"` comes from the `resourceDir` setting.


