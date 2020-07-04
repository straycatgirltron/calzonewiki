// this version of node does not support ES6 and so it doesn't work
// https://www.matteoagosti.com/blog/2013/02/24/writing-javascript-modules-for-both-browser-and-node/
// drop the node: https://stackoverflow.com/questions/42857778/how-do-you-run-mocha-tests-in-the-browser

class Parser {
    async getParsedFile(filename) {
        let docPromise = new Promise((res, rej) => {
            let readLocalFile = new XMLHttpRequest();
            readLocalFile.open("GET", filename, true);
            readLocalFile.send();
            console.log("related schpiel");
            console.log(filename);
            readLocalFile.onload = function() {
                console.log(readLocalFile.status);
                if (readLocalFile.readyState === XMLHttpRequest.DONE && (readLocalFile.status >= 200 && readLocalFile.status < 400)) {
                    console.log("read!");
                    res(readLocalFile.responseText);
                }
            }

            readLocalFile.onerror = function(e) {
                // should be AEL but whatever lol :)
                console.log("failed to read file contents. :(");
                console.log(e);
                rej(e);
            }
        });

        // "this" is lost when we pass execution to the promise
        let getDocumentPromise = docPromise.then(this.parseFile.bind(this)).catch((err) => {
            throw new Error("Failed to parse incoming file correctly: " + err.message + "\n");
        });

        return getDocumentPromise;
    }

    /**
     * 
     * @param {Array[Number]} target - the section we wish to append
     * @param {Object} content - A nested set of Arrays representing our page sections
     * @returns {Object} - the section which we have just appended
     */
    createHeaderIfNotExists(sectionNumber, content) {
        let curNode = content;
        for (const index of sectionNumber) {
            if (curNode.children[index] === undefined) {
                // insert a new node, which we need to traverse
                curNode.children[index] = {
                    content: "",
                    title: "UNNAMED SECTION",
                    children: []
                };
            }

            curNode = curNode.children[index];
        }

        return curNode;
    }

    parseFile(resp) {

        let contents = resp.trim();
        let lines = contents.split(/\r\n/).map((value) => value.trim());
        // read each line separately

        let title = lines[0];
        let tags = lines[1].split(",").map((value) => value.trim());

        // tha content
        const headerRegex = new RegExp(/^#+/, "gm");

        let content = {children: []};
        let sectionNumber = [];

        let target;

        for (const line of lines.slice(2)) {
            const isHeaderLine = line.match(headerRegex)[0];
            const headerLevel = isHeaderLine.length;

            // check if line is a header, and split into content appropriately
            if (headerLevel != 0) {
                if (sectionNumber.length < headerLevel) {
                    while (sectionNumber.length < headerLevel) {
                        sectionNumber[sectionNumber.length] = 0;
                    }
                } else {
                    while (sectionNumber.length > headerLevel) {
                        // decrease header level if we're backing out
                        sectionNumber.pop();
                    }

                    // if we're removing header levels then we've been here before -- increment last relevant header level
                    sectionNumber[headerLevel - 1]++;
                }

                // get the node we currently plan to modify
                target = this.createHeaderIfNotExists(sectionNumber, content);
            } else {

                // line belongs to currently active header. start writing.
                if (target !== undefined) {
                    target.content.append(line + "\n");
                }
            }
        }

        // should be parsed at this point

        return content;
    }
}