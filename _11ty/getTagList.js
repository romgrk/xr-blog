
module.exports = function(collection) {

  let tagSet = new Set();

  collection.getAll().forEach(function(item) {
    if ('tags' in item.data) {
      let tags = item.data.tags;

      tags = tags.filter(function(item) {
        switch(item) {
          // this list should match the `filter` list in tags.njk
          case 'all':
          case 'nav_en':
          case 'nav_fr':
          case 'post':
          case 'post_en':
          case 'post_fr':
          case 'post_skip':
            return false;
        }

        return true;
      });

      for (const tag of tags) {
        tagSet.add(tag);
      }
    }
  });

  // returning an array in addCollection works in Eleventy 0.5.3
  return [...tagSet];
};
