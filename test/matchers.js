function fixWhitespace(string) {
    return string.trim()
        .replace("\r", "")
        .split("\n")
        .map(line => line.trim())
        .join("\n");
}

export default {
    toEqualImportable(received, argument) {
        const importable = received;
        const expectedImportable = fixWhitespace(argument);
        if (importable === expectedImportable) {
            return {
                pass: true,
                message: () => `expected the importable:\n${importable}\n`
                             + `not to be the importable:\n${argument}`
            };
        }
        return {
            pass: false,
            message: () => `expected the importable:\n${importable}\n`
                         + `to be the importable:\n${argument}`
        };
    }
};
