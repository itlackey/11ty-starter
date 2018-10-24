
module.exports = function (eleventyConfig) {
    var paths = require('./src/paths.json');
    var config = require('./src/data/config.json');
    var path = require('path');

    var dataPath = path.relative(paths.content, (paths.data || "../data"));
    var includesPath = path.relative(paths.content, (paths.themes) || "../themes") + "/" + (config.theme || "default");

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
              data: dataPath,
              includes:  includesPath
            },
            //jsDataFileSuffix: ".data"
        //     templateFormats : ["njk", "md"],
        //     htmlTemplateEngine : "njk",
        //     markdownTemplateEngine : "njk"
        //not needed -- passthroughFileCopy: true
    };
};