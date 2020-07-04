
// chai and parser will be avail on page
var parser = new Parser();

describe("Parser", function() {
    describe("#parseFile", function() {
        it("should read a single header from the provided file", async function() {
            let parentURL = window.location.href;
            console.log(parentURL);
            // strip the last bit and change it to the test name
            let slashIndex = parentURL.lastIndexOf("/");
            parentURL = parentURL.substring(0, slashIndex + 1);
            let theMoney = await parser.getParsedFile(parentURL + "single-header.txt");
            
            const expectedResult = {
                children: [
                    {
                        title: "THE TOP LEVEL HEADER",
                        content: "",
                        children: []
                    }
                ]
            };

            console.log(theMoney);

            chai.assert.equal(theMoney, expectedResult, "Returns expected parsed result.");
        });
    });
});


