const moreThanThreePeriods = /\.{3,}/g;
// polyfill Array.isArray if necessary
if (!Array.isArray) {
    Array.isArray = (arg) => {
        return Object.prototype.toString.call(arg) === "[object Array]";
    };
}
const errorStr = "tried to join something other than a string or array, it was ignored in pathJoin's result";
/** An ISO-morphic path join that works everywhere */
export function pathJoin(...args) {
    return args
        .reduce((prev, val) => {
        if (typeof prev === "undefined") {
            return;
        }
        return typeof val === "string" || typeof val === "number"
            ? joinStringsWithSlash(prev, "" + val) // if string or number just keep as is
            : Array.isArray(val)
                ? joinStringsWithSlash(prev, pathJoin.apply(null, val)) // handle array with recursion
                : (console.error ? console.error(errorStr) : console.log(errorStr)) ||
                    "";
    }, "")
        .replace(moreThanThreePeriods, ".."); // join the resulting array together
}
function joinStringsWithSlash(str1, str2) {
    const str1isEmpty = !str1.length;
    const str1EndsInSlash = str1[str1.length - 1] === "/";
    const str2StartsWithSlash = str2[0] === "/";
    const res = (str1EndsInSlash && str2StartsWithSlash && str1 + str2.slice(1)) ||
        (!str1EndsInSlash &&
            !str2StartsWithSlash &&
            !str1isEmpty &&
            str1 + "/" + str2) ||
        str1 + str2;
    return res;
}
//# sourceMappingURL=path.js.map