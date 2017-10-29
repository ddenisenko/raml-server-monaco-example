import _ = require("underscore");
import {atomUiLib as UI} from "atom-web-ui";

var lastSelectedCaption: string;
var inRender:boolean= false;

export interface RenderingOptions {
    showDescription?:boolean;
    showHeader?:boolean;
    collapsible?:boolean;
}

export abstract class Item {
    parent:Item;

    listeners:((i:Item)=>void) [] =[]

    abstract dispose():void

    constructor(protected _title:string,public description:string=""){

    }

    needsSeparateLabel(){
        return false;
    }

    detach(){
        this.dispose();
        this.children().forEach(x=> {
            x.detach()
        });
    }

    addListener(r:(i:Item)=>void){
        this.listeners.push(r);
    }

    removeListener(r:(i:Item)=>void){
        this.listeners=this.listeners.filter(x=>x!=r);
    }

    add(i:Item){

        throw new Error("Not supported")
    }

    root(){
        if (this.parent){
            return this.parent.root();
        }
        return this;
    }

    title(){
        return this._title;
    }

    children():Item[]{
        return [];
    }

    setDescription(desc:string){
        this.description=desc;
    }

    setTitle(t:string){
        this._title=t;
    }

    render(r: RenderingOptions ={}):UI.UIComponent{
        throw new Error("Not Implemented")
    }

    item(name:string):Item{
        return null;
    }

    setError(text:string){

    }

    clearErrors(){

    }

}

export class TypeDisplayItem extends Item{

    constructor(private detailsNode: any){
        super("Type " + detailsNode.title,"");
    }
    render(r:RenderingOptions){
        let container=new UI.WrapPanel();

        container.setCaption(this.title());

        return container;
    }
    dispose(){

    }
}

class Category extends Item {
    _children:Item[]=[];
    descriptionLabel:UI.UIComponent;
    subCategories: UI.UIComponent;
    _result:UI.Panel;

    add(i:Item){
        i.parent=this;
        this._children.push(i);
    }

    children(){
        return this._children;
    }
    plainChildren(){
        return this._children.filter(x=>!(x instanceof Category));
    }
    categories(){
        return this._children.filter(x=>(x instanceof Category));
    }

    item(name:string):Item{
        var it:Item;
        this._children.forEach(x=>{
            if (x.title()==name){
                it=x;
            }
            var rr=x.item(name);
            if (rr){
                it=rr;
            }
        });
        return it;
    }

    render(r:RenderingOptions={}):UI.UIComponent{
        var section=this.createSection(r);
        this._result=section;
        if (this.description&&r.showDescription){
            this.descriptionLabel=UI.label(this.description);
            section.addChild(this.descriptionLabel);
        }
        this.contributeTop(section);
        this.plainChildren().forEach(x=>this.addChild(section,x));

        var wrappedChild=this.createWrappedChild(section);
        this.subCategories=wrappedChild;
        var cats=this.categories()
        var remap={}
        cats.forEach(x=>remap[x.title()]=x);
        var newCats=[];
        if (remap["General"]){
            newCats.push(remap["General"]);
            delete remap["General"];
        }
        if (remap["Facets"]){
            newCats.push(remap["Facets"]);
            delete remap["Facets"];
        }
        for (var c in remap){
            newCats.push(remap[c]);
        }
        newCats.forEach(x=>this.addChild(wrappedChild,x));
        return section;
    }

    detach(){
        super.detach();
        this._result.dispose();
    }

    createSection(r:RenderingOptions):UI.Panel{
        if (r.showHeader) {
            return new UI.Section(<any>UI.h3(this.title()), false)
        }
        var pnl=new UI.Panel();
        pnl.setCaption(this.title());
        return pnl;
    }

    createWrappedChild(section:UI.UIComponent){
        return section;
    }

    addChild(section:UI.UIComponent, item:Item){
        var child=item.render();
        if (section instanceof UI.TabFolder){
            var tf=<UI.TabFolder>section;
            tf.add(child.caption(),UI.Icon.NONE,child);
        }
        else {
            if (item.needsSeparateLabel()){
                var firstLabel = UI.label(item.title());

                firstLabel.margin(0, 5, 0, 0);

                section.addChild(firstLabel);
                section.addChild(UI.label(item.description));
            }
            section.addChild(child);
        }
    }

    contributeTop(section:UI.Panel){

    }

    dispose():void{

    }

    setError(text:string){

    }

    clearErrors(){
        this._children.forEach(x=>x.clearErrors())
    }

    update(i:Item){

    }
}

class TopLevelNode extends Category{

