const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();
const PORT = 3000;
const URL = 'mongodb+srv://khola1pradhan:IXcI5Klb3qyoUKD3@cluster0.zzuekze.mongodb.net';

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

mongoose.connect(`${URL}/todolistDB`,{useNewUrlParser:true});

const listItemSchema = {
    // checked: Boolean,
    content: String,
}

const listSchema = {
    listName :String ,
    items:[listItemSchema]
}

const Item = mongoose.model("Item", listItemSchema);

const List= mongoose.model("List" , listSchema);

const item1 = new Item({
    // checked : false ,
    content: 'Running 2KM'
});

const item2 = new Item({
    // checked: false,
    content: 'Debate'
});

const item3 = new Item({
    // checked: false,
    content: 'Party'
});

const item4 = new Item({
    // checked: false,
    content: 'Study 2Hrs'
});
const item5 = new Item({
    // checked: false,
    content: 'Learn OS'
});

const homeDefaultList = [item1,item2,item3];
const workDefaultList = [item4,item5];

const insertDefaultItems = async (items) => {
    try{
        await Item.insertMany(items);
    }catch(err){
        console.log(`Error in inserting default Items ${err}`);
    }
}

const insertItem = async (itemContent) => {
    try{
        const item = new Item({
            content: itemContent
        });
        item.save();
    }catch(err){
        console.error('Error in saving Item', err);
    }
}

const deleteItem = async (item_id) => {
    try{
        filter = {_id: item_id};
        await Item.deleteOne(filter);
    }catch(err){
        console.error(`Error deleting the item ${err}`);
    }
}


app.get('/',async (req,res) => {
    const items = await Item.find({});
    // console.log(items);
    if(items.length === 0){
        insertDefaultItems(homeDefaultList);
        res.redirect('/');
    }else{
        res.render('index.ejs',{listName:'Today',listItems:items});
    }
});

app.post('/delete',async (req,res) =>{
    try{
        // console.log(req.body);
        const item_id = req.body['checkbox'];
        const customListName = req.body['listName'];

        if(customListName === 'Today'){
            await deleteItem(item_id);
            res.redirect('/');
        }else{
            const filter = {listName: customListName};
            await List.findOneAndUpdate(filter,{$pull:{items:{_id:item_id}}});
            res.redirect('/'+customListName);
        } 
    }catch(err){
        console.error("Error while deleting",err);
    }
});

app.get('/:customListName',async (req,res) => {
    let customListName = _.capitalize(req.params["customListName"]);
    const doc = await List.findOne({listName: customListName}).exec();
    if(!doc && customListName==='Work'){
        const list = new List({
            listName: customListName,
            items: workDefaultList
        });
        await list.save();
        res.redirect('/'+customListName);
    }else if(!doc){
        const list = new List({
            listName: customListName,
            items: homeDefaultList
        });
        await list.save();
        res.redirect('/'+customListName);
    }else{
        res.render('index.ejs',{listName: customListName,listItems: doc.items});
    }
    
});

app.post('/',async (req,res) => {
    const itemName = req.body['newItem'];
    const customListName = req.body['list'];
    // console.log(customListName);

    const item = new Item({
        content: itemName
    });

    if(customListName === "Today"){
        item.save();
        res.redirect('/');
    }else{
        let doc = await List.findOne({listName: customListName}).exec();
        doc.items.push(item);
        await doc.save();
        res.redirect('/'+customListName);  
    }    
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});