
// chai and parser will be avail on page
var parser = new Parser();

function getRelativeURL(targetURL) {
    let parentURL = window.location.href;
    let slashIndex = parentURL.lastIndexOf("/");
    parentURL = parentURL.substring(0, slashIndex + 1) + targetURL;
    return parentURL;
}

describe("Parser", function() {
    describe("#parseFile", function() {
        it("should read a title and related tags", async function() {
            let theMoney = await parser.getParsedFile(getRelativeURL("title-only.txt"));

            const expectedResult = {
                title: "page title",
                tags: ["tag1", "tag2", "tag3"],
                children: []
            };

            console.log(theMoney);
            console.log(expectedResult);

            chai.expect(theMoney).to.eql(expectedResult);
        })
        it("should read a single header from the provided file", async function() {
            let theMoney = await parser.getParsedFile(getRelativeURL("single-header.txt"));
            
            const expectedResult = {
                title: "these lines are reserved",
                tags: ["for", "the", "title", "and", "tags"],
                children: [
                    {
                        title: "THE TOP LEVEL HEADER",
                        content: "",
                        children: []
                    }
                ]
            };

            console.log(theMoney);
            console.log(expectedResult);

            chai.expect(theMoney).to.eql(expectedResult);
        });

        it("should also handle any content associated with a header", async function() {
            let theMoney = await parser.getParsedFile(getRelativeURL("single-header-with-content.txt"));

            const expectedResult = {
                title: "these lines are reserved",
                tags: ["tag1", "tag2", "tag3"],
                children: [
                    {
                        title: "tobuscus",
                        content: "this is my diamond sword :)",
                        children: []
                    }
                ]
            };

            console.log(theMoney);
            console.log(expectedResult);
            chai.expect(theMoney).to.eql(expectedResult);
        });

        it("should preserve a sequence of headers", async function() {
            let theMoney = await parser.getParsedFile(getRelativeURL("multiple-headers-same-level.txt"));

            const expectedResult = {
                title: "title",
                tags: ["tags"],
                children: [
                    {
                        title: "TOP LEVEL CONTENT ONE",
                        content: "content for first section",
                        children: []
                    },

                    {
                        title: "TOP LEVEL CONTENT TWO",
                        content: "content for second section",
                        children: []
                    }
                ]
            };

            console.log(theMoney);
            console.log(expectedResult);

            chai.expect(theMoney).to.eql(expectedResult);
        });

        it("should allow sections to be nested inside other sections", async function() {
            let theMoney = await parser.getParsedFile(getRelativeURL("multiple-headers-different-levels.txt"));

            const expectedResult = {
                title: "multiple headers test",
                tags: ["test", "file", "ok"],
                children: [
                    {
                        title: "TOP LEVEL SECTION",
                        content: "this is the content associated with the top level section",
                        children: [
                            {
                                title: "SECOND LEVEL SECTION",
                                content: "this is the content associated with the nested section",
                                children: []
                            }
                        ]
                    }
                ]
            };

            console.log(theMoney);
            console.log(expectedResult);

            chai.expect(theMoney).to.eql(expectedResult);
        });
    });
});