    errorLabel:UI.TextElement<any>
    ep:UI.Panel=null;
    _panel:UI.Panel;
    _options:RenderingOptions;

    constructor(protected detailsNode: any){
        super(detailsNode.title,detailsNode.description);
    }

    detach(){
        super.detach();
        this._result.dispose();
    }

    createWrappedChild(section:UI.UIComponent){
        var tf=new UI.TabFolder()
        tf.setOnSelected(()=>{
            if (!inRender) {
                lastSelectedCaption = (tf.selectedComponent().caption());
            }
        });
        section.addChild(tf);
        return tf;
    }

    subCategoryByNameOrCreate(name:string){
        var item=_.find(this.children(),x=>x.title()==name);
        if (!item){
            var rs=new Category(name);
            this.add(rs);
            return rs;
        }
        return item;
    }

    addItemToCategory(name:string,it:Item){
        if (name==null){
            this._children.push(it);
            it.parent=this;
            return;
        }
        this.subCategoryByNameOrCreate(name).add(it);
    }

    contributeTop(section:UI.Panel){
        this.errorLabel=UI.label("",UI.Icon.BUG,UI.TextClasses.ERROR);
        this.ep=UI.hc(this.errorLabel);
        this.ep.setDisplay(false)
        section.addChild(this.ep);
    }

    render(r: RenderingOptions={}){
        inRender=true;
        try {
            var result = super.render(r);
            this._options = r;
            this._panel = <any>result;
            var tf = <UI.TabFolder>this.subCategories;
            for (var n = 0; n < tf.tabsCount(); n++) {
                var item = tf.get(n);
                if (item.header == lastSelectedCaption) {
                    tf.setSelectedIndex(n);
                    return result;
                }
            }
            var documentation="";
            if (this.detailsNode.description){
                documentation=this.detailsNode.description;
            }

            if (documentation.length&&!r.showDescription){
                result.addChild(UI.html("<hr/>"))
                result.addChild(UI.label(documentation,UI.Icon.INBOX,UI.TextClasses.SUBTLE))
            }
            this.update(this);
            return result;
        } finally {
            inRender=false;
        }
    }

    dispose():void{
        this.detailsNode=null;
    }

    update(i:Item){
        
    }
}

class CheckBox2 extends UI.CheckBox implements UI.IField<any>{

    setLabelWidth(n:number){
        this.setStyle("margin-left",(n+2)+"ch");
    }
}
class PropertyEditorInfo extends Item{

    constructor(protected outlineNode : any){
        super(outlineNode.title,outlineNode.description);
    }

    dispose(){
        this.outlineNode=null;
        this.fld.getBinding().removeListener(this.update)
    }

    errorLabel:UI.TextElement<any>
    descLabel:UI.TextElement<any>

    fld:UI.BasicComponent<any>;
    clearErrors(){
        this.setError(null);
    }
    setError(text:string){
        if (text){
            this.errorLabel.setText(text);
            this.errorLabel.setDisplay(true);
        }
        else{
            if (this.errorLabel) {
                this.errorLabel.setDisplay(false);
            }
        }
    }

    fromEditorToModel(newValue? : any, oldValue? : any){
        
    }

    toLocalValue(inputValue) {
        return inputValue;
    }

    toUIValue(value) {
        return value;
    }

    fromModelToEditor() {

        this.fld.getBinding().set(this.outlineNode.valueText);
    }
    rendered:boolean=false
    update=(newValue, oldValue)=>{
        if(!this.rendered) {
            return;
        }

        this.fromEditorToModel(newValue, oldValue);
    }

    render(){
        var container=new UI.WrapPanel();

        this.errorLabel=UI.label("",UI.Icon.BUG,UI.TextClasses.ERROR);
        this.errorLabel.setDisplay(false);
        this.errorLabel.setStyle("margin-left",(this._title.length+1)+"ch")

        var field=this.createField();

        this.fld=<UI.BasicComponent<any>>field;

        field.getBinding().addListener(this.update)

        container.setCaption(this.title());

        this.fromModelToEditor();

        container.addChild(field);

        container.addChild(this.errorLabel);

        this.rendered = true;

        return container;
    }

    createField():UI.IField<any>{
        return UI.texfField(this.needsSeparateLabel()?"":this.outlineNode.title,"",x=>{});
    }
}

