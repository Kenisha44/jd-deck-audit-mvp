import fs from "fs";
import unzipper from "unzipper";
import { XMLParser } from "fast-xml-parser";

export async function parsePresentation(filePath) {

    const directory =
        await unzipper.Open.file(filePath);

    const parser =
        new XMLParser({
            ignoreAttributes: false
        });

    const slides = [];

    const slideFiles =
        directory.files.filter(file =>
            file.path.startsWith("ppt/slides/slide") &&
            file.path.endsWith(".xml")
        );

    slideFiles.sort((a,b)=>
        a.path.localeCompare(b.path)
    );

    for(const file of slideFiles){

        const xml =
            await file.buffer();

        const json =
            parser.parse(
                xml.toString()
            );

        const text=[];

        collectText(json,text);

        slides.push({

            number:
                slides.length+1,

            title:
                text[0] || `Slide ${slides.length+1}`,

            text:
                text.join("\n")

        });

    }

    return slides;

}

function collectText(node,text){

    if(!node) return;

    if(typeof node==="string"){

        if(node.trim()){

            text.push(node.trim());

        }

        return;

    }

    if(Array.isArray(node)){

        node.forEach(item=>

            collectText(item,text)

        );

        return;

    }

    Object.values(node).forEach(value=>

        collectText(value,text)

    );

}