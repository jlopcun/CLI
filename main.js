const getQuery = className => document.querySelectorAll(className);
const elem = tag => document.createElement(tag);

const addClass = R.curry((className,element)=>{
    element.classList.add(className);
    return element
})
const attr = R.curry(function(attrName,attrValue,element){
    element.setAttribute(attrName,attrValue)
    return element
})
const listener = R.curry((eventType,cb,element)=>{
    element.addEventListener(eventType,cb)
    return element
})
const append = R.curry((node,element)=>{
    element.appendChild(node)
    return element
})
const alt = R.curry((alt,element)=>{
    element.alt = alt
    return element
})
const src = R.curry((source,element)=>{
    element.src = source
    return element
})
const textNode = R.curry((txt,element)=>{
    element.textContent = txt
    return element
})
const commandText = R.curry((txt,classText,element)=>{
    append(R.compose(addClass(classText),textNode(txt))(elem('p')),element)
    return element
})
const openCloseCommand = (e) =>{
    e.target.classList.toggle('commandList__command__expandBtn--opened')
    e.target.closest('.commandList__command').classList.toggle('commandList__command--opened')
}
const Opener = R.curry((element)=>{
    const image = elem('img')
    
    append(R.compose(
        listener('click',openCloseCommand),
        src('../images/expand-button.png'),
        alt('expand'),
        addClass('commandList__command__expandBtn'),
    )(image),element)
    return element
})
const getCommands = async function(){
    try{
        const fetching = await fetch('../data.json'),
        json = await fetching.json(),
        response  = await json
        if(!fetching.ok) throw {
            status:fetching.status,
            statusText:fetching.statusText
        }
        return response
    }catch(err){
        console.warn(err.status+":"+err.statusText)
    }
}
const NormalCommand = function(name,nameClass,description,descriptionClass){
    return R.compose(
        commandText(description,descriptionClass),
        commandText(name,nameClass),
        attr('aria-label',`${name}:${description}`),
        attr('tabindex',0),
        addClass('commandList__command')
    )(elem('li'))
}
const MultiCommand = function(name,nameClass,vars,descriptionClass){
    return R.compose(
        append(R.compose(
            ...vars.map(vari=>{
                return append(NormalCommand(vari.name,nameClass,vari.description,descriptionClass))
            }),
            addClass('commandList__command__vars')
        )(elem('ul'))),
        commandText(name,'commandList__command__name'),
        Opener(),
        attr('tabindex',0),
        addClass('commandList__command')
    )(elem('li'))
}
const sortObjects = (arr,prop) => arr.sort((a,b)=>a[prop]>b[prop])
const app = function(state,output){
    view(sortObjects(state.commands,'name'),output[0])
}

const view = function(state,output){
    return state
    .map(cm=>cm.description
        ?NormalCommand(cm.name,'commandList__command__name',cm.description,'commandList__command__description')
        :MultiCommand(cm.name,'commandList__command__vars__var__name',cm.vars,'commandlist__command__vars__var__description'))
    .reduce((prev,act)=>append(act,output),output)
}

const ASYNC__CALL = (asyncVal,func,...params)=>asyncVal.then(val=>func(val,params))


ASYNC__CALL(getCommands(),app,getQuery('.commandList')[0])