class SimpleMultiEditor extends PropertyEditorInfo{
    fromEditorToModel() {
        
    }
    fromModelToEditor(){
        this.fld.getBinding().set(this.outlineNode.valueText);
    }
}
function escapeValue(v:string){
    if (v.length>0) {
        if (v.charAt(0) == "'") {
            return '"' + v + '"';
        }
        if (v.charAt(0) == '"') {
            return '"' + v + '"';
        }
    }
    if (v.indexOf(' ')!=-1||v.indexOf(',')!=-1){
        if (v.indexOf('"')==-1){
            return '"'+v+'"'
        }
        if (v.indexOf("'")==-1){
            return "'"+v+"'"
        }
    }
    return v;
}

class CheckBoxField extends PropertyEditorInfo{
    createField(){
        return new CheckBox2(this.outlineNode.title,UI.Icon.NONE,x=>{});
    }

    toUIValue(value: string): any {
        if(!value) {
            return false;
        }

        if((<any>value) === true || value.trim() === 'true') {
            return true;
        }

        return false;
    }

    toLocalValue(value: any): any {
        return value + "";
    }
}

class MarkdownFieldUI extends UI.AtomEditorElement implements UI.IField<any>{

    constructor(text:string, onchange:UI.EventHandler) {
        super(text, onchange);
        this.margin(0, 0, 6, 12);
        this.setMini(false);
        this.setStyle("min-height","100px");
        //this.setStyle("max-height","200px");
        this.setStyle("border","solid");
        this.setStyle("border-width","1px")
        this.setStyle("border-radius","2px");
        this.setStyle("font-size","1.15em")
        this.setStyle("border-color","rgba(0,0,0,0.2)");
        this.setGrammar('source.mdcustom');
    }

    setLabelWidth(){

    }
    setLabelHeight(){

    }
    setRequired(v:boolean){

    }
}
class XMLField extends UI.AtomEditorElement implements UI.IField<any>{

    constructor(text:string, onchange:UI.EventHandler) {
        super(text, onchange);
        this.margin(0, 0, 6, 12);
        this.setMini(false);
        this.setStyle("min-height","100px");
        //this.setStyle("max-height","200px");

        this.setStyle("border","solid");
        this.setStyle("border-width","1px")
        this.setStyle("border-radius","2px");
        this.setStyle("font-size","1.15em")
        this.setStyle("border-color","rgba(0,0,0,0.2)");
        this.setGrammar('text.xml');
    }



    setLabelWidth(){

    }
    setLabelHeight(){

    }
    setRequired(v:boolean){

    }
}
class JSONField extends UI.AtomEditorElement implements UI.IField<any>{

    constructor(text:string, onchange:UI.EventHandler) {
        super(text, onchange);
        this.margin(0, 0, 6, 12);
        this.setMini(false);
        this.setStyle("min-height","100px");
        //this.setStyle("max-height","200px");

        this.setStyle("border","solid");
        this.setStyle("border-width","1px")
        this.setStyle("border-radius","2px");
        this.setStyle("font-size","1.15em")
        this.setStyle("border-color","rgba(0,0,0,0.2)");
        this.setGrammar('source.json');
    }



    setLabelWidth(){

    }
    setLabelHeight(){

    }
    setRequired(v:boolean){

    }
}
class MarkdownField extends PropertyEditorInfo{
    createField(){
        var editor = new MarkdownFieldUI("",x=>{});
        return editor;
    }

    needsSeparateLabel(){
        return true;
    }

}
class ExampleField extends PropertyEditorInfo{
    constructor(outlineNode: any) {
        super(outlineNode);
    }

    createField(){
        var editor = new JSONField(this.outlineNode.valueText,x=>{});
        return editor;
    }

    needsSeparateLabel(){
        return true;
    }

    fromModelToEditor(){

    }

    fromEditorToModel(newValue? : any, oldValue? : any){

    }
}
class XMLExampleField extends PropertyEditorInfo{

    constructor(outlineNode: any) {
        super(outlineNode);
    }

    createField(){
        var editor = new XMLField(this.outlineNode.valueText,x=>{});
        return editor;
    }

    needsSeparateLabel(){
        return true;
    }

    fromModelToEditor(){

    }

    fromEditorToModel(newValue? : any, oldValue? : any){

    }
}
class XMLSchemaField extends PropertyEditorInfo{
    createField(){
        var editor = new XMLField("",x=>{});
        return editor;
    }

    needsSeparateLabel(){
        return true;
    }
}
class JSONSchemaField extends PropertyEditorInfo{
    createField(){
        let editor = new JSONField("",x=>{});
        return editor;
    }

    needsSeparateLabel(){
        return true;
    }
}
class SelectBox extends PropertyEditorInfo{

    constructor(protected outlineNode : any) {
        super(outlineNode)
    }

