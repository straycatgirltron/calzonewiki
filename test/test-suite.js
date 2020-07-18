
// chai and parser will be avail on page
var parser = new Parser();

function getRelativeURL(targetURL) {
    let parentURL = window.location.href;
    let slashIndex = parentURL.lastIndexOf("/");
    parentURL = parentURL.substring(0, slashIndex + 1) + targetURL;
    return parentURL;
}

function compareChildren(actualChild, expectedChild) {
    chai.expect(actualChild.title).to.eql(expectedChild.title);
    chai.expect(actualChild.content).to.eql(expectedChild.content);
    const children = actualChild.children.length;
    chai.expect(children).to.eql(expectedChild.children.length);
    for (let i = 0; i < children; i++) {
        compareChildren(actualChild.children[i], expectedChild.children[i]);
    }
}

function compareEquality(actual, expected) {
    // both are root objects
    chai.expect(actual.title).to.eql(expected.title);
    chai.expect(actual.tags).to.eql(expected.tags);
    chai.expect(actual.children.length).to.eql(expected.children.length);
    chai.expect(actual.content).to.eql(expected.content);
    for (let i = 0; i < actual.children.length; i++) {
        compareChildren(actual.children[i], expected.children[i]);
    }
}

describe("Parser", function() {
    describe("#parseFile", function() {
        it("should read a title and related tags", async function() {
            let theMoney = await parser.getParsedFile(getRelativeURL("testfiles/title-only.txt"));

            const expectedResult = {
                title: "page title",
                tags: ["tag1", "tag2", "tag3"],
                content: "",
                children: []
            };

            console.log(theMoney);
            console.log(expectedResult);

            compareEquality(theMoney, expectedResult);
        })
        it("should read a single header from the provided file", async function() {
            let theMoney = await parser.getParsedFile(getRelativeURL("testfiles/single-header.txt"));
            
            const expectedResult = {
                title: "these lines are reserved",
                tags: ["for", "the", "title", "and", "tags"],
                content: "",
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

            compareEquality(theMoney, expectedResult);
        });

        it("should also handle any content associated with a header", async function() {
            let theMoney = await parser.getParsedFile(getRelativeURL("testfiles/single-header-with-content.txt"));

            const expectedResult = {
                title: "these lines are reserved",
                tags: ["tag1", "tag2", "tag3"],
                content: "",
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
            compareEquality(theMoney, expectedResult);
        });

        it("should preserve a sequence of headers", async function() {
            let theMoney = await parser.getParsedFile(getRelativeURL("testfiles/multiple-headers-same-level.txt"));

            const expectedResult = {
                title: "title",
                tags: ["tags"],
                content: "",
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

            compareEquality(theMoney, expectedResult);
        });

        it("should allow sections to be nested inside other sections", async function() {
            let theMoney = await parser.getParsedFile(getRelativeURL("testfiles/multiple-headers-different-levels.txt"));

            const expectedResult = {
                title: "multiple headers test",
                tags: ["test", "file", "ok"],
                content: "",
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

            compareEquality(theMoney, expectedResult);
        });

        it("should hold up to this stress test", async function() {
            let theMoney = await parser.getParsedFile(getRelativeURL("testfiles/stress-test.txt"));

            const expectedResult = {
                title: "How I achieved Autofellatio without Removing My Ribs",
                tags: ["autofellatio", "dick", "suction", "technique"],
                content: "",
                children: [
                    {
                        title: "My Story",
                        content: "I was born with a 357 inch penis. I found it difficult to blend in throughout my life, and I was often a subject of ridicule. It wasn't until my adolescent years that I realized what my gift could do. I could swing from trees, access out-of-reach items, and gain massive stat boosts by swooning the babes.",
                        children: [
                            {
                                title: "Addendum",
                                content: "All of this is real. Do not doubt me.",
                                children: []
                            }
                        ]
                    },

                    {
                        title: "The Sequence",
                        content: "My confidence only started building one day when I was carrying my flaccid schlong over to the market in a wheelbarrow, maybe two or three years back. Only in recent years could I manifest the confidence to do something as gutsy as that, and you can imagine that it was a great effort for me.",
                        children: [
                            {
                                title: "The Change",
                                content: "I instantly became erect after seeing a small coin *lodged* in the dirt (a personal, if humiliating fetish) and my massive member covered the road, stopping an ongoing robbery in its tracks. Imagine my shock at these events. Suddenly I realized that my burden was far from it.",
                                children: [
                                    {
                                        title: "Cum Channel",
                                        content: "i own a multimillion dollar media syndicate streaming church approved pornography into high schools",
                                        children: []
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            console.log(theMoney);
            console.log(expectedResult);

            compareEquality(theMoney, expectedResult);
            
        });

        it("should read a page summary and associate it with the content object", async function() {
            let theMoney = await parser.getParsedFile(getRelativeURL("testfiles/summary-no-header.txt"));

            const expectedResult = {
                title: "summary content test",
                tags: ["test", "title"],
                content: "this is the summary content which we do not want to nest there is a bit more of it i guess :)",
                children: [
                    {
                        title: "HEADER",
                        content: "oops now its over",
                        children: []
                    }
                ]
            };

            compareEquality(theMoney, expectedResult);
        });

        it("should be resilient if the user fucks up a header", async function() {
            let theMoney = await parser.getParsedFile(getRelativeURL("testfiles/skip-header-levels.txt"));

            const expectedResult = {
                title: "title",
                tags: ["tags"],
                content: "",
                children: [
                    {
                        title: "the first",
                        content: "content",
                        children: [
                            {
                                title: "UNNAMED SECTION",
                                content: "",
                                children: [
                                    {
                                        title: "THE THIRD",
                                        content: "what?",
                                        children: []
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            compareEquality(theMoney, expectedResult);

            let target = document.getElementById("test-zone");
            let result = await parser.getParsedFile(getRelativeURL("testfiles/dropzone.txt"));

            let elem = parser.generateElements(result);
            target.appendChild(elem);
        });
    });
});

describe("Stringstream", function() {
    describe("#readToTerminator", function() {
        it("should be have correctly if an empty string is passed in", function() {
            let stream = new Stringstream("");
            let [terminator, content] = stream.readToTerminator("");
            chai.expect(content).to.eql("");
            chai.expect(terminator).to.be.null;
            chai.expect(stream.getChar()).to.be.null;
        });

        it("should read an entire string if no terminators are available", function() {
            let parseString = "hello there!";
            let stream = new Stringstream(parseString);
            let [terminator, content] = stream.readToTerminator("");
            chai.expect(content).to.eql(parseString);
            chai.expect(terminator).to.be.null;
        });

        it("should stop reading once it reaches a terminator", function() {
            let parseString = "this is a space separated message";
            let stream = new Stringstream(parseString);
            let [terminator, content] = stream.readToTerminator(" ");
            chai.expect(content).to.eql("this");
            chai.expect(terminator).to.eql(" ");
        });
        
        it("should pick up where it left off", function() {
            let parseString = "i dont want to talk about the monkey";
            let stream = new Stringstream(parseString);
            
            let [terminator, content] = stream.readToTerminator(" ");
            chai.expect(content).to.eql("i");
            chai.expect(terminator).to.eql(" ");

            [terminator, content] = stream.readToTerminator(" ");
            chai.expect(content).to.eql("dont");
            chai.expect(terminator).to.eql(" ");

            [terminator, content] = stream.readToTerminator(" ");
            chai.expect(content).to.eql("want");
            chai.expect(terminator).to.eql(" ");

            [terminator, content] = stream.readToTerminator(" ");
            chai.expect(content).to.eql("to");
            chai.expect(terminator).to.eql(" ");

            [terminator, content] = stream.readToTerminator(" ");
            chai.expect(content).to.eql("talk");
            chai.expect(terminator).to.eql(" ");
        });

        it("should detect multiple terminators", function() {
            let parseString = "i [hate] the *media* and everything it does to (me)";
            let stream = new Stringstream(parseString);

            let terminators = "[*(";

            let [terminator, content] = stream.readToTerminator(terminators);
            chai.expect(content).to.eql("i ");
            chai.expect(terminator).to.eql("[");

            [terminator, content] = stream.readToTerminator(terminators);
            chai.expect(content).to.eql("hate] the ");
            chai.expect(terminator).to.eql("*");

            [terminator, content] = stream.readToTerminator(terminators);
            chai.expect(content).to.eql("media");
            chai.expect(terminator).to.eql("*");

            [terminator, content] = stream.readToTerminator(terminators);
            chai.expect(content).to.eql(" and everything it does to ");
            chai.expect(terminator).to.eql("(");
            
            [terminator, content] = stream.readToTerminator(terminators);
            chai.expect(content).to.eql("me)");
            chai.expect(terminator).to.be.null;
        });
    });

    describe("#regexRead", function() {
        it("should stop reading once it hits a matching bit of regex, returning matching groups correctly", function() {
            let parseString = "tw // [food]";
            let stream = new Stringstream(parseString);
            let match = stream.regexRead(new RegExp(/\[(.*)\]/));
            chai.expect(match[0]).to.eql("[food]");
            chai.expect(match[1]).to.eql("food");

            chai.expect(stream.getChar()).to.be.null;
        });

        it("should return a falsy value if there are no matching sequences", function() {
            let parseString = "this is what i do when im in horny mode";
            let stream = new Stringstream(parseString);
            let match = stream.regexRead(new RegExp(/\[(.*)\]/));
            chai.expect(match).to.be.null;
        });

        it("should not adjust the internal pointer if a match fails", function() {
            let parseString = "this is what i do when im in horny mode";
            let stream = new Stringstream(parseString);
            let match = stream.regexRead(new RegExp(/\[(.*)\]/));
            chai.expect(match).to.be.null;

            for (let i = 0; i < parseString.length; i++) {
                chai.expect(parseString.charAt(i)).to.eql(stream.getChar());
            }
        });
    });

    describe("#finalTests", function() {
        it("should hold up to a final stress test", function() {
            let parseString = "This is my **new page** that i [write] for you:)";
            let stream = new Stringstream(parseString);
            let terminators = "*[";

            let [terminator, content] = stream.readToTerminator(terminators);
            chai.expect(content).to.eql("This is my ");
            chai.expect(terminator).to.eql("*");

            stream.undoChar();

            let matches = stream.regexRead(new RegExp(/(\*\*?)(.*)\1/));
            chai.expect(matches[1]).to.eql("**");
            chai.expect(matches[2]).to.eql("new page");

            [terminator, content] = stream.readToTerminator(terminators);
            chai.expect(terminator).to.eql("[");
            chai.expect(content).to.eql(" that i ");

            stream.undoChar();

            matches = stream.regexRead(new RegExp(/\[(.*)\]/));
            console.log(matches);
            chai.expect(matches[1]).to.eql("write");
            
            [terminator, content] = stream.readToTerminator(terminators);
            chai.expect(terminator).to.be.null;
            chai.expect(content).to.eql(" for you:)");
        });
    });
});





