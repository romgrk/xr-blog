const fs = require('fs')
const pluginRss = require('@11ty/eleventy-plugin-rss')
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')

const format = require('date-fns/format')
const locales = {
  en: require('date-fns/locale/en'),
  fr: require('date-fns/locale/fr')
}

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

  eleventyConfig.addFilter("readableDate", readableDate)
  eleventyConfig.addFilter("longDate", longDate)
  eleventyConfig.addFilter('htmlDateString', htmlDateString)

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if( n < 0 ) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // Transforms an url to the target lang
  eleventyConfig.addFilter('urlForLang', (url, lang) => {
    return url.replace(/^\/\w+/, '/' + lang)
  });

  eleventyConfig.addFilter('localeURL', (url, lang) => {
    return `/${lang}${url}`
  });

  eleventyConfig.addCollection('tagList', require('./_11ty/getTagList'));

  eleventyConfig.addPassthroughCopy('img');
  eleventyConfig.addPassthroughCopy('css');
  eleventyConfig.addPassthroughCopy('fonts');

  /* Markdown Plugins */
  let markdownIt = require('markdown-it');
  let markdownItAnchor = require('markdown-it-anchor');
  let options = {
    html: true,
    breaks: true,
    linkify: true
  };
  let opts = {
    permalink: true,
    permalinkClass: 'direct-link',
    permalinkSymbol: '#'
  };

  eleventyConfig.setLibrary('md', markdownIt(options)
    .use(markdownItAnchor, opts)
  );

  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, browserSync) {
        const content_404 = fs.readFileSync('_site/404.html');

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.write(content_404);
          res.end();
        });
      }
    }
  });

  return {
    templateFormats: [
      'md',
      'njk',
      'html',
      'liquid'
    ],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: '/',

    markdownTemplateEngine: 'liquid',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    passthroughFileCopy: true,
    dir: {
      input: '.',
      includes: '_includes',
      data: '_data',
      output: '_site'
    }
  };
};


function readableDate(dateObj, lang) {
  return formatDate(dateObj, lang, 'D-MMM-YYYY')
}

function longDate(dateObj, lang) {
  if (lang === 'fr')
    return formatDate(dateObj, lang, 'D MMMM YYYY')
  return formatDate(dateObj, lang, 'MMMM D, YYYY')
}

function formatDate(dateObj, lang, formatStr) {
  return format(dateObj, formatStr, { locale: locales[lang] })
}

function htmlDateString(dateObj) {
  return format(dateObj, 'YYYY-MM-DD')
}
