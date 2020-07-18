// this version of node does not support ES6 and so it doesn't work
// https://www.matteoagosti.com/blog/2013/02/24/writing-javascript-modules-for-both-browser-and-node/
// drop the node: https://stackoverflow.com/questions/42857778/how-do-you-run-mocha-tests-in-the-browser

// account for content before sections -- main summary
class Parser {

    constructor() {
        this.PARSER_TERMINATORS = "*[!";
    }

    async getParsedFile(filename) {
        let docPromise = new Promise((res, rej) => {
            let readLocalFile = new XMLHttpRequest();
            readLocalFile.open("GET", filename, true);
            readLocalFile.send();
            readLocalFile.onload = function() {
                if (readLocalFile.readyState === XMLHttpRequest.DONE && (readLocalFile.status >= 200 && readLocalFile.status < 400)) {
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
            if (!curNode.children[index]) {
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

    /**
     * 
     * @param {Object} content - the page content.
     */
    refineContent(content) {
        content.content = content.content.trim();
        for (let child of content.children) {
            child.content = child.content.trim();
            this.refineContent(child);
        }
    }

    parseFile(resp) {
        let contents = resp.trim();
        let lines = contents.split(/\r?\n/).map((value) => value.trim());
        // read each line separately

        let title = lines[0];
        let tags = lines[1].split(",").map((value) => value.trim());

        // tha content
        const headerRegex = new RegExp(/^#+/, "gm");

        let content = {
            title: title,
            tags: tags,
            content: "",
            children: []
        };
        let sectionNumber = [];

        let target;

        for (let line of lines.slice(2)) {
            line = line.trim();
            let headerMatches = line.match(headerRegex);

            // check if line is a header, and split into content appropriately
            if (headerMatches) {
                const headerLevel = headerMatches[0].length;
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

                target.title = line.substring(headerLevel).trim();

            } else {

                // line belongs to currently active header. start writing.
                if (target) {
                    target.content += " " + line;
                } else {
                    // will only occur if inserting main summary
                    content.content += " " + line;
                }
            }
        }

        // should be parsed at this point

        this.refineContent(content);

        return content;
    }

    /**
     * @param {Object} content - our parsed object
     * @returns {HTMLElement} - The root element for our page
     */
    generateElements(content) {
        // solve this problem recursively
        // recurse into subobjects, and elements.
        let pageContent = document.createElement("article");
        let header = document.createElement("h1");
        header.innerText = content.title;
        pageContent.appendChild(header);

        let tags = document.createElement("p");
        tags.innerText = "Tags: " + content.tags.join(", ");
        tags.classList.add("tags");
        pageContent.appendChild(tags);

        let summary = document.createElement("p");
        summary.classList.add("summary");
        summary.innerText = content.content;
        pageContent.appendChild(summary);
        
        for (let child of content.children) {
            // generate header in here
            let newSection = this.generateElementsRecursive(document.createElement("section"), child);
            pageContent.appendChild(newSection);
        }

        return pageContent;
    }

    generateElementsRecursive(element, content, headerLevel = 1) {
        // turn the content object into something stream-like
        // create some stream-like string reader class to match
        // good for formatting -- if we find a formatting rule
        // we can recurse and describe additional elements within

        // im not gonna parse headers though

        // impl:
            // read forward until we hit a formatting line
            // return the element associated with that formatting line
            // nest that element within element
            // pass that to another recursive call and pass the string stream
            // if we reach the end of the stream while parsing return null
            // element detaches and thats it

            // we could try writing several regex rules but that seems shitty
            // for the most part we can go char by char and only break out a regex rule
            // if we encounter something with nasty formatting
            // create a private local list of chars to parse and
            // only use regex when we encounter a character we need to parse
            // "[*!" for now

        // handling bulleted lists
            // bulleted lists are weird because we want all of our list elements to be
            // grouped together. not only that but a break in a bulleted list ("\r?\n")
            // should do pretty much nothing in other contexts.
            // that and indenting
            // could create another function which specifically handles list parsing
            // and escapes once it concludes that its at the end of a list (line which
            // does not start with "-")

            // whatever we use for that we could extend to enumerated lists as well
        let stream;

        if (typeof content === "object") {
            stream = new Stringstream(content.content);
            let header = document.createElement("h" + Math.min(headerLevel + 1, 6));
            header.innerText = content.title;
            element.appendChild(header);
        } else {
            // string
            stream = new Stringstream(content);
        }
            
        let terminator = true;  // need to give it a value which is not falsy
        let string_content;

        while (terminator) {
            [terminator, string_content] = stream.readToTerminator(this.PARSER_TERMINATORS);
            stream.undoChar();
            // append text to element
            let textNode = document.createTextNode(string_content);
            element.appendChild(textNode);

            // parsing is handled here -- factor out lol
            let regex;
            let match;

            switch (terminator) {
                case "*":
                    regex = new RegExp(/(\*+)(.*)\1/);
                    match = stream.regexRead(regex);
                    if (match) {
                        string_content = match[2];
                    } else {
                        // skip the character
                        textNode.appendData(stream.getChar());
                        break;
                    }
                    
                    let sub_elem;

                    switch (Math.min(match[1].length, 3)) {
                        case 1:
                            sub_elem = document.createElement("em");
                            this.generateElementsRecursive(sub_elem, string_content);
                            break;
                        case 2:
                            sub_elem = document.createElement("strong");
                            this.generateElementsRecursive(sub_elem, string_content);
                            break;
                        case 3:
                            // > 2
                            sub_elem = document.createElement("strong");
                            sub_elem.appendChild(document.createElement("em"));
                            sub_elem = sub_elem.children[0];
                            this.generateElementsRecursive(sub_elem, string_content);
                            sub_elem = sub_elem.parentElement;
                    }

                    element.appendChild(sub_elem);
                    break;

                case "[":
                    // attempt to match image
                    // if fails: just append
                    console.log("link");
                    regex = new RegExp(/\[(.*?)\]\((.*?)\)/)
                    match = stream.regexRead(regex);
                    if (match) {
                        let sub_elem = document.createElement("a");
                        sub_elem.href = match[2];
                        sub_elem.innerText = match[1];
                        element.appendChild(sub_elem);
                    } else {
                        textNode.appendData(stream.getChar());
                    }

                    break;

                case "!":
                    console.log("image");
                    regex = new RegExp(/\!\[(.*?)\]\((.*?)\)/);
                    match = stream.regexRead(regex);
                    if (match) {
                        let sub_elem = document.createElement("img");
                        sub_elem.src = match[2];
                        sub_elem.alt = match[1];
                        element.appendChild(sub_elem);
                    } else {
                        textNode.appendData(stream.getChar());
                    }
            }
        }

        if (typeof content === "object") {
            for (let child of content.children) {
                element.appendChild(this.generateElementsRecursive(document.createElement("section"), child, headerLevel + 1));
            }
        }

        return element;
    }
}