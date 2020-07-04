// write parser
// export as class

export class Parser {
    constructor() {
    }

    async getParsedFile(filename) {
        let getDocumentPromise = fetch(filename).then(this.parseFile).catch((err) => {
            throw new Error("Failed to parse incoming file correctly.");
        });

        return getDocumentPromise;
    }

    parseFile(resp) {
        let status = response.status;
        if (status < 200 || status > 300) {
            // does not account for caching :(
            throw new Error("Fetch did not succeed.");
        }

        let contents = resp.body;
        let lines = contents.split(/\r\n/).map((value) => value.trim());
        // read each line separately

        let title = lines[0];
        let tags = lines[1].split(",").map((value) => value.trim());

        // tha content
        const headerRegex = new RegExp(/^#+/, "gm");

        let content = [];
        let curHeaderLevel = 0;
        let activeContent = [];

        let target;

        for (const line of lines.split(2)) {
            // check if line is a header, and split into content appropriately
            const isHeaderline = line.match(headerRegex)[0];
            const headerLevel = isHeaderLine.length;
            if (headerLevel != 0) {
                if (activeContent.length < headerLevel) {
                    while (activeContent.length < headerLevel) {
                        activeContent[activeContent.length] = 1;
                    }
                } else {
                    while (activeContent.length > headerLevel) {
                        activeContent.pop();
                    }

                    activeContent[headerLevel - 1]++;
                }

                target = this.createHeaderIfNotExists(content, activeContent);
            }

            // target now contains the line which we are editing
            target.content.append("\n" + line);
        }

        return target;
    }

    /**
     * 
     * @param {Array[Number]} target - the section we wish to append
     * @param {Object} content - A nested set of Arrays representing our page sections
     * @returns {Object} - the section which we have just appended
     */
    createHeaderIfNotExists(target, content) {
        // start from root
        // see if we can go to the desired sub-index
        // if it does not exist, add a new section.
        // TODO: Figure out how to format sections.
        // content
        // title
        // children
        let curNode = content;
        for (const sectionNum of target) {
            if (curNode.children[sectionNum] == null) {
                curNode.children[sectionNum] = {
                    content: "",
                    title: "UNNAMED SECTION",
                    children: []
                };
            }

            curNode = curNode.children[sectionNum];
        }
    }
}