    createField(){
        let options= this.outlineNode.options?this.outlineNode.options:[];

        let select= new UI.SelectField(this.outlineNode.title,x=>{},"",UI.Icon.NONE,options);

        select.getActualField().setOptions(options)

        return select;
    }

}

class TypeSelectBox extends SelectBox {

    fromEditorToModel(newValue? : any, oldValue? : any){
        
    }
}

class TreeField extends UI.Panel implements UI.IField<any>{

    constructor(outlineNode : any) {
        super();

        var renderer={


            render(node : any){

                var left=UI.label(node.title,UI.Icon.CIRCUIT_BOARD,UI.TextClasses.HIGHLIGHT);

                var right=UI.label(node.valueText?(":"+node.valueText):"",
                    UI.Icon.NONE,UI.TextClasses.SUCCESS);

                var result=UI.hc(left,right);

                return result;
            }
        };

        var getChildren = (node : any) => {
            return node.children?node.children:[];
        }

        var viewer=UI.treeViewer(getChildren, renderer, x => x.title);

        var inputValue={
            children(){
                return [outlineNode];
            }
        }

        viewer.setInput(<any>inputValue);

        this.addChild(UI.label(outlineNode.title))

        this.addChild(viewer);
    }
    
    detach() {
        
    }
    
    render() {
        
    }

    setLabelWidth(){

    }
    setLabelHeight(){

    }
    setRequired(v:boolean){

    }
}
class StructuredField extends PropertyEditorInfo{

    createField(){

        let children = this.outlineNode.children;
        if (!children || children.length != 1) return null;

        var tm= new TreeField(children[0]);
        return tm;
    }
}

class LowLevelTreeField extends PropertyEditorInfo{

    createField(){
        let children = this.outlineNode.children;
        if (!children || children.length != 1) return null;

        var tm= new TreeField(children[0]);
        return tm;
    }
}

export function buildItem(detailsNode: any,dialog:boolean): any {
    let root = new TopLevelNode(detailsNode);

    if(detailsNode.children) {
        for (let child of detailsNode.children) {

            if (child.type == "CATEGORY") {

                let categoryName = child.title;
                if (child.children) {
                    for (let childOfChild of child.children) {
                        buildItemInCategory(childOfChild, root, categoryName);
                    }
                }

            } else {
                buildItemInCategory(child, root, null);
            }

        }
    }

    return root;
}

function buildItemInCategory(
    detailsNode: any, root: TopLevelNode, categoryName:string) {

    let item = null;

    if(detailsNode.type == "CHECKBOX"
        && (<any>detailsNode).valueText !== null) {
        item = new CheckBoxField(<any>detailsNode);
    }
    else if(detailsNode.type == "JSONSCHEMA"
        && (<any>detailsNode).valueText !== null) {
        item = new JSONSchemaField(<any>detailsNode);
    }
    else if(detailsNode.type == "XMLSCHEMA"
        && (<any>detailsNode).valueText !== null) {
        item = new XMLSchemaField(<any>detailsNode);
    }
    else if(detailsNode.type == "MARKDOWN"
        && (<any>detailsNode).valueText !== null) {
        item = new MarkdownField(<any>detailsNode);
    }
    else if(detailsNode.type == "SELECTBOX"
        && (<any>detailsNode).options !== null) {
        item = new SelectBox(<any>detailsNode);
    }
    else if(detailsNode.type == "MULTIEDITOR"
        && (<any>detailsNode).valueText !== null) {
        item = new SimpleMultiEditor(<any>detailsNode);
    }
    else if(detailsNode.type == "TREE") {
        item = new TreeField(detailsNode);
    }
    else if(detailsNode.type == "STRUCTURED") {
        item = new StructuredField(<any>detailsNode);
    }
    else if(detailsNode.type == "TYPEDISPLAY") {
        item = new TypeDisplayItem(detailsNode);
    }
    else if(detailsNode.type == "TYPESELECT"
        && (<any>detailsNode).valueText !== null) {
        item = new TypeSelectBox(<any>detailsNode);
    }
    else if(detailsNode.type == "JSONEXAMPLE"
        && (<any>detailsNode).valueText !== null) {
        item = new ExampleField(<any>detailsNode);
    }
    else if(detailsNode.type == "XMLEXAMPLE"
        && (<any>detailsNode).valueText !== null) {
        item = new XMLExampleField(<any>detailsNode);
    }
    else if(detailsNode.type == "ATTRIBUTETEXT"
        && (<any>detailsNode).valueText !== null) {
        item = new PropertyEditorInfo(<any>detailsNode);
    }

    if (item != null) {
        root.addItemToCategory(categoryName, item);
    } else {
        console.log("Can not recognize element " + detailsNode.type);
    }
}