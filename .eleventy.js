
module.exports = function (eleventyConfig) {
    var paths = require('./paths.json');
    var config = require('./src/data/config.json');

    //   // Add a date formatter filter to Nunjucks
    //   config.addFilter("dateDisplay", require("./filters/dates.js") );
    //   config.addFilter("timestamp", require("./filters/timestamp.js") );
    //   config.addFilter("squash", require("./filters/squash.js") );


    //eleventyConfig.addPassthroughCopy("src/themes/" + config.theme);

    // use a subdirectory, it’ll copy using the same directory structure.
    //eleventyConfig.addPassthroughCopy("css/fonts");

    return {
            dir: {
              input: paths.content || "src/site",
              output: paths.output || "dist",
              data: "../data",
              includes:  (paths.themes || "themes") + "/" + (config.theme || "default")
            },
            //jsDataFileSuffix: ".data"
        //     templateFormats : ["njk", "md"],
        //     htmlTemplateEngine : "njk",
        //     markdownTemplateEngine : "njk"
        //not needed -- passthroughFileCopy: true
    };
};