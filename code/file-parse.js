const readline = require('readline') 
const Max = require('max-api')
const fs = require('fs');
const fsp = require('fs').promises;

const db = "/Volumes/seb/Projects/9Code/youtube-history-dl/yt_dlp_log copy.txt"
// const db = "/Volumes/My Passport/youtube-dl/log.txt" // don't know where this file has gone 

const newBasePath = "/Volumes/AdamsPortable/" // adjust this path if the files have moved (remember, paths are hardcoded in the log file)

// Define available folders here
const AVAILABLE_FOLDERS = ["YT_Hist", "YT_HistPt2", "yt_Hist"]

// Define folders to exclude based on string matching
const EXCLUDED_FOLDERS = ["HoldingLocation"]


main()

async function main() {
    // osc_startup() - shouldn't need this
    textToArray("youtube-history-dl.txt") // this is the searchword file, not a
    .then((search) => {
      let data = fs.createReadStream(db)
      let rl = readline.createInterface({
        input: data,
        crlfDelay: Infinity
      })
      dbLineLoop(rl, search)
    })
}

async function dbLineLoop(rl, search) {
  var notAFile = []

  for await (var line of rl) {
    if (line.includes("video missing")) {
      continue
    }
    if (line.includes("https://www")) {
      continue
    }
    if (line.length < 1){
      continue
    }

    // --- Start of corrected parsing and checking logic ---
    const originalLine = line.substr(line.indexOf(" ") + 1);
    const tags = strip_tags(originalLine)

    if (tags.length < 2) {
      continue
    }
    
    const file = originalLine.split(",")[0];
    
    // Check for excluded folders first
    let isExcluded = false;
    for (const folder of EXCLUDED_FOLDERS) {
        if (file.includes(folder)) {
            isExcluded = true;
            break;
        }
    }
    if (isExcluded) {
        continue;
    }

    // Check for available folders
    let isAvailable = false;
    for (const folder of AVAILABLE_FOLDERS) {
      if (file.includes(folder)) {
        isAvailable = true;
        break;
      }
    }
    if (!isAvailable) {
      continue;
    }

    // Apply path replacement
    let processedFile = file;
    if (processedFile.includes("/Volumes/AdamsIRCAM/")) {
      processedFile = processedFile.replace("/Volumes/AdamsIRCAM/", newBasePath);
    } else if (processedFile.includes("/Volumes/seb 1/")) {
      processedFile = processedFile.replace("/Volumes/seb 1/", newBasePath);
    }

    // Check if the file exists on the disk
    try {
        await fsp.access(processedFile);
    } catch (error) {
        notAFile.push(`file ${processedFile} doesn't exist`);
        continue;
    }

    // Iterate through search terms and output matches
    for (let word of search){
      if (tags.some(tag => tag.toLowerCase().includes(word.toLowerCase()))) {
        Max.post(tags)
        Max.post(word)
        Max.post(processedFile)
        Max.outlet(processedFile)
      }
    }
  }

  Max.post("Files not found:")
  Max.post(notAFile)
}

async function textToArray(filename) {
    let search = []
    let fileStream = fs.createReadStream(filename)
    let rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });
      for await (const line of rl) {
        search.push(line)
      }
      return search
}

function strip_tags(line) {
    const tagsStartIndex = line.indexOf("TAGS");
    if (tagsStartIndex !== -1) {
        let tagsPart = line.substr(tagsStartIndex + 5);
        const durationIndex = tagsPart.indexOf("DURATION");
        if (durationIndex !== -1) {
            tagsPart = tagsPart.substr(0, durationIndex).trim();
        }
        return tagsPart.split(",").map(tag => tag.trim());
    }
    return [];
}