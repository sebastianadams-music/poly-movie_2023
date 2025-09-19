const fs = require('fs')
const readline = require('readline') 
const Max = require('max-api')

const db = "/Volumes/seb/Projects/9Code/youtube-history-dl/yt_dlp_log copy.txt"
// const db = "/Volumes/My Passport/youtube-dl/log.txt" // don't know where this file has gone 

const newBasePath = "/Volumes/Main/CORPUS/CORPUS/VIDEO/ytHist_2022/" // adjust this path if the files have moved (remember, paths are hardcoded in the log file)

// Define available folders here
const AVAILABLE_FOLDERS = ["YT_Hist", "YT_HistPt2", "yt_Hist"]

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
    line = line.substr(line.indexOf(" ") + 1);
    let tags = strip_tags(line)
    tags = tags.split(", ")
    if (tags.length < 2) {
      continue
    }
    // console.log(tags)
    let file = line.substr(0, line.indexOf(","))

    // --- NEW CODE: Check if the file is in an available folder ---
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
    // --- END OF NEW CODE ---


     // Check for old paths and replace them with the new one
    if (file.includes("/Volumes/AdamsIRCAM/")) {
      file = file.replace("/Volumes/AdamsIRCAM/", newBasePath);
    } else if (file.includes("/Volumes/seb 1/")) {
      file = file.replace("/Volumes/seb 1/", newBasePath);
    }

    // console.log("search", search)
    for (let word in search){
      // console.log(search[word])
      if (tags.includes(search[word])){
        // console.log(tags)
        // console.log(search[word])
        console.log(file)
        Max.outlet(file)

      }

    }
  }



  }



async function textToArray(filename) {
    let search = []
    let fileStream = fs.createReadStream(filename)
    let rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });
      // Note: we use the crlfDelay option to recognize all instances of CR LF
      // ('\r\n') in input.txt as a single line break.
    
      for await (const line of rl) {
        // Each line in input.txt will be successively available here as `line`.
        search.push(line)
      }
      return search
    

}

function strip_tags(line) {
  let tags = line.substr(line.indexOf("TAGS") + 6);
  tags = tags.substr(0, tags.indexOf("'"))
  return tags
}
  