export function copyTextToClipboard(text: string) {
    navigator.clipboard.writeText(text)
        .catch(err => {
            console.error("Failed to copy text: ", err);
        });
}