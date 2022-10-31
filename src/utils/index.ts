export function replaceSpecialCharacters(name: string){  
    let name2 =  name.replace( /[^a-zA-Z0-9.]/g, '')
    return name2
}