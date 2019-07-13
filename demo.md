> Custom Renderer for [marked](https://github.com/chjj/marked) allowing for printing Markdown to the Terminal.
> Supports pretty tables and syntax highlighting.

# Header - level 1
## Header - level 2
### Header - level 3
#### Header - level 4
##### Header - level 5
###### Header - level 6

Emphasis, aka italics, with *asterisks* or _underscores_.

Strong emphasis, aka bold, with **asterisks** or __underscores__.

Combined emphasis with **asterisks and _underscores_**.

Strikethrough uses two tildes. ~~Scratch this.~~

### Unordered list

- Bullet list item
- Bullet list item
- Bullet list item
  - Use a two-space indent for nested lists

### Ordered list

1. Bullet list item
2. Bullet list item
3. Bullet list item
  1. Ordered lists can also be nested

### List with checkboxes

* [X] First 
* [X] Second
* [ ] Third

[I'm an link](https://www.google.com)
[I'm an link with title](https://www.google.com "Google's Homepage")

![I'm an image](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png " Title Text")

| Fist                |       Second        |               Third |
|:--------------------|:-------------------:|--------------------:|
| Left Align          |    Center Align     |         Right Align |
| Long Long Long Text | Long Long Long Text | Long Long Long Text |


> Blockquotes are very handy in email to emulate reply text.
> This line is part of the same quote.

Quote break.

> Oh, you can put **Markdown** into a blockquote. 

Horisontal Line `<hr>`
***

`This is inline code`

```js
function listitem(text, checkboxes) {
  const transform = compose(this.transform);
  const isNested = text.includes('\n');
  if (isNested) { text = text.trim(); }
  if (checkboxes) {
    return `\n${transform(text)}`;
  }
  return `\n${this.o.listitem(BULLET_POINT)}${transform(text)}`;
}
```

> Long line. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed efficitur sapien et volutpat molestie. Curabitur facilisis rutrum luctus. Ut nec justo dui