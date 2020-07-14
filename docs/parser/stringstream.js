// streamlike string handler with features for matching parsed elements
// TODO: write a test for it lol
class Stringstream {

    /**
     * Construct a new stringstream
     * @param {String} string - The string we wish to stream
     */
    constructor(string) {
        this.str = string;    
        this.index = 0;
        this.limit = this.str.length;    
    }

    /**
     * Reads forward in the stream until a desired character is found.
     * @param {*} terminator - A string containing all terminating characters.
     * @effects - adjusts the internal index to the character after the terminator
     * @returns {[char, String]} - The terminating character, and an ordered string with all characters processed.
     *                             char is null if terminating character is not found.
     */
    readToTerminator(terminator) {
        let nextChar;
        let term;

        let prevIndex = this.index;
        while (this.index < this.limit) {
            nextChar = this.str.charAt(this.index);
            term = terminator.indexOf(nextChar);
            if (term > -1) {
                return [terminator.charAt(term), this.str.substring(prevIndex, this.index++)];
            }

            this.index++;
        }
        
        return [null, this.str.substring(prevIndex)];
    }

    /**
     * Attempts to read the upcoming characters in the stream according to a regex pattern.
     * @param {RegExp} regexp - The regex expression used to parse the characters.
     * @effects - Advances the internal index past the detected expression if success, does nothing on fail.
     * @returns - The first match identified in the stream.
     */
    regexRead(regexp) {
        // whatever man i dont care man
        let result = this.str.substr(this.index).match(regexp);

        if (result) {
            // this should be fine i think :/
            this.index += result.index + result[0].length;
        }

        return result;
    }

    /**
     * Reads the next character in the stream, if available. Otherwise returns null.
     * @returns - next char or null
     */
    getChar() {
        if (this.index < this.limit) {
            return this.str.charAt(this.index++);
        }

        return null;
    }

    /**
     * Backs the internal pointer up by 1 char.
     */
    undoChar() {
        if (this.index > this.limit) {
            this.index = this.limit;
        }
        if (this.index > 0) {
            this.index--;
        }
    }
}