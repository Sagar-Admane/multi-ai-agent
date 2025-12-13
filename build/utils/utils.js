export default function cleanJSON(str) {
    return str
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/\n/g, "")
        .replace(/\r/g, "")
        .trim();
}
