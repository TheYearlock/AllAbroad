module.exports = function(eleventyConfig) {
  // Pass through file copy
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");

  // Custom collections for universities and countries
  eleventyConfig.addCollection("universities", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/universities/*.md");
  });

  eleventyConfig.addCollection("countries", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/countries/*.md");
  });

  return {
    dir: {
      input: "src",
      output: "docs",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data"
    },
    templateFormats: ["html", "md", "njk"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};
