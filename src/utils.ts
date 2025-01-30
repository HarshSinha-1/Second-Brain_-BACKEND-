const pattern : string =  "qwilewqerttipoizxcbvnmugbcufw13600289718149";
const length = pattern.length;
export  default function genHashvalue(size: number) : string {
    let hash = "";
    for (let i = 0; i < size; i++) {
        hash += pattern[Math.floor(Math.random() * length)];
    }
    return hash;
}