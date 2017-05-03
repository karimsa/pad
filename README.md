# pad

Write legal documents in JSON.

**Motivation:** It's very difficult to manage ammendments to legal documents and
still manage to have them look the way you want them to. The idea is to separate the style
of the document from its actual content. So you can write & manage your contracts/documents
as JSON files, and then turn them into PDFs when needed.

*I built this for internal use at my startups, so it's not really abstracted. But if you have
an interest and want any features, let me know via the issues section.*

## CLI Usage

```
$ pad doc.json doc.pdf
```

This will open up a window with your document. Just fill in any blanks you need filled,
and then hit the checkmark in the bottom right. This will produce a proper PDF for you
to print/distribute.

## How to write the docs

You can write in standard JSON, where the document is separated into sections and each
section has a title and a body.

The document should always be:

```json
{
  "title": "The Title of Your Document",
  "body": /* another section goes here */
}
```

Bodies can be arrays or objects. If it is an object, it is formatted as nested sections.
If it is an array, string elements are treated as clauses and object elements are treated
as nested sections.

### Blanks

There is built-in support for all variables/definitions that you may need, just use handlebars
to define them. The name should be whatever the proper legal readable name is.

For example, in a doc where I need the company's name, I can do:

```json
{
  "title": "Contract",
  "body": [
    "{{ the \"Company\" }} is super cool."
  ]
}
```

This will become:

________________ (the "Company") is super cool.

## License

Licensed under MIT license